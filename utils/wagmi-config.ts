import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { avalanche, mainnet, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import {
  coinbaseWallet,
  coreWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

const projectId = "5ebeded86a2892064a847992b9c2ab4b"; // connect cloud wallet
const appName = "Rabble Rabble";
export const { chains, publicClient } = configureChains(
  [polygonMumbai, avalanche],
  [
    alchemyProvider({ apiKey: "Fh3FbYFfhvNgUpnJ-pzgRoIFRunkpA08" }),
    publicProvider(),
  ],
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId, chains }),
      rabbyWallet({ chains }),
      coreWallet({ projectId, chains }),
      coinbaseWallet({ appName, chains }),
      injectedWallet({ chains }),
      rainbowWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});
