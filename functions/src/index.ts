import * as admin from "firebase-admin";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { onCall } from "firebase-functions/v1/https";
import { schedule } from "firebase-functions/v1/pubsub"
import * as serviceAccount from "./rabble-rabble-firebase-adminsdk-m0vbk-8ef52c20af.json";
import { ethers } from 'ethers';
import * as axios from 'axios';
// import * as dotenv from 'dotenv';
// dotenv.config({ path: '../../.env' });

admin.initializeApp({
    projectId: "rabble-rabble",
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
const db = admin.firestore();

const runApp = async () => {
    await Moralis.start({
        apiKey: 'E88APZ59qtx9G5LJjPEjLgSjSK5ldhaYs8qvI7g9CTYkh2hWSK9omFd3NLgJzA76',
    });
};
runApp();

exports.getAvaxNfts = onCall(async (request: any) => {
    const address = request?.address;
    const chain = EvmChain.AVALANCHE;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address,
        chain,
        mediaItems: true,
        normalizeMetadata: true,
    });

    return await response.toJSON();
});

exports.getAvaxBalance = onCall(async (request: any) => {
    const address = request?.address;
    const chain = EvmChain.AVALANCHE;

    const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
    });

    return await response.toJSON();
});

exports.createWallet = onCall(async () => {
    return ethers.Wallet.createRandom()
});

exports.avaxToOneUsd = onCall(async () => {
    const response = await axios.default.get('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd');
    return 1 / response.data['avalanche-2'].usd;
});

exports.scheduledLobbyCheck = schedule('* * * * *').onRun(async () => {
    const today = new Date();

    db.collection('lobbies')
        .where('status', '==', 'Active')
        .where('endDate', '<=', (today))
        .get()
        .then((snapshot: any) => {
            snapshot.forEach((doc: any) => {
                doc.ref.update({ status: 'Expired' });
                // TODO: maybe send winning message some how
            });
        });
});
