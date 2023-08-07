import { useEffect, useState } from "react";
import { nftAbi, rabbleAbi, rabbleAddress, rabbleTestAddress } from "./config";
import { EvmAddress } from "@moralisweb3/common-evm-utils";
import {
  getAccount,
  getContract,
  getNetwork,
  getWalletClient,
  readContract
} from "@wagmi/core";

const { chain } = getNetwork();
const account = getAccount();

export const verifyApproval = async (
  collection: EvmAddress,
) => {

  const address = chain?.id === 43114 ? rabbleAddress : rabbleTestAddress;
  const walletClient = await getWalletClient({
    chainId: chain?.id,
  });
  const collectionContract = getContract({
    address: collection.checksum as any,
    abi: nftAbi,
    walletClient: walletClient as any,
  });
  const approved = await collectionContract.read.isApprovedForAll([
    account.address,
    address,
  ]);

  try {
    if (!approved) {
      // @ts-ignore
      const tx = await collectionContract.write.setApprovalForAll([
        address,
        true,
      ]);

      console.log(tx);
      return await tx.wait();
    }
  } catch (e) {
    console.log("approval error", e);
  }
};

// get raffle count
export const getRaffleCount = () => {
  const address = chain?.id === 43114 ? rabbleAddress : rabbleTestAddress;

  const count = readContract({
    address: address,
    abi: rabbleAbi,
    functionName: "raffleCounter",
  })

  return count;
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
