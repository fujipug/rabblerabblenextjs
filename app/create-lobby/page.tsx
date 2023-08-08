'use client'
import { WagmiConfig, useAccount, useContractWrite } from "wagmi";
import { wagmiConfig } from "../../utils/wagmi-config.ts";
import { getNetwork } from '@wagmi/core'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getRaffleCount, useRabbleContract, verifyApproval, useFee, truncateAddress } from '../../utils/hooks.ts';
import { useEffect, useState } from "react";
import { EvmChain, EvmNft } from "@moralisweb3/common-evm-utils";
import Moralis from 'moralis';
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useQRCode } from "next-qrcode";
import { rabbleAbi } from '../../utils/config.ts';
import { firebaseConfig } from '../../utils/firebase-config.ts';
import { formatUnits } from 'viem';

//Initialize firebase backend
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Confetti helper animation
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
    rulesModal: any;
  }
}

export default function CreateLobby() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [step, setStep] = useState(1);
  const [nfts, setNfts] = useState([] as EvmNft[]);
  const [selectedNft, setSelectedNft] = useState({} as EvmNft);
  const [confirmNft, setConfirmNft] = useState({} as EvmNft);
  const [shareUrl, setShareUrl] = useState('');
  const { address, isConnected } = useAccount();

  const [showClipboardAlert, setShowClipboardAlert] = useState(false);
  const { SVG } = useQRCode();
  const [showQuokkas, setShowQuokkas] = useState(5);
  const [collectionList, setCollectionList] = useState([] as string[]);
  const [imutableNftList, setImutableNftList] = useState([] as EvmNft[]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const rabbleContract = useRabbleContract();
  const fee = useFee();
  const { chain } = getNetwork();
  const quokkas = [
    'Quokka_Cool', 'Quokka_Leaf', 'Quokka_Bowl_Hat', 'Quokka', 'Quokka_Wave',
    'Quokka', 'Quokka_Wave', 'Quokka_Bowl_Hat', 'Quokka_Cool', 'Quokka_Leaf'];
  let { data, isLoading, isSuccess, write } = useContractWrite({
    address: rabbleContract?.address,
    abi: rabbleAbi,
    functionName: 'createPublicRaffle',
    args: [
      confirmNft.tokenAddress?.lowercase,
      playerAmount,
      confirmNft.tokenId,
      84600 // 24 hours
    ],
    value: fee,
    onSuccess: () => {
      getRaffleCount().then(async (response) => {
        createFirebaseLobby(Number(response) + 1);
      });
    },
    onError(error) {
      const errorMessage = `Error: ${error.message.split(':')[1].split('()')[0].trim().replace(/([a-z])([A-Z])/g, '$1 $2')}`;
      setErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);
    },
  })
  const processStep2 = async (amount: number) => {
    setPlayerAmount(amount);
    setStep(2);
  }

  // Get Nfts by calling the Moralis API
  useEffect(() => {
    if (address && isConnected)
      getNfts();
  }, [address, isConnected]);
  const getNfts = async () => {
    const chain = EvmChain.MUMBAI;
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: address as string,
      chain,
      mediaItems: true,
      normalizeMetadata: true,
    });
    setNfts(response.result);
    setImutableNftList(response.result);
  }

  // Finalize lobby and create the lobby in the blockchain
  const handleFinalizeLobby = async () => {
    if (confirmNft) {
      verifyApproval(confirmNft?.tokenAddress, write)
      // .then(() => {
      //   write();
      // });
    }
  }

  // Create lobby in firebase for record keeping
  const firebaseLobby = async (lobby: any) => {
    addDoc(collection(db, 'lobbies'), lobby).then((response) => {
      setStep(4);
      setShareUrl(`${window.location.href.split('/create')[0]}/lobby-details/${response.id}`);
      fireAction();
    }).catch((error) => {
      console.error("Error adding document: ", error);
    });
  }
  const createFirebaseLobby = async (raffleId: any) => {
    const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // the 24 will change when time limits are added
    const lobby = {
      collection: confirmNft?.name,
      createdAt: Timestamp.now(),
      confirmedPlayers: 1,
      endDate: Timestamp.fromDate(endDate),
      evmChain: chain?.name,
      isPrivate: false,
      nfts: [confirmNft.toJSON()],
      timeLimit: 24, // Update when time limits are added
      status: 'Active',
      totalPlayers: playerAmount,
      raffleId: raffleId,
    }

    firebaseLobby(lobby);
  }

  // Get dropdown list of collections filter
  useEffect(() => {
    const uniqueArray: any[] = [];
    imutableNftList.map((item: any) => {
      if (!uniqueArray.includes(item?.name)) {
        uniqueArray.push(item?.name);
      }
      setCollectionList(uniqueArray);
    });
  }, [imutableNftList]);

  // Filter NFT grid by collection
  function filterCollection(collection: string) {
    const resetNftList = imutableNftList;
    if (collection !== 'all') {
      const filtered = resetNftList.filter((nft: any) => nft?.name === collection);
      setNfts(filtered);
    } else {
      setNfts(resetNftList);
    }
  }

  // Save share link to clipboard
  const clipboardlink = () => {
    setShowClipboardAlert(true);
    navigator.clipboard.writeText(shareUrl);
    setTimeout(() => {
      setShowClipboardAlert(false);
    }, 3000);
  }

  return (
    <>
      {showErrorAlert &&
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{errorMessage}</span>
        </div>
      }
      {showClipboardAlert &&
        <div className="alert alert-success fixed">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Link copied to clipboard!</span>
        </div>
      }
      <WagmiConfig config={wagmiConfig}>
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
              <button onClick={() => processStep2(3)} onMouseEnter={() => setShowQuokkas(3)} className="btn btn-secondary join-item">3 Players</button>
              <button onClick={() => processStep2(5)} onMouseEnter={() => setShowQuokkas(5)} className="btn btn-secondary join-item">5 Players</button>
              <button onClick={() => processStep2(7)} onMouseEnter={() => setShowQuokkas(7)} className="btn btn-secondary join-item">7 Players</button>
              <button onClick={() => processStep2(10)} onMouseEnter={() => setShowQuokkas(10)} className="btn btn-secondary join-item">10 Players</button>
            </div>
            <div className="block sm:hidden">
              <div className="join drop-shadow-md mb-4">
                <button onClick={() => processStep2(3)} onMouseEnter={() => setShowQuokkas(3)} className="btn btn-secondary join-item">3 Players</button>
                <button onClick={() => processStep2(5)} onMouseEnter={() => setShowQuokkas(5)} className="btn btn-secondary join-item">5 Players</button>
              </div>
              <div className="join drop-shadow-md">
                <button onClick={() => processStep2(7)} onMouseEnter={() => setShowQuokkas(7)} className="btn btn-secondary join-item">7 Players</button>
                <button onClick={() => processStep2(10)} onMouseEnter={() => setShowQuokkas(10)} className="btn btn-secondary join-item">10 Players</button>
              </div>
            </div>
            <div className="flex justify-center items-center mt-12">
              <div className="grid grid-cols-5 gap-1">
                {quokkas.map((quokka: any, index: any) => (
                  <div key={index}>
                    {index < showQuokkas &&
                      <div className="col-span-1">
                        <label className="swap swap-flip text-9xl">
                          <input type="checkbox" />
                          <div className="swap-on"><Image alt="player amount" width={80} height={80} src={`/images/${quokka}.png`} /></div>
                          <div className="swap-off"><Image alt="player amount" width={80} height={80} src={`/images/${quokka}.png`} /></div>
                        </label>
                      </div>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div >
        }

        {/* step 2 */}
        {(step == 2) &&
          <div className="mt-12 text-center">
            {address && isConnected ?
              <>
                <h1 className="font-semibold text-2xl mb-4">Connected wallet address</h1>
                <span className="hidden sm:block">{address}</span>
                <span className="block sm:hidden">{truncateAddress(address)}</span>
                <div className="flex justify-between items-center mt-6">
                  <div className="dropdown">
                    <label tabIndex={0} className="btn m-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                      Filter<span className="hidden sm:flex">by collection</span>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52 mt-2">
                      {collectionList.map((collection: string, index: any) => (
                        <li key={index}><a onClick={() => filterCollection(collection)}>{collection}</a></li>
                      ))}
                      <li><a onClick={() => filterCollection('all')}>Show All</a></li>
                    </ul>
                  </div>
                  <button className="btn btn-secondary drop-shadow-md" onClick={() => window.rulesModal.showModal()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span className="hidden sm:flex">Raffle Rules</span>
                  </button>
                </div>
                <div className="flex justify-center bg-base-200 rounded-lg p-5 mt-2 drop-shadow-md">
                  {nfts.length == 0 ?
                    <div className="flex justify-center items-center">No NFTs available</div>
                    :
                    <ul role="list" className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-5 lg:grid-cols-7 lg:gap-x-7 lg:gap-y-7">
                      {nfts.map((nft: any, index: any) => (
                        <li onClick={() => { setSelectedNft(nft); window.selectNftModal.showModal() }} key={index} className="relative cursor-pointer">
                          <div>
                            {nft.media?.mimetype === 'video/mp4' ?
                              <div className="relative group">
                                <video className="rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent hover:outline-success" width="100" height="100" muted loop autoPlay>
                                  <source src={nft.media?.media_collection?.medium.url} type="video/mp4" />
                                </video>
                                <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-lg font-bold truncate px-2"># {nft.tokenId}</p>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-lg font-bold truncate px-2">{nft?.name}</p>
                                </div>
                              </div>
                              :
                              <div className="relative group">
                                <img className="rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent group-hover:outline-success"
                                  src={nft.media?.mediaCollection?.medium.url ? nft.media?.mediaCollection?.medium.url : nft?.media?.originalMediaUrl}
                                  alt="NFT image unreachable" width={150} height={150} />
                                <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-lg font-bold truncate px-2"># {nft.tokenId}</p>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-lg font-bold truncate px-2">{nft?.name}</p>
                                </div>
                              </div>
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
                <div className="text-sm text-accent mt-8">* If some images are missing it might be due to your ad blocker</div>
              </>
              :
              <>
                <h1 className="font-semibold text-2xl mb-4">Sign into your NFT wallet</h1>
                <div className="w-full flex justify-center">
                  <ConnectButton />
                </div>
              </>
            }
          </div >
        }

        {/* step 3 */}
        {(step == 3) &&
          <div className="mt-12">
            {address && isConnected ?
              <>
                <div className="grid grid-cols-1 space-x-6 sm:grid-cols-2">
                  <div className="col-span-1 flex justify-center">
                    <div className="card card-compact w-96 bg-base-200 shadow-xl">
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
                      <p>{chain?.name}</p>
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
                      <p>{formatUnits(fee, 18)} {chain?.nativeCurrency.symbol}</p>
                    </div>

                    <button onClick={() => handleFinalizeLobby()} className="hidden sm:block btn btn-accent drop-shadow-md bottom-0 absolute">
                      {isLoading ? <span className="loading loading-ring loading-lg"></span> : 'Create Lobby'}</button>
                    <button onClick={() => handleFinalizeLobby()} className="block sm:hidden btn btn-accent drop-shadow-md mt-4 w-full">
                      {isLoading ? <span className="loading loading-ring loading-lg"></span> : 'Create Lobby'}
                    </button>
                  </div >
                </div >
              </>
              :
              <>
                <h1 className="font-semibold text-2xl mb-4 text-center">Sign into your NFT wallet</h1>
                <div className="w-full flex justify-center">
                  <ConnectButton />
                </div>
              </>
            }
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

        <dialog id="rulesModal" className="modal">
          <form method="dialog" className="modal-box">
            <h3 className="font-bold text-lg">Raffle Rules</h3>
            <ol className="py-4">
              <div className="chat chat-start mb-2">
                <div className="chat-bubble chat-bubble-primary">Players must have the same NFT collection</div>
              </div>
              <div className="chat chat-end mb-2">
                <div className="chat-bubble chat-bubble-secondary">The lobby will be accesible to anyone with the &apos;Share Link&apos;
                  <span className="text-gray-50"> (Only share with people you want to play with)</span>
                </div>
              </div>
              <div className="chat chat-start mb-2">
                <div className="chat-bubble chat-bubble-primary">The lobby will be open for 24 hours from the time it is created</div>
              </div>
              <div className="chat chat-end mb-2">
                <div className="chat-bubble chat-bubble-secondary">A winner will be chosen when all players have joined the lobby</div>
              </div>
              <div className="chat chat-start mb-2">
                <div className="chat-bubble chat-bubble-primary">If all players have not joined the lobby by 24 hours, NFTs will be returned to their original owners</div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-secondary">GLHF!</div>
              </div>
            </ol>
            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </div>
          </form>
        </dialog>
      </WagmiConfig>
    </>
  )
}