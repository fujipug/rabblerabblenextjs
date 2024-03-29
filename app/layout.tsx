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
import { Analytics } from '@vercel/analytics/react';

const runApp = async () => {
  await Moralis.start({
    apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
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
    // RABBLE RABBLE!!!
    <html>
      <body>
        <main>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} theme={darkTheme()}>
              {children}
              <Analytics />
            </RainbowKitProvider>
          </WagmiConfig>
          <footer className="footer p-10 bg-base-200 text-base-content">
            <div>
              <div className="mb-2 flex items-center">
                <Link className="-ml-2" href="/"><Image src="/images/Face_2.png" alt="Rabble Rabble Logo" width={60} height={60} /></Link>
                <div>
                  <Link href="/"><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-xl">Rabble Rabble</span><br /></Link>
                  <div className="text-xs absolute -mt-1.5">ByQuokkas</div>
                </div>
              </div>
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
              <Link href="https://twitter.com/ByQuokkas" className="flex items-center cursor-pointer hover:text-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-current w-4 h-4"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                <span className="text-xs ml-3 font-mono">Follow ByQuokkas</span>
              </Link>
            </div>
            <div>
              <span className="footer-title">Transparency</span>
              <Link href="https://snowtrace.io/address/0x15e4e77eC84D61441f7E9074517dce4F9458326A#code" className="link link-hover">Avalanche Contract</Link>
              <Link href="https://arbiscan.io/address/0x15e4e77ec84d61441f7e9074517dce4f9458326a#code" className="link link-hover">Arbitrum Contract</Link>
              <Link href="/learn-more" className="link link-hover">Learn More</Link>
            </div>
            <div className="w-52">
              <p className="text-xs">Please research if rabblerabble.xyz is legal to use in your jurisdiction prior to use. rabblerabble.xyz assumes no responsibility for your use of the platform. </p>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}