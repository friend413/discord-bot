import mongoose from 'mongoose';
import { CosmJSOfflineSigner, getCosmWasmClient, getQueryClient, getSigningClient } from '@sei-js/core';
import { StargateClient } from '@cosmjs/stargate'; 
import {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,
} from 'discord-interactions';
import { User } from '../models/userModel.js';
import { generateRandomHex, getWalletFromPrivateKey } from '../utils/makeWallet.js';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing'; 
import { assertIsDeliverTxFailure, SigningStargateClient } from '@cosmjs/stargate'; 

import { Secp256k1, Random } from '@cosmjs/crypto';
import { fromBase64, toBase64, fromHex } from '@cosmjs/encoding'; 
import { allowIP } from '../utils/ufw.js'; 


async function createWalletFromPrivateKeyHex(privateKeyHex, prefix) {
    const privateKeyUint8Array = fromHex(privateKeyHex);
    return DirectSecp256k1Wallet.fromKey(privateKeyUint8Array, prefix);
}

export const paymentAddress = async (req, res) => {
    try {
        const {options, member} = req;
        User.findOne({id: member.user.id})
            .then(async (item) => {
                if( item == null ){
                    const privateKey = generateRandomHex(64);
                    const address = await getWalletFromPrivateKey(privateKey);
                    let now = new Date();
                    let current;
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, now.getDate());
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    }
                    const payment = {
                        address,
                        privateKey,
                        endDate: current,
                        balance: 0,
                    };
                    item = new User({
                        username: member.user.username,
                        avatar: member.user.avatar,
                        global_name: member.user.global_name,
                        id: member.user.id,
                        payment
                    });
                    User.create(item)
                        .then((rlt) => {
                            item = rlt;
                        })
                        .catch((err) => {
                            throw err;
                        })
                }
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Payment Address: "${item.payment?.address}"`,
                    },
                });
            })
    } catch (error) {
        throw error;
    }
}

export const paymentEndDate = async (req, res) => {
    // const { token, type, data } = req.body;
    try {
        const {options, member} = req;
        User.findOne({id: member.user.id})
            .then(async (item) => {
                if( item == null ){
                    const privateKey = generateRandomHex(64);
                    const address = await getWalletFromPrivateKey(privateKey);
                    let now = new Date();
                    let current;
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, now.getDate());
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    }
                    const payment = {
                        address,
                        privateKey,
                        endDate: current,
                        balance: 0,
                    };
                    item = new User({
                        username: member.user.username,
                        avatar: member.user.avatar,
                        global_name: member.user.global_name,
                        id: member.user.id,
                        payment
                    });
                    User.create(item)
                        .then((rlt) => {
                            item = rlt;
                        })
                        .catch((err) => {
                            throw err;
                        })
                }
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Deadline: "${item.payment?.endDate.toLocaleDateString()}"`,
                    },
                });
            })
    } catch (error) {
        throw error;
    }
}

export const paymentBalance = async (req, res) => {
    try {
        const {options, member} = req;
        User.findOne({id: member.user.id})
            .then(async (item) => {
                if( item == null ){
                    const privateKey = generateRandomHex(64);
                    const address = await getWalletFromPrivateKey(privateKey);
                    let now = new Date();
                    let current;
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, now.getDate());
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    }
                    const payment = {
                        address,
                        privateKey,
                        endDate: current,
                        balance: 0,
                    };
                    item = new User({
                        username: member.user.username,
                        avatar: member.user.avatar,
                        global_name: member.user.global_name,
                        id: member.user.id,
                        payment
                    });
                    User.create(item)
                        .then((rlt) => {
                            item = rlt;
                        })
                        .catch((err) => {
                            throw err;
                        })
                }
                const response = {
                    type: 5 // ACK with source
                };
        
                res.json(response);
                const client = await StargateClient.connect(process.env.RPCURL);

                // Fetch the balance
                const balance = await client.getAllBalances(item.payment.address);
                const seigmaBalance = await client.getBalance(item.payment.address, process.env.SEIGMATOKENDENOM)
                // Assuming the native token is what you're interested in, and it's the first in the list
                let rlt = "";
                let divisionNum = 1;
                for (let index = 0; index < process.env.SEIGMADECIMAL; index++) {
                    divisionNum = divisionNum * 10;
                }
                let messageData = {
                    content: "This is a follow-up message!",
                };
                if (balance.length > 0) {
                    const nativeToken = balance.find((ele) => ele.denom === 'usei');
                    messageData.content = `Wallet "${item.payment.address}".\r\n SEI amount: ${parseInt(nativeToken?.amount)/1000000.0}, SEIGMA amount: ${parseInt(seigmaBalance.amount)/(divisionNum*1.0)}.`
                } else {
                    messageData.content = `Wallet "${item.payment.address}".\r\n SEI amount: 0, SEIGMA amount: ${parseInt(seigmaBalance.amount)/(divisionNum*1.0)}.`
                }
                console.log(messageData);
                const applicationId = process.env.APP_ID;
                const interactionToken = req.token;
                const token = process.env.DISCORD_TOKEN;
                fetch(`https://discord.com/api/v8/webhooks/${applicationId}/${interactionToken}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageData),
                }).then(response => response.json())
                .catch(err => console.log(err))
            })
    } catch (error) {
        throw error;
    }
}

export const paymentSei = async (req, res) => {
    try {
        const {options, member} = req;
        User.findOne({id: member.user.id})
            .then(async (item) => {
                if( item == null ){
                    const privateKey = generateRandomHex(64);
                    const address = await getWalletFromPrivateKey(privateKey);
                    let now = new Date();
                    let current;
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, now.getDate());
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    }
                    const payment = {
                        address,
                        privateKey,
                        endDate: current,
                        balance: 0,
                    };
                    item = new User({
                        username: member.user.username,
                        avatar: member.user.avatar,
                        global_name: member.user.global_name,
                        id: member.user.id,
                        payment
                    });
                    User.create(item)
                        .then((rlt) => {
                            item = rlt;
                        })
                        .catch((err) => {
                            throw err;
                        })
                }
                const response = {
                    type: 5 // ACK with source
                };
        
                res.json(response);
                
                const prefix = 'sei'; // Prefix for the SEI network
                const gasLimit = 9000000;
                const amountToSend = process.env.SEIAMOUNTTOSEND;
                const tokenDenom = 'usei';
                const wallet = await createWalletFromPrivateKeyHex(item.payment.privateKey, prefix);
                // Connect to the SEI network
                const client = await SigningStargateClient.connectWithSigner(process.env.RPCURL, wallet);

                // Get the sender's account address
                const [firstAccount] = await wallet.getAccounts();
                const senderAddress = firstAccount.address;
                // Build and sign the transaction

                const account = await client.getAccount(senderAddress);
                if (!account) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Error Occured. Account not found`,
                        },
                    });
                }

                const amount = {
                    amount: amountToSend,
                    denom: tokenDenom,
                };
                const fee = {
                    amount: [{
                        denom: tokenDenom,
                        amount: "900000", // Adjust fee as necessary
                    }],
                    gas: gasLimit.toString(),
                };
                
                let messageData = {
                    content: "This is a follow-up message!",
                };
                try {
                    const result = await client.sendTokens(senderAddress, process.env.COLLECTIONWALLET, [amount], fee, "Sending native tokens");    
                    if(parseInt(result.code) != 0) throw 'error';
                    let date1 = new Date(Date.now());
                    let date2 = new Date(item.payment.endDate);
                    // Convert dates to timestamps and get the max value
                    let maxDate = new Date(Math.max(date1.getTime(), date2.getTime()));
                    // Create a new Date object to avoid modifying the original date
                    let nextMonthDate = new Date(maxDate);

                    // Increment the month
                    nextMonthDate.setMonth(maxDate.getMonth() + 1);

                    // Check if the month was correctly set (considering the scenario of going from January 31 to February 28/29)
                    // If the month is not as expected (it has skipped to the next month), correct the date by setting it to the last day of the previous month
                    if (nextMonthDate.getMonth() !== (maxDate.getMonth() + 1) % 12) {
                        nextMonthDate.setDate(0); // setDate(0) sets the date to the last day of the previous month
                    }
                    const upPayment = {
                        address: item.payment.address,
                        privateKey: item.payment.privateKey,
                        endDate: nextMonthDate,
                        balance: item.payment.balance
                    }
                    User.updateOne({_id: item._id}, {payment: upPayment})
                    .then((rlt) => {
                        // return res.send({
                        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        //     data: {
                        //         content: `Successful extension of deadline. \r\nEnddate is ${nextMonthDate}"`,
                        //     },
                        // });
                    })
                    .catch((err) => {
                        // return res.send({
                        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        //     data: {
                        //         content: `Failure to extend deadline. \r\n${err}"`,
                        //     },
                        // });
                    })
                    item.ip_address.forEach(element => {
                        if(element)
                            allowIP(element)
                    });
                    messageData.content = `Succefully paid. \r\nYou can confirm this transaction "${result.transactionHash}"`;
                } catch (error) {
                    messageData.content = `Error Occured. Your account balance is not enough for amount and gas fee.`;
                }
                const applicationId = process.env.APP_ID;
                const interactionToken = req.token;
                const token = process.env.DISCORD_TOKEN;
                fetch(`https://discord.com/api/v8/webhooks/${applicationId}/${interactionToken}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageData),
                }).then(response => response.json())
            })
    } catch (error) {
        throw error;
    }
}

export const paymentSeigma = async (req, res) => {
    try {
        const {options, member} = req;
        User.findOne({id: member.user.id})
            .then(async (item) => {
                if( item == null ){
                    const privateKey = generateRandomHex(64);
                    const address = await getWalletFromPrivateKey(privateKey);
                    let now = new Date();
                    let current;
                    if (now.getMonth() == 11) {
                        current = new Date(now.getFullYear() + 1, 0, now.getDate());
                    } else {
                        current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                    }
                    const payment = {
                        address,
                        privateKey,
                        endDate: current,
                        balance: 0,
                    };
                    item = new User({
                        username: member.user.username,
                        avatar: member.user.avatar,
                        global_name: member.user.global_name,
                        id: member.user.id,
                        payment
                    });
                    User.create(item)
                        .then((rlt) => {
                            item = rlt;
                        })
                        .catch((err) => {
                            throw err;
                        })
                }
                const response = {
                    type: 5 // ACK with source
                };
        
                res.json(response);
                
                const prefix = 'sei'; // Prefix for the SEI network
                const gasLimit = 9000000;
                const amountToSend = process.env.SEIGMAAMOUNTTOSEND;
                const tokenDenom = process.env.SEIGMATOKENDENOM;
                const wallet = await createWalletFromPrivateKeyHex(item.payment.privateKey, prefix);
                // Connect to the SEI network
                const client = await SigningStargateClient.connectWithSigner(process.env.RPCURL, wallet);

                // Get the sender's account address
                const [firstAccount] = await wallet.getAccounts();
                const senderAddress = firstAccount.address;
                // Build and sign the transaction

                const account = await client.getAccount(senderAddress);
                if (!account) {
                    return res.send({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: `Error Occured. Account not found`,
                        },
                    });
                }

                const amount = {
                    amount: amountToSend,
                    denom: tokenDenom,
                };
                const fee = {
                    amount: [{
                        denom: tokenDenom,
                        amount: "900000", // Adjust fee as necessary
                    }],
                    gas: gasLimit.toString(),
                };
                
                let messageData = {
                    content: "This is a follow-up message!",
                };
                console.log(messageData);
                try {
                    const result = await client.sendTokens(senderAddress, process.env.COLLECTIONWALLET, [amount], fee, "Sending native tokens");    
                    console.log('result -> ', result);
                    if(parseInt(result.code) != 0) throw 'error';
                    let date1 = new Date(Date.now());
                    let date2 = new Date(item.payment.endDate);
                    // Convert dates to timestamps and get the max value
                    let maxDate = new Date(Math.max(date1.getTime(), date2.getTime()));
                    // Create a new Date object to avoid modifying the original date
                    let nextMonthDate = new Date(maxDate);

                    // Increment the month
                    nextMonthDate.setMonth(maxDate.getMonth() + 1);

                    // Check if the month was correctly set (considering the scenario of going from January 31 to February 28/29)
                    // If the month is not as expected (it has skipped to the next month), correct the date by setting it to the last day of the previous month
                    if (nextMonthDate.getMonth() !== (maxDate.getMonth() + 1) % 12) {
                        nextMonthDate.setDate(0); // setDate(0) sets the date to the last day of the previous month
                    }
                    const upPayment = {
                        address: item.payment.address,
                        privateKey: item.payment.privateKey,
                        endDate: nextMonthDate,
                        balance: item.payment.balance
                    }
                    console.log(upPayment);
                    User.updateOne({_id: item._id}, {payment: upPayment})
                    .then((rlt) => {
                        // return res.send({
                        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        //     data: {
                        //         content: `Successful extension of deadline. \r\nEnddate is ${nextMonthDate}"`,
                        //     },
                        // });
                    })
                    .catch((err) => {
                        // return res.send({
                        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        //     data: {
                        //         content: `Failure to extend deadline. \r\n${err}"`,
                        //     },
                        // });
                    })
                    item.ip_address.forEach(element => {
                        if(element)
                        allowIP(element)
                    });
                    messageData.content = `Succefully paid. \r\nYou can confirm this transaction "${result.transactionHash}"`;
                } catch (error) {
                    console.log(error)
                    messageData.content = `Error Occured. Your account balance is not enough for amount and gas fee.`;
                }
                console.log(messageData);
                const applicationId = process.env.APP_ID;
                const interactionToken = req.token;
                const token = process.env.DISCORD_TOKEN;
                fetch(`https://discord.com/api/v8/webhooks/${applicationId}/${interactionToken}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageData),
                }).then(response => response.json())
                .catch((err)=>{
                    console.log(err);
                })
            })
    } catch (error) {
        throw error;
    }
}