import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing'; 

export const getWalletFromPrivateKey = async (privateKeyHex) => {
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, "sei");
    const address = (await wallet.getAccounts()).at(0).address;
    return address;
}

export const generateRandomHex = (size) => {
    let arr = new Uint8Array(size / 2); // Each byte will become two hex characters
    let rlt = "";
    for (let index = 0; index < 32; index++) {
        arr[index] = Math.floor(Math.random() * 255) + 1;
        rlt = rlt + arr[index].toString(16).padStart(2, '0');
    }
    // const tmp = await Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
    return rlt;
}
