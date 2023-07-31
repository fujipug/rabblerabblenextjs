import { useEffect, useState } from "react";
import { nftAbi, rabbleAbi, rabbleAddress, rabbleTestAddress } from "./config";
import { getContract, getNetwork, getWalletClient } from "@wagmi/core";

const { chain, chains } = getNetwork();
const walletClient = getWalletClient();

export const checkApproval = async (
  address: `0x${string}`,
  account: string,
  ids: string[],
) => {
  const collectionContract = getContract({
    address: address,
    abi: nftAbi,
    walletClient,
  });
};

export const useRabbleContract = () => {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let;
    if (chain?.id === 43114) {
      setAddress(rabbleAddress);
    } else {
      setAddress(rabbleTestAddress);
    }
  }, []);

  return address;
};
