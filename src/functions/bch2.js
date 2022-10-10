import { IS_DEV } from "../config";
import BigNumber from "bignumber.js";
const BCHJS = require("@psf/bch-js");
const BITBOX = require("bitbox-sdk").BITBOX;

export const toSatoshis = (amount) => {
  return new BigNumber(amount).multipliedBy(1e8);
};
export async function sendBch(
  SEND_ADDR,
  RECV_ADDR,
  Amount,
  bala,
  SEND_MNEMONIC,
  // txnCost
) {
  try {
    const NETWORK = IS_DEV ? "testnet" : "mainnet";
    let bchjs = new BCHJS({ restURL: IS_DEV ? "https://testnet3.fullstack.cash/v5/" : "https://bchn.fullstack.cash/v5/" });
    // Get the balance of the sending address.
    const balance = await getBchAccountBalance(SEND_ADDR, false);
    let AMT = toSatoshis(Amount);
    console.log(AMT.c[0]);

    // Exit if the balance is zero.
    if (balance <= 0.0) {
      console.log("Balance of sending address is zero. Exiting.");
      process.exit(0);
    }

    // If the user fails to specify a reciever address, just send the BCH back
    // to the origination address, so the example doesn't fail.
    if (RECV_ADDR === "") RECV_ADDR = SEND_ADDR;

    // Convert to a legacy address (needed to build transactions).
    // const SEND_ADDR_LEGACY = bchjs.Address.toLegacyAddress(SEND_ADDR);
    // const RECV_ADDR_LEGACY = bchjs.Address.toLegacyAddress(RECV_ADDR);

    let masterHDNode;
    const rootSeed = await bchjs.Mnemonic.toSeed(SEND_MNEMONIC);

    // consider network during keygen
    masterHDNode = bchjs.HDNode.fromSeed(rootSeed, NETWORK);

    // HDNode of BIP44 account
    const account = masterHDNode.derivePath(`m/44'/145'/0'/0/0`);

    // derive the first external change address HDNode which is going to spend utxo
    const cashAcc = bchjs.HDNode.toCashAddress(account);

    const utxos = await bchjs.Electrumx.utxo(cashAcc);

    if (utxos.utxos.length === 0) throw new Error("No UTXOs found.");

    // console.log(`u: ${JSON.stringify(u, null, 2)}`
    // const utxo = await findBiggestUtxo(utxos.utxos);

    // instance of transaction builder
    let transactionBuilder;
    if (NETWORK === "mainnet") {
      transactionBuilder = new bchjs.TransactionBuilder();
    } else transactionBuilder = new bchjs.TransactionBuilder(NETWORK);

    // const SATOSHIS_TO_SEND = AMT.c[0];

    // Essential variables of a transaction.
    const satoshisToSend = AMT.c[0];
    // const originalAmount = utxo.value;
    // const vout = utxo.tx_pos;
    // const txid = utxo.tx_hash;
    let sendAmount = 0;
    const inputs = [];

    utxos.utxos.map((e) => {
      const thisUtxo = e;

      inputs.push(thisUtxo);

      sendAmount += thisUtxo.value;

      transactionBuilder.addInput(thisUtxo.tx_hash, thisUtxo.tx_pos);
    });
    const feeOptions = await getFee(SEND_ADDR);
    const txFee = feeOptions.safe;
    // const remainder = originalAmount - satoshisToSend - txFee;

    if (sendAmount - txFee < 0) {
      console.log(
        "Transaction fee costs more combined UTXOs. Can't send transaction."
      );
      return;
    }
    // add output w/ address and amount to send
    transactionBuilder.addOutput(RECV_ADDR, satoshisToSend);
    transactionBuilder.addOutput(
      SEND_ADDR,
      sendAmount - satoshisToSend - txFee
    );

    // Generate a change address from a Mnemonic of a private key.
    const change = await changeAddrFromMnemonic(SEND_MNEMONIC);

    // Generate a keypair from the change address.
    const keyPair = bchjs.HDNode.toKeyPair(change);

    // Sign the transaction with the HD node.
    let redeemScript;
    inputs.forEach((input, index) => {
      transactionBuilder.sign(
        index,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        input.value
      );
    });
    // build tx
    const tx = transactionBuilder.build();
    // output rawhex
    const hex = tx.toHex();
    // console.log(`TX hex: ${hex}`);
    console.log("hex", hex);

    // Broadcast transation to the network
    const txidStr = await bchjs.RawTransactions.sendRawTransaction([hex]);
    // import from util.js file
    console.log(`Transaction ID: ${txidStr}`);
    console.log("");
    return txidStr;
  } catch (err) {
    console.log("error: ", err);
  }
}

export async function getBchAccountBalance(account_address) {
  //Fetch the BCH balance of the address
  try {
    console.log("Address from main page =", account_address);
    const bchjs = new BCHJS({ restURL: IS_DEV ? "https://testnet3.fullstack.cash/v5/" : "https://bchn.fullstack.cash/v5/" });
    const balance = await bchjs.Electrumx.balance(account_address);

    console.log(JSON.stringify(balance, null, 2));
    // response format {balance: 0.1, balanceSat: 10000000, totalReceived: 0.1, totalReceivedSat: 10000000, totalSent: 0, …}
    return toBCH(balance.balance.confirmed);
  } catch (err) {
    console.log(err);
    return "cannot compute";
  }
}

// function findBiggestUtxo(utxos) {
//   let largestAmount = 0;
//   let largestIndex = 0;

//   for (var i = 0; i < utxos.length; i++) {
//     const thisUtxo = utxos[i];

//     if (thisUtxo.value > largestAmount) {
//       largestAmount = thisUtxo.value;
//       largestIndex = i;
//     }
//   }
//
//   return utxos[largestIndex];
// }

function changeAddrFromMnemonic(mnemonic) {
  const bitbox = new BITBOX({ restURL: IS_DEV ? "https://testnet3.fullstack.cash/v5/" : "https://bchn.fullstack.cash/v5/" });
  // root seed buffer
  const rootSeed = bitbox.Mnemonic.toSeed(mnemonic);
  const NETWORK = IS_DEV ? "testnet" : "mainnet";
  // master HDNode
  let masterHDNode;
  // consider network during keygen
  masterHDNode = bitbox.HDNode.fromSeed(rootSeed, NETWORK);

  // HDNode of BIP44 account
  const account = bitbox.HDNode.derivePath(masterHDNode, "m/44'/145'/0'");

  // derive the first external change address HDNode which is going to spend utxo
  const change = bitbox.HDNode.derivePath(account, "0/0");

  return change;
}

export const toBCH = (amount) => {
  return new BigNumber(amount).dividedBy(1e8);
};

///senders public addr = cashAcc
export function getFee (cashAcc) {
  return new Promise(async function (resolve, reject) {
    try {
      console.log('cash', cashAcc)
      if(cashAcc === undefined){
        resolve({
          avg: 0,
          fast: 0,
          safe: 0,
        })
      }
      let bchjs = new BCHJS({ restURL: IS_DEV ? "https://testnet3.fullstack.cash/v5/" : "https://bchn.fullstack.cash/v5/" })
      const utxos = await bchjs.Electrumx.utxo(cashAcc)

      const byteCount = bchjs.BitcoinCash.getByteCount(
        { P2PKH: utxos.utxos.length },
        { P2PKH: 2 }
      )
      console.log(`Transaction byte count: ${byteCount}`)
      const satoshisPerByte = 2
      const fee = Math.floor(satoshisPerByte * byteCount)
      resolve({
        avg: new BigNumber(fee).plus(100).toNumber(),
        fast: new BigNumber(fee).plus(200).toNumber(),
        safe: new BigNumber(fee).toNumber(),
      })
    } catch (error) {
      reject(error)
    }
  })
}
