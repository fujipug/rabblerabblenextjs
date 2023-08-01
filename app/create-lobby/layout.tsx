import Navbar from "../../components/navbar";
import {
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  polygonMumbai
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { coinbaseWallet, coreWallet, injectedWallet, metaMaskWallet, rabbyWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({ apiKey: 'Fh3FbYFfhvNgUpnJ-pzgRoIFRunkpA08' }),
    publicProvider()
  ]
);
const projectId = '5ebeded86a2892064a847992b9c2ab4b'; // connect cloud wallet
const appName = 'Rabble Rabble';
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
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

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <WagmiConfig config={wagmiConfig}>
          {children}
        </WagmiConfig>
      </div>
    </>
  );
}