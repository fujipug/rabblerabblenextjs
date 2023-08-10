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

export const verifyApproval = async (
  collection: EvmAddress,
  write: () => void,
  isApprovalStatusLoading: any,
) => {
  const network = getNetwork();
  const account = getAccount();
  const address = network.chain?.id === 43114
    ? rabbleAddress
    : rabbleTestAddress;
  const walletClient = await getWalletClient({
    chainId: network.chain?.id,
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
      await collectionContract.write.setApprovalForAll([
        address,
        true,
      ]);

      isApprovalStatusLoading(true);
      const unwatch = collectionContract.watchEvent.ApprovalForAll(
        { from: getAccount().address },
        {
          onLogs() {
            write();
            unwatch();
            isApprovalStatusLoading(false);
          },
        },
      );
      console.log("a", unwatch);
    } else {
      write();
    }
  } catch (e) {
    console.log("approval error", e);
  }
};

// get raffle count
export const getRaffleCount = () => {
  const network = getNetwork();
  const address = network.chain?.id === 43114
    ? rabbleAddress
    : rabbleTestAddress;

  const count = readContract({
    address: address,
    abi: rabbleAbi,
    functionName: "raffleCounter",
  });

  return count;
};

export const getRaffleById = (id: number) => {
  const network = getNetwork();
  const address = network.chain?.id === 43114
    ? rabbleAddress
    : rabbleTestAddress;
  const raffle = readContract({
    address: address,
    abi: rabbleAbi,
    functionName: "raffles",
    args: [BigInt(id)],
  });

  return raffle;
};

export const useRabbleContract = () => {
  const [contract, setContract] = useState<any | null>(null);
  const network = getNetwork();

  useEffect(() => {
    const address = network.chain?.id === 43114
      ? rabbleAddress
      : rabbleTestAddress;
    const contract = getContract({
      address: address,
      abi: rabbleAbi,
      walletClient: getWalletClient(),
    });
    setContract(contract);
  }, [network.chain?.id]);

  return contract;
};

export const useFee = () => {
  const network = getNetwork();
  const [fee, setFee] = useState<bigint>(0n);
  let fees = new Map<number, bigint>([
    [80001, 1000000000000n], // mumbai
    [43114, 100000000000000000n], // avalanche
  ]);

  useEffect(() => {
    setFee(fees.get(network.chain?.id || 0) || 0n);
  }, [network.chain?.id]);

  return fee;
};

export const truncateAddress = (address: string) => {
  const firstPart = address.slice(0, 5);
  const lastPart = address.slice(-4);

  return `${firstPart}...${lastPart}`;
};