import { network } from "../config";
import BchWallet from 'minimal-slp-wallet/index.js';

export const sendBch = async ( receivers_address, amount, senders_mnemonic ) => {
  let trim_mnemonic = senders_mnemonic.trim();
  try {
    const bchWallet = new BchWallet(trim_mnemonic, {
      HdPath: network === "mainnet" ? "m/44'/145'/0'" : "m/44'/1'/0'"
    });
    await bchWallet.walletInfoPromise
    await bchWallet.initialize()
    const receivers = [{
      address : receivers_address, //in-form bitcoincash:....
      amount : amount //amount in satoshis
    }];
    const txid = await bchWallet.send(receivers);
    console.log(txid);
    return txid;
  } catch (e) {
    console.log(e);
    if (e.message && e.message.indexOf('Insufficient') > -1) {
      return "Insufficient balance on your BCH account."
    } else {
      return "error";
    }
  }
}

export const getBal = async ( senders_mnemonic ) => {
  let trim_mnemonic = senders_mnemonic.trim();
  try {
    const bchWallet = new BchWallet(trim_mnemonic, {
      HdPath: network === "mainnet" ? "m/44'/145'/0'" : "m/44'/1'/0'"
    });
    await bchWallet.walletInfoPromise
    await bchWallet.initialize()
    const bal = await bchWallet.getBal();
    console.log(bal);
    return bal;
  } catch (e) {
    console.log(e);
    return "error";
  }
}

//utxo in format 
// const utxo = {
//   txid: 'b94e1ff82eb5781f98296f0af2488ff06202f12ee92b0175963b8dba688d1b40',
//   vout: 0
// }

export const validateUtxo = async ( senders_mnemonic, utxo ) => {
  let trim_mnemonic = senders_mnemonic.trim();
  try {
    const bchWallet = new BchWallet(trim_mnemonic, {
      HdPath: network === "mainnet" ? "m/44'/145'/0'" : "m/44'/1'/0'"
    });
    await bchWallet.walletInfoPromise
    await bchWallet.initialize()
    const isValid = await bchWallet.utxoIsValid(utxo)
    console.log(isValid);
    return isValid ? "Spendable" : "Not Spendable";
  } catch (e) {
    console.log(e);
    return "error";
  }
}