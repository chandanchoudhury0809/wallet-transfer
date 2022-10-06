import { network } from "../config";
import BchWallet from 'minimal-slp-wallet/index.js';

export const sendBch = async ( receivers_address, amount, senders_mnemonic ) => {
  let trim_mnemonic = senders_mnemonic.trim();
  try {
    const bchWallet = new BchWallet(trim_mnemonic, {
      HdPath: network === "mainnet" ? "m/44'/145'/0'" : "m/44'/1'/0'"
    });
    const receivers = [{
      address : `bitcoincash:${receivers_address}`,
      amount : amount
    }];
    const txid = await bchWallet.send(receivers);
    console.log(txid);
    return txid;
  } catch (e) {
    console.log(e);
    return "error";
  }
}
