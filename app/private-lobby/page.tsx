'use client'
import { useEffect, useState } from "react";
import { EvmChain, EvmNft } from "@moralisweb3/common-evm-utils";
import Moralis from 'moralis';
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { useAccount } from "wagmi";
import { useQRCode } from "next-qrcode";

const firebaseConfig = {
  apiKey: "AIzaSyBOZ5vqd-ZHoK-UX6bNxrZm0V4FoU9KU6k",
  authDomain: "rabble-rabble.firebaseapp.com",
  projectId: "rabble-rabble",
  storageBucket: "rabble-rabble.appspot.com",
  messagingSenderId: "835781447787",
  appId: "1:835781447787:web:84e6b4123aa0b77b5f212e",
  measurementId: "G-T8GBPL2SXJ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fireConfetti = (particleRatio: number, opts: any) => {
  const defaults = {
    origin: { y: 0.7 }
  };
  confetti(Object.assign({}, defaults, opts, {
    particleCount: Math.floor(200 * particleRatio)
  }));
};
function fireAction() {
  fireConfetti(0.25, { spread: 26, startVelocity: 55 });
  fireConfetti(0.2, { spread: 60 });
  fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fireConfetti(0.1, { spread: 120, startVelocity: 45 });
}

declare global {
  interface Window {
    selectNftModal: any;
  }
}

export default function PrivateLobby() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [step, setStep] = useState(1);
  const [nfts, setNfts] = useState([] as EvmNft[]);
  const [selectedNft, setSelectedNft] = useState({} as EvmNft);
  const [confirmNft, setConfirmNft] = useState({} as EvmNft);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const { address, isConnected } = useAccount();
  const [showClipboardToast, setShowClipboardToast] = useState(false);
  const { SVG } = useQRCode();

  useEffect(() => {
    if (address && isConnected)
      getNfts();
  }, [address, isConnected]);

  const getNfts = async () => {
    const chain = EvmChain.AVALANCHE;
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: address as string,
      chain,
      mediaItems: true,
      normalizeMetadata: true,
    });
    setNfts(response.result);
  }
  const processStep2 = async (amount: number) => {
    setPlayerAmount(amount);
    setStep(2);
  }

  const firebaseLobby = async (lobby: any) => {
    addDoc(collection(db, 'lobbies'), lobby).then((response) => {
      setStep(4);
      setShareUrl(`${window.location.href.split('/private')[0]}/lobby-details/${response.id}`);
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }
  const createLobby = async () => {
    if (pass.length >= 6) {
      const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // the 24 will change when time limits are added
      const lobby = {
        collection: confirmNft?.name,
        createdAt: Timestamp.now(),
        confirmedPlayers: 1,
        endDate: Timestamp.fromDate(endDate),
        evmChain: 'Avalanche',
        isPrivate: true,
        nfts: [confirmNft.toJSON()],
        password: pass,
        timeLimit: 24, // Update when time limits are added
        status: 'Active',
        totalPlayers: playerAmount,
        // vaultAddress: '',
        // pk: '',
      }

      //TODO: Create wallet/vault for lobby
      firebaseLobby(lobby).then((response) => {
        fireAction();
      });
    } else {
      // TODO: error message
    }
  }
  const clipboardlink = () => {
    setShowClipboardToast(true);
    navigator.clipboard.writeText(shareUrl);
    setTimeout(() => {
      setShowClipboardToast(false);
    }, 3000);
  }

  return (
    <>
      <div className="flex justify-center">
        <ul className="steps">
          <li onClick={() => (step > 1 && step !== 4) && setStep(1)} className={step >= 1 ? "step mr-2 sm:mr-4 cursor-pointer step-primary" : "step mr-2 sm:mr-4"}># Players</li>
          <li onClick={() => (step > 2 && step !== 4) && setStep(2)} className={step >= 2 ? "step mr-2 sm:mr-4 cursor-pointer step-primary" : "step mr-2 sm:mr-4"}>Select NFT</li>
          <li onClick={() => (step > 3 && step !== 4) && setStep(3)} className={step >= 3 ? "step mr-2 sm:mr-4 cursor-pointer step-primary" : "step mr-2 sm:mr-4"}>Final Details</li>
          <li className={step === 4 ? "step mr-2 sm:mr-4 cursor-pointer step-primary" : "step mr-2 sm:mr-4"}>Share</li>
        </ul>
      </div>
      {/* step 1 */}
      {(step == 1) &&
        <div className="mt-12 text-center">
          <h1 className="font-semibold text-2xl mb-4">Choose the number of players</h1>
          <div className="hidden sm:block join drop-shadow-md">
            <button onClick={() => processStep2(3)} className="btn btn-secondary join-item">3 Players</button>
            <button onClick={() => processStep2(5)} className="btn btn-secondary join-item">5 Players</button>
            <button onClick={() => processStep2(7)} className="btn btn-secondary join-item">7 Players</button>
            <button onClick={() => processStep2(10)} className="btn btn-secondary join-item">10 Players</button>
          </div>
          <div className="block sm:hidden">
            <div className="join drop-shadow-md mb-4">
              <button onClick={() => processStep2(3)} className="btn btn-secondary join-item">3 Players</button>
              <button onClick={() => processStep2(5)} className="btn btn-secondary join-item">5 Players</button>
            </div>
            <div className="join drop-shadow-md">
              <button onClick={() => processStep2(7)} className="btn btn-secondary join-item">7 Players</button>
              <button onClick={() => processStep2(10)} className="btn btn-secondary join-item">10 Players</button>
            </div>
          </div>
          <div className="flex justify-center items-center mt-12">
            <label className="swap swap-flip text-9xl">
              <input type="checkbox" />
              <div className="swap-on"><Image alt="player amount" width={160} height={160} className="w-40 grayscale" src="/images/pokepixel.png" /></div>
              <div className="swap-off"><Image alt="player amount" width={160} height={160} className="w-40" src="/images/pokepixel.png" /></div>
            </label>
          </div>
        </div>
      }

      {/* step 2 */}
      {(step == 2) &&
        <div className="mt-12 text-center">
          {address && isConnected ?
            <>
              <h1 className="font-semibold text-2xl mb-4">Connected wallet address</h1>
              <span className="hidden sm:block">{address}</span>
              {/* <span className="block sm:hidden">{address | pipe}</span> */}
              <div className="flex justify-center">
                <ul role="list" className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-5 lg:grid-cols-7 lg:gap-x-7 lg:gap-y-7 mt-6">
                  {nfts.map((nft: any, index: any) => (
                    <li onClick={() => { setSelectedNft(nft); window.selectNftModal.showModal() }} key={index} className="relative cursor-pointer">
                      <div className="w-[100px] h-[100px]">
                        {nft.media?.mimetype === 'video/mp4' ?
                          <video className="rounded-lg drop-shadow-md" width="100" height="100" muted loop autoPlay>
                            <source src={nft.media?.media_collection?.low.url} type="video/mp4" />
                          </video>
                          :
                          <img className="rounded-lg drop-shadow-md"
                            src={nft.media?.mediaCollection?.low.url ? nft.media?.mediaCollection?.low.url : nft?.media?.originalMediaUrl}
                            alt="NFT image unreachable" width={100} height={100} />
                        }
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="text-sm">* If some images are missing it might be due to your ad blocker</span>
            </>
            :
            <>
              <h1 className="font-semibold text-2xl mb-4">Sign into your NFT wallet</h1>
              <div className="w-full flex justify-center">
                <ConnectButton />
              </div>
            </>
          }
        </div>
      }

      {/* step 3 */}
      {(step == 3) &&
        <div className="mt-12">
          <div className="grid grid-cols-1 space-x-6 sm:grid-cols-2">
            <div className="col-span-1 flex justify-center">
              <div className="card card-compact w-96 bg-base-100 shadow-xl">
                <figure><img src={selectedNft?.media?.mediaCollection?.high?.url ? selectedNft?.media?.mediaCollection?.high?.url : selectedNft?.media?.originalMediaUrl} alt="NFT Image" /></figure>
                <div className="card-body">
                  <h2 className="card-title">{selectedNft?.name} #{selectedNft?.tokenId}</h2>
                  <p><span className="font-semibold">Symbol: </span> {selectedNft?.symbol}</p>
                </div>
              </div>
            </div>

            <div className="col-span-1 relative mt-4">
              <div className="mb-4">
                <h2 className="font-semibold">EVM Chain</h2>
                <p>Avalanche</p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Raffle Collection
                  <div className="tooltip" data-tip="Players can only raffle with NFTs in this collection.">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </h2>
                <p>{confirmNft?.name}</p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Number of Players</h2>
                <p>{playerAmount}</p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Session Time Limit
                  <div className="tooltip" data-tip="The maximum time allowed for all players to participate before the lobby is closed.">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </h2>
                <p>24 hours</p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Lobby Fee</h2>
                <p>0.1 AVAX</p>
              </div>

              <div className="flex flex-col w-full border-opacity-50">
                <div className="divider">Lobby Password</div>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  {!showPass ?
                    <>
                      <input placeholder="Min. 6 characters" onChange={e => { setPass(e.currentTarget.value) }} type="password" className="input input-bordered w-full drop-shadow-md" />
                      <span onClick={() => setShowPass(true)} className="label-text-alt cursor-pointer ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    </>
                    :
                    <>
                      <input placeholder="Min. 6 characters" onChange={e => { setPass(e.currentTarget.value) }} type="text" className="input input-bordered w-full drop-shadow-md" />
                      <span onClick={() => setShowPass(false)} className="label-text-alt cursor-pointer ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      </span>
                    </>
                  }
                </div>
                <p className="text-xs mt-2">* This password will be required to join the lobby. Anyone with this password will be able to join.</p>
              </div>
              <button onClick={() => createLobby()} className="hidden sm:block btn btn-accent drop-shadow-md mt-6">Create Lobby</button>
              <button onClick={() => createLobby()} className="block sm:hidden btn btn-accent drop-shadow-md mt-6 w-full">Create Lobby</button>
            </div >
          </div >
        </div >
      }

      {/* step 4 */}
      {(step == 4) &&
        <div className="mt-12">
          <div className="text-center">
            <h1 className="font-semibold text-xl mb-4">Share QR Code</h1>
          </div>
          <div className="flex justify-center">
            <div className="qrcodeImage">
              <SVG
                text={shareUrl}
                options={{
                  margin: 2,
                  width: 200,
                  color: {
                    dark: '#000',
                    light: '#fff',
                  },
                }}
              />
            </div>
          </div >
          <div className="text-center mt-4">
            <h1 className="font-semibold text-xl mb-2">Share Link</h1>
            <div className="flex justify-center">
              <Link className="mr-4 hover:underline" href={shareUrl}>{shareUrl}</Link>
              <svg onClick={() => clipboardlink()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>

            </div >
          </div >

          {showClipboardToast &&
            <div className="toast toast-center">
              <div className="alert alert-success">
                <span>Link copied to clipboard</span>
              </div>
            </div >
          }
        </div >
      }

      {/* Open the modal using ID.showModal() method */}
      <dialog id="selectNftModal" className="modal">
        <form method="dialog" className="modal-box">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <div className="grid grid-cols-1 mt-4 sm:grid-cols-2 sm:space-x-6">
            <div className="col-span-1">
              {selectedNft?.media?.mimetype === 'video/mp4' ?
                <figure>
                  <video className="rounded-lg drop-shadow-md" width="500" height="500" autoPlay muted loop>
                    <source src={selectedNft?.media?.mediaCollection?.high?.url} type="video/mp4" />
                  </video>
                </figure>
                :
                <figure>
                  <img className="rounded-lg drop-shadow-md"
                    src={selectedNft?.media?.mediaCollection?.high?.url ? selectedNft?.media?.mediaCollection?.high?.url : selectedNft?.media?.originalMediaUrl}
                    alt="NFT image unreachable" />
                </figure>
              }
            </div>

            <div className="col-span-1 mt-4 sm:mt-0 relative">
              <p><span className="font-semibold">Collection:</span> {selectedNft?.name}</p>
              <div className="divider"></div>
              <p><span className="font-semibold">Symbol:</span> {selectedNft?.symbol}</p>
              <p><span className="font-semibold">Token ID:</span> {selectedNft?.tokenId}</p>
              <button onClick={() => { setConfirmNft(selectedNft), setStep(3) }} className="hidden sm:block btn btn-accent drop-shadow-md bottom-0 absolute">Confirm</button>
              <button onClick={() => { setConfirmNft(selectedNft); setStep(3) }} className="block sm:hidden btn btn-accent drop-shadow-md mt-4 w-full">Confirm</button>
            </div>
          </div >
        </form >
      </dialog >

    </>
  )
}