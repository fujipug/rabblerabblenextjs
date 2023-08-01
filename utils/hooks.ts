import { useEffect, useState } from "react";
import { nftAbi, rabbleAbi, rabbleAddress, rabbleTestAddress } from "./config";
import {
  getAccount,
  getContract,
  getNetwork,
  getWalletClient,
} from "@wagmi/core";

const { chain, chains } = getNetwork();
const account = getAccount();

export const verifyApproval = async (
  collection: string,
) => {
  const address = chain?.id === 43114 ? rabbleAddress : rabbleTestAddress;
  const walletClient = await getWalletClient({
    chainId: chain?.id,
  });

  const collectionContract = getContract({
    address: collection.checksum,
    abi: nftAbi,
    walletClient,
  });
  const approved = await collectionContract.read.isApprovedForAll([
    account.address,
    address,
  ]);

  try {
    if (!approved) {
      const tx = await collectionContract.write.setApprovalForAll([
        address,
        true,
      ]);
      await tx.wait();
    }
  } catch (e) {
    console.log("approval error", e);
  }
};

export const useRabbleContract = () => {
  const [contract, setContract] = useState<any | null>(null);

  useEffect(() => {
    const address = chain?.id === 43114 ? rabbleAddress : rabbleTestAddress;
    const contract = getContract({
      address: address,
      abi: rabbleAbi,
      walletClient: getWalletClient(),
    });
    setContract(contract);
  }, []);

  return contract;
};
