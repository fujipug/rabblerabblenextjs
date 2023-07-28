'use client'
import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import {
  connectorsForWallets,
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  avalanche,
  avalancheFuji,
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { coinbaseWallet, coreWallet, injectedWallet, metaMaskWallet, rabbyWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import Moralis from 'moralis';
import Image from 'next/image';

const projectId = '5ebeded86a2892064a847992b9c2ab4b';
const appName = 'Rabble Rabble';
const { chains, publicClient } = configureChains(
  [avalanche, avalancheFuji],
  [
    alchemyProvider({ apiKey: 'Fh3FbYFfhvNgUpnJ-pzgRoIFRunkpA08' }),
    publicProvider()
  ]
);

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

const runApp = async () => {
  await Moralis.start({
    apiKey: 'E88APZ59qtx9G5LJjPEjLgSjSK5ldhaYs8qvI7g9CTYkh2hWSK9omFd3NLgJzA76',
  });
};
runApp();

export default function RootLayout(
  {
    children,
  }: {
    children: React.ReactNode;
  }) {

  return (
    <html>
      <body>
        <main>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
              {children}
            </RainbowKitProvider>
          </WagmiConfig>
          <footer className="footer p-10 bg-base-200 text-base-content">
            <div>
              <Image src="/images/Quokka_Cool.png" alt="Rabble Rabble Logo" width={60} height={60} />
              <p><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span><br />Raffle NFTs With The Boys</p>
            </div>
            <div>
              <span className="footer-title">Support</span>
              <a className="link link-hover">Documentation</a>
            </div>
            <div>
              <span className="footer-title">Company</span>
              <a className="link link-hover">Terms of use</a>
              <a className="link link-hover">Privacy Policy</a>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}