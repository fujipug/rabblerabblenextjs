'use client'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import { useEffect, useState } from "react";
import AVVY from '@avvy/client';
import { useAccount, useEnsName } from "wagmi";
import { providers } from 'ethers'

export default function Navbar() {
  const provider = new providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
  const { address } = useAccount();
  const [avvyName, setAvvy] = useState('');
  // const { data: ensName } = useEnsName({
  //   address: address,
  //   chainId: 1
  // })

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
      <Link href="/" className="hidden sm:flex btn btn-ghost normal-case text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</Link>
      <Link href="/" className="flex sm:hidden btn btn-ghost normal-case text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">R R</Link>
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
                        className="hidden sm:flex sm:items-center text-gray-100"
                        onClick={openChainModal}
                        type="button"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button className="btn btn-outline btn-secondary" onClick={openAccountModal} type="button">
                        {avvyName ? avvyName
                          //  : ensName ? ensName
                          : account.displayName}
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