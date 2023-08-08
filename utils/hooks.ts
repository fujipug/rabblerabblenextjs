import { useEffect, useState } from "react";
import { nftAbi, rabbleAbi, rabbleAddress, rabbleTestAddress } from "./config";
import { EvmAddress } from "@moralisweb3/common-evm-utils";
import {
  getAccount,
  getContract,
  getNetwork,
  getWalletClient,
  readContract,
} from "@wagmi/core";
import { write } from "fs";

const { chain } = getNetwork();
const account = getAccount();

export const verifyApproval = async (
  collection: EvmAddress,
  write: () => void,
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

      const unwatch = collectionContract.watchEvent.ApprovalForAll(
        { from: account.address },
        {
          onLogs() {
            write();
            unwatch();
          },
        },
      );
    } else {
      write();
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
  });

  return count;
};

export const getRaffleById = (id: number) => {
  const address = chain?.id === 43114 ? rabbleAddress : rabbleTestAddress;
  const raffle = readContract({
    address: address,
    abi: rabbleAbi,
    functionName: 'raffles',
    args: [BigInt(id)]
  });

  return raffle;
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

export const useFee = () => {
  const [fee, setFee] = useState<bigint>(0n);
  let fees = new Map<number, bigint>([
    [80001, 1000000000000n], // mumbai
    [43114, 1000000000000000000n], // avalanche
  ]);

  useEffect(() => {
    setFee(fees.get(chain?.id || 0) || 0n);
  }, [chain?.id]);

  return fee;
};

export const truncateAddress = (address: string) => {
  const firstPart = address.slice(0, 5);
  const lastPart = address.slice(-4);

  return `${firstPart}...${lastPart}`;
};
