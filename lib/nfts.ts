import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from 'moralis';
import { generateToken } from "../utils/functions";

export const getMoralisNfts = async (address: string) => {
  let result: any = [];
  await Moralis.EvmApi.nft.getWalletNFTs({
    address: address as string,
    chain: EvmChain.MUMBAI,
    limit: 100,
    mediaItems: true,
    normalizeMetadata: true,
  }).then((response) => {
    result = response.result;
  });

  return result;
};

export const getPicassoNfts = async (address: string) => {
  let result: any = [];
  await fetch(
    `https://api.pickasso.net/v1/wallet/${address}/tokens?count=1000&sortBy=updatedBlock&sortOrder=desc&verified=false`,
    {
      headers: {
        'x-api-token': generateToken(),
      }
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error('Something wrong happened');
    }

    return response.json();
  }).then((data) => {
    result = data.docs;
  }).catch((e) => {
    console.log('fetch inventory error', e);
  });

  return result;
}