'use client'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./theme-toggle";
import { useEffect, useState } from "react";
import AVVY from '@avvy/client';
import { useAccount } from "wagmi";
import { providers } from 'ethers'
import RenderName from "./render-name";

export default function Navbar() {
  const provider = new providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
  const { address } = useAccount();
  const [avvyName, setAvvy] = useState('');

  const fetchAvvy = async () => {
    const avvy = new AVVY(provider, {});
    // @ts-ignore
    const hash = await avvy.reverse(AVVY.RECORDS.EVM, address)
    let name;
    try {
      name = await hash?.lookup();
      setAvvy(name?.name);
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    fetchAvvy();
  }, [address]);
  return (
    <div className="navbar bg-neutral flex justify-between drop-shadow-md items-center">
      <Link className="flex sm:hidden" href="/"><Image src="/images/Face_2.png" alt="Rabble Rabble Logo" width={60} height={60} /></Link>
      <div className="hidden sm:flex items-center ml-2">
        <Link className="-ml-2" href="/"><Image src="/images/Face_2.png" alt="Rabble Rabble Logo" width={60} height={60} /></Link>
        <div className="mb-2">
          <Link href="/"><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-xl">Rabble Rabble</span><br /></Link>
          <span className="text-xs absolute -mt-1.5">ByQuokkas</span>
        </div>
      </div>
      <div className="flex items-center">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button className="btn btn-outline btn-secondary" onClick={openConnectModal} type="button">
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button className="btn btn-outline btn-secondary" onClick={openChainModal} type="button">
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        className="flex items-center text-gray-100"
                        onClick={openChainModal}
                        type="button"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                            className="w-5 h-5"
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        )}
                        <span className="hidden sm:flex">{chain.name}</span>
                      </button>

                      <button className="btn btn-outline btn-secondary" onClick={openAccountModal} type="button">
                        <RenderName address={account.address} isWinner={false} classData="text-gray-100" />
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
        <span className="ml-4"><ThemeToggle /></span>
      </div>
    </div >

  )
}