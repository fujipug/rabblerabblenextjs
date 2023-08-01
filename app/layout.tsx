'use client'
import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import Moralis from 'moralis';
import Image from 'next/image';
import Link from "next/link";
import { chains, wagmiConfig } from "../utils/wagmi-config";

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
              <Image src="/images/Face_2.png" alt="Rabble Rabble Logo" width={60} height={60} />
              <p><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span><br />
                {/* Raffle NFTs With The Boys */}
                <span className="flex items-center font-mono text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth={1.0} stroke="black" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span>Developed by
                    <Link className="cursor-pointer hover:text-indigo-400" href="https://twitter.com/pugs0x"> Pugs0x</Link>,
                    <Link className="cursor-pointer hover:text-sky-500" href="https://twitter.com/nobsfud"> Nobs</Link> &
                    <Link className="cursor-pointer hover:text-emerald-500" href="https://twitter.com/0xPrimata"> 0xPrimata</Link>
                  </span>
                </span >
              </p>
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