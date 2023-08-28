'use client'
import { WagmiConfig, useAccount, useContractWrite } from "wagmi";
import { wagmiConfig } from "../../utils/wagmi-config.ts";
import { getNetwork, watchNetwork } from '@wagmi/core'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getRaffleCount, useRabbleContract, verifyApproval, useFee } from '../../utils/hooks.ts';
import { useEffect, useState } from "react";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useQRCode } from "next-qrcode";
import { rabbleAbi } from '../../utils/config.ts';
import { firebaseConfig } from '../../utils/firebase-config.ts';
import { formatUnits } from 'viem';
import { fireAction } from '../../utils/functions.ts';
import SoundBoard from "../../components/soundboard.tsx";
import { getMoralisNfts, getPicassoNfts } from "../../lib/nfts.ts";
import Tilt from 'react-parallax-tilt';

//Initialize firebase backend
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

declare global {
  interface Window {
    selectNftModal: any;
    rulesModal: any;
  }
}

export default function CreateLobby() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [step, setStep] = useState(1);
  const [nfts, setNfts] = useState([] as any[]);
  const [selectedNft, setSelectedNft] = useState({} as any);
  const [confirmNft, setConfirmNft] = useState({} as any);
  const [shareUrl, setShareUrl] = useState('');
  const { address, isConnected } = useAccount();
  const [showClipboardAlert, setShowClipboardAlert] = useState(false);
  const { SVG } = useQRCode();
  const [collectionList, setCollectionList] = useState([] as string[]);
  const [imutableNftList, setImutableNftList] = useState([] as any[]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const rabbleContract = useRabbleContract();
  const fee = useFee();
  const [chain, setChain] = useState(getNetwork().chain);
  let { data, isLoading, isSuccess, write } = useContractWrite({
    address: rabbleContract?.address,
    abi: rabbleAbi,
    functionName: 'createPublicRaffle',
    args: [
      confirmNft.collectionAddress ? confirmNft.collectionAddress : confirmNft.tokenAddress?.checksum,
      playerAmount,
      confirmNft.tokenId,
      86400 // 24 hours
    ],
    value: fee,
    onSuccess: (res: any) => {
      getRaffleCount().then(async (response) => {
        const raffleId = Number(response) + 1;
        createFirebaseLobby(raffleId); // Not exact match with the contract timestamp
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
  const unwatchNetwork = watchNetwork((network) => setChain(network.chain));

  useEffect(() => {
    if (address && isConnected && chain?.id === 42161)
      getMoralisNfts(address).then((response: any) => {
        setNfts(response);
        setImutableNftList(response);
      });
    if (address && isConnected && chain?.id === 43114)
      getPicassoNfts(address).then((response: any) => {
        setNfts(response);
        setImutableNftList(response);
      });
  }, [address, isConnected, chain?.id]);

  useEffect(() => {
  }, [chain?.id]);

  // Finalize lobby and create the lobby in the blockchain
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const handleFinalizeLobby = async () => {
    if (confirmNft) {
      verifyApproval(confirmNft?.collectionAddress ? confirmNft?.collectionAddress : confirmNft.tokenAddress?.checksum, write, (isApprovalStatusLoading: boolean) => {
        setIsApprovalLoading(isApprovalStatusLoading);
      });
    }
  }

  // Get the lobby name from the input
  const [lobbyName, setLobbyName] = useState('');
  const handleLobbyName = (event: any) => {
    setLobbyName(event.target.value);
  };

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
    const modifiedObject = Object.fromEntries(
      Object.entries(chain?.id === 43114 ? confirmNft : confirmNft.toJSON()).map(([key, value]) => [key, value !== undefined ? value : null])
    );
    const playerNft = chain?.id === 43114 ? { ...modifiedObject, battleCry: battleCry } : { ...modifiedObject, battleCry: battleCry };
    const lobby = {
      collection: confirmNft?.collectionName ? confirmNft?.collectionName : confirmNft?.name,
      collectionAddress: confirmNft?.collectionAddress ? confirmNft?.collectionAddress : confirmNft?.tokenAddress.lowercase,
      createdAt: Timestamp.now(),
      confirmedPlayers: 1,
      endDate: Timestamp.fromDate(endDate),
      evmChain: chain?.name,
      isPrivate: false,
      nfts: [playerNft],
      timeLimit: 24, // Update when time limits are added
      status: 'Active',
      totalPlayers: playerAmount,
      raffleId: raffleId,
      lobbyName: lobbyName,
      chainId: chain?.id,
    }

    firebaseLobby(lobby);
  }

  // Get dropdown list of collections filter
  useEffect(() => {
    const uniqueArray: any[] = [];
    imutableNftList?.map((item: any) => {
      if (!uniqueArray.includes(item?.collectionName ? item?.collectionName : item?.name)) {
        uniqueArray.push(item?.collectionName ? item?.collectionName : item?.name);
      }
      setCollectionList(uniqueArray);
    });
  }, [imutableNftList]);

  // Filter NFT grid by collection
  function filterCollection(collection: string) {
    const resetNftList = imutableNftList;
    if (collection !== 'all') {
      const filtered = resetNftList.filter((nft: any) => (nft?.collectionName ? nft?.collectionName : nft?.name) == collection);
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

  // Handle battle cry
  const [battleCry, setBattleCry] = useState(null);
  const handleValueChange = (newValue: any) => {
    setBattleCry(newValue);
  };

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
        <div className="flex justify-center px-4">
          <ul className="steps">
            <li onClick={() => (step > 1 && step !== 4) && setStep(1)} className={step >= 1 ? "step cursor-pointer step-primary" : "step"}></li>
            <li onClick={() => (step > 2 && step !== 4) && setStep(2)} className={step >= 2 ? "step cursor-pointer step-primary" : "step"}></li>
            <li onClick={() => (step > 3 && step !== 4) && setStep(3)} className={step >= 3 ? "step cursor-pointer step-primary" : "step"}></li>
            <li className={step === 4 ? "step cursor-pointer step-primary" : "step"}></li>
          </ul>
        </div>

        {/* step 1 */}
        {(step == 1) &&
          <div className="mt-12 text-center">
            <h1 className="font-semibold text-2xl mb-2">Choose the number of players</h1>
            <p className="mb-4">Select the amount players you would like to invite to your lobby and compete for the chance to win all the NFTs from your selected collection.</p>

            <div className="p-6 bg-neutral rounded-box w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Tilt glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="right" glareBorderRadius="20px">
                <div onClick={() => processStep2(3)}
                  className="card card-compact w-full h-full bg-base-100 shadow-xl cursor-pointer col-span-1">
                  <div className="card-body">
                    <div className="flex items-center justify-center">
                      <figure><Image alt="player amount" width={200} height={200} src={`/images/Quokka_Cool.png`} /></figure>
                    </div>
                    <h2 className="card-title flex items-end justify-center mt-auto">3 Players</h2>
                  </div>
                </div>
              </Tilt>

              <Tilt glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="right" glareBorderRadius="20px">
                <div onClick={() => processStep2(5)}
                  className="card card-compact w-full h-full bg-base-100 shadow-xl cursor-pointer col-span-1">
                  <div className="card-body">
                    <div className="flex items-center justify-center">
                      <figure><Image alt="player amount" width={200} height={200} src={`/images/Quokka.png`} /></figure>
                    </div>
                    <h2 className="card-title flex items-end justify-center mt-auto">5 Players</h2>
                  </div>
                </div>
              </Tilt>

              <Tilt glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="right" glareBorderRadius="20px">
                <div onClick={() => processStep2(7)}
                  className="card card-compact w-full h-full bg-base-100 shadow-xl cursor-pointer col-span-1">
                  <div className="card-body">
                    <div className="flex items-center justify-center">
                      <figure><Image alt="player amount" width={200} height={200} src={`/images/Quokka_Leaf.png`} /></figure>
                    </div>
                    <h2 className="card-title flex items-end justify-center mt-auto">7 Players</h2>
                  </div>
                </div>
              </Tilt>

              <Tilt glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="right" glareBorderRadius="20px">
                <div onClick={() => processStep2(10)}
                  className="card card-compact w-full h-full bg-base-100 shadow-xl cursor-pointer col-span-1">
                  <div className="card-body">
                    <div className="flex items-center justify-center">
                      <figure><Image alt="player amount" width={200} height={200} src={`/images/Quokka_Wave.png`} /></figure>
                    </div>
                    <h2 className="card-title flex items-end justify-center mt-auto">10 Players</h2>
                  </div>
                </div>
              </Tilt>
            </div>
          </div >
        }

        {/* step 2 */}
        {(step == 2) &&
          <div className="mt-12 text-center">

            {address && isConnected ?
              <>
                <h1 className="font-semibold text-2xl mb-2">Select an NFT</h1>
                <p className="mb-4">Choose the NFT you would like to raffle for this lobby. All players will raffle NFTs in the same collection of the NFT choosen.</p>
                <div className="flex justify-between items-center mt-6">
                  <div className="dropdown">
                    <label tabIndex={0} className="btn m-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                      Filter<span className="hidden sm:flex">by collection</span>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-52 mt-2">
                      {collectionList.map((collectionName: string, index: any) => (
                        <li key={index}><a onClick={() => filterCollection(collectionName)}>{collectionName}</a></li>
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
                  {nfts?.length == 0 ?
                    <div className="flex justify-center items-center">No NFTs available</div>
                    :
                    <ul role="list" className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-5 lg:grid-cols-7 lg:gap-x-7 lg:gap-y-7">
                      {nfts?.map((nft: any, index: any) => (
                        <li onClick={() => { setSelectedNft(nft); window.selectNftModal.showModal() }} key={index} className="relative cursor-pointer">
                          <div>
                            {/* TODO: Remove if there is no video data returned from Pickasso */}
                            {nft.media?.mimetype === 'video/mp4' ?
                              <div className="relative group">
                                <video className="transform transition-transform rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent hover:outline-success" width="100" height="100" muted loop autoPlay>
                                  <source src={nft.metadata?.pImage ? nft.metadata?.pImage : nft.media?.mediaCollection?.medium.url} type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex justify-center items-center opacity-0 transition-opacity hover:opacity-100">
                                  <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-lg font-bold truncate px-2"># {nft.tokenId}</p>
                                  </div>
                                  <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-lg font-bold truncate px-2">{nft?.collectionName ? nft?.collectionName : nft?.name}</p>
                                  </div>
                                </div>
                              </div>
                              :
                              <div className="relative group">
                                {chain?.id === 42161 ?
                                  <img className="transform transition-transform rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent group-hover:outline-success"
                                    src={nft.media?.mediaCollection?.medium.url ? nft.media?.mediaCollection?.medium.url : nft?.media?.originalMediaUrl}
                                    alt="NFT image unreachable" width={150} height={150} />
                                  :
                                  <>
                                    {nft?.metadata?.pImage ?
                                      <Image className="transform transition-transform rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent group-hover:outline-success"
                                        src={nft?.metadata?.pImage}
                                        alt="NFT image unreachable" width={150} height={150} />
                                      :
                                      <Image className="transform transition-transform rounded-lg drop-shadow-md outline outline-offset-1 outline-2 outline-accent group-hover:outline-success"
                                        src="/images/no-images.png"
                                        alt="NFT image unreachable" width={150} height={150} />}
                                  </>
                                }
                                <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex justify-center items-center opacity-0 transition-opacity hover:opacity-100">
                                  <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-lg font-bold truncate px-2"># {nft.tokenId}</p>
                                  </div>
                                  <div className="absolute top-0 left-0 w-full h-full flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-lg font-bold truncate px-2">{nft?.collectionName ? nft?.collectionName : nft?.name}</p>
                                  </div>
                                </div>
                              </div>
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
              </>
              :
              <>
                <h1 className="font-semibold text-2xl mb-4">Sign into your wallet to continue</h1>
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
                <h1 className="font-semibold text-2xl mb-2 text-center">Review selection</h1>
                <p className="mb-4 text-center">Go over the details of your selection and prepare to play. Additionaly, you can name your lobby and even choose a battle cry.</p>
                <div className="grid grid-cols-1 space-x-6 sm:grid-cols-2 mt-6">
                  <div className="col-span-1 flex justify-center">

                    <div className="p-6 bg-neutral rounded-box flex justify-center">
                      <div className="card card-compact w-80 bg-base-200 shadow-xl">
                        {selectedNft.metadata?.pImage || selectedNft.media?.mediaCollection?.high.url || selectedNft?.media?.originalMediaUrl ?
                          <figure><img src={selectedNft.metadata?.pImage ? selectedNft.metadata?.pImage : (selectedNft.media?.mediaCollection?.high.url ? selectedNft.media?.mediaCollection?.high.url : selectedNft?.media?.originalMediaUrl)} alt="NFT Image" /></figure>
                          :
                          <figure><Image src="/images/no-images.png" alt="NFT Image" width={500} height={500} /></figure>
                        }
                        <div className="card-body">
                          <h2 className="card-title">{selectedNft?.collectionSymbol ? selectedNft?.collectionSymbol : selectedNft.symbol} #{selectedNft?.tokenId}</h2>
                          <p><span className="font-semibold truncate">Collection: </span>{selectedNft?.name ? selectedNft?.name : selectedNft?.collectionName}</p>
                          <SoundBoard onValueChange={handleValueChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 mt-4 sm:mt-0 flex flex-col">
                    <div>
                      <div className="flex flex-col w-full border-opacity-50">
                        <div className="mb-4">
                          <h2 className="font-semibold">Network</h2>
                          <p>{chain?.name}</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="font-semibold">Collection
                            <div className="tooltip" data-tip="Players can only raffle with NFTs in this collection.">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                              </svg>
                            </div>
                          </h2>
                          <p>{confirmNft?.collectionName ? confirmNft?.collectionName : confirmNft?.name}</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="font-semibold">Number of Players</h2>
                          <p>{playerAmount}</p>
                        </div>

                        <div className="mb-4">
                          <h2 className="font-semibold">Time Limit
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

                        <div className="divider"><span>Lobby Name <span className="text-sm text-gray-500">(Optional)</span></span></div>
                        <input type="text" onChange={handleLobbyName} placeholder="Ex: Quokka Clan" className="input input-bordered w-full" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button onClick={() => handleFinalizeLobby()} className="btn btn-accent drop-shadow-md mt-4 w-full">
                        {isLoading || isApprovalLoading ? <span className="loading loading-ring loading-lg"></span> : 'Create Lobby'}
                      </button>
                    </div>
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
            <h1 className="font-semibold text-xl mb-4 text-center">Share QR Code</h1>
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
                {selectedNft?.metadata?.pImage || selectedNft?.media?.mediaCollection?.high?.url || selectedNft?.media?.originalMediaUrl ?
                  <figure>
                    <img className="rounded-lg drop-shadow-md"
                      src={selectedNft?.metadata?.pImage ? selectedNft?.metadata?.pImage : selectedNft?.media?.mediaCollection?.high?.url ? selectedNft?.media?.mediaCollection?.high?.url : selectedNft?.media?.originalMediaUrl}
                      alt="NFT image unreachable" />
                  </figure>
                  :
                  <figure>
                    <Image className="rounded-lg drop-shadow-md"
                      src="/images/no-images.png"
                      height={200}
                      width={200}
                      alt="NFT image unreachable" />
                  </figure>
                }
              </div>

              <div className="col-span-1 mt-4 sm:mt-0 flex flex-col">
                <div>
                  <p><span className="font-semibold">Collection:</span> {selectedNft?.collectionName ? selectedNft?.collectionName : selectedNft?.name}</p>
                  <div className="divider"></div>
                  <p><span className="font-semibold">Symbol:</span> {selectedNft?.collectionSymbol ? selectedNft?.collectionSymbol : selectedNft.symbol}</p>
                  <p><span className="font-semibold">Token ID:</span> {selectedNft?.tokenId}</p>
                </div>
                <div className="mt-auto">
                  <button onClick={() => { setConfirmNft(selectedNft); setStep(3) }} className="btn btn-accent drop-shadow-md mt-4 w-full">Confirm</button>
                </div>
              </div>
            </div >
          </form >
        </dialog >

        <dialog id="rulesModal" className="modal">
          <form method="dialog" className="modal-box">
            <h3 className="font-bold text-lg">Raffle Rules</h3>
            <div className="mockup-browser border bg-base-300 mt-6">
              <div className="mockup-browser-toolbar">
                <div className="input">https://rabblerabble.xyx</div>
              </div>
              <div className="px-4 py-16 bg-base-200">
                <p className="mb-4">Players must have the same NFT collection</p>
                <p className="mb-4">Public lobbies will be accessible to anyone with the &apos;Share Link&apos;</p>
                <p className="mb-4">Private lobbies will be accessible to anyone white listed by the lobby creator</p>
                <p className="mb-4">The lobby will be open for 24 hours from the time it is created</p>
                <p className="mb-4">A winner will be chosen when all players have joined the lobby</p>
                <p className="mb-4">If all players have not joined the lobby by 24 hours, NFTs will be returned to their original owners</p>
                <p className="mb-4 flex items-end">😎 GLHF &nbsp;<span className="loading loading-dots loading-xs"></span></p>
              </div>
            </div>
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