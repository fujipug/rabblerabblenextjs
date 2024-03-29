'use client'
import { useAccount, useContractWrite } from "wagmi";
import { getNetwork, watchNetwork } from "@wagmi/core";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { collection, doc, documentId, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import converter from 'number-to-words';
import localFont from 'next/font/local'
const myFont = localFont({ src: '../../../public/fonts/Ready-Player-One.otf' })
import Image from "next/image";
import Countdown from "../../../components/countdown";
import { rabbleAbi } from '../../../utils/config.ts';
import { useRabbleContract, verifyApproval, useFee, getRaffleById } from '../../../utils/hooks.ts';
import { firebaseConfig } from '../../../utils/firebase-config.ts';
import { formatUnits } from 'viem';
import { fireAction } from "../../../utils/functions.ts";
import SoundBoard from "../../../components/soundboard.tsx";
import { getMoralisNfts, getPicassoNfts } from "../../../lib/nfts.ts";
import { useQRCode } from "next-qrcode";
import Link from "next/link";
import { updateFirebaseWinner } from "../../../lib/lobbies.ts";
import RaffleAnimation from "../../../components/raffle-animation.tsx";

declare global {
  interface Window {
    selectNftModal: any;
    rulesModal: any;
    raffle: any
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function JoinLobbyPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(1);
  const [nfts, setNfts] = useState([] as any[]);
  const [selectedNft, setSelectedNft] = useState({} as any);
  const [confirmNft, setConfirmNft] = useState({} as any);
  const { address, isConnected } = useAccount();
  const [lobbyDetails, setLobbyDetails] = useState() as any;
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const rabbleContract = useRabbleContract();
  const fee = useFee();
  const [chain, setChain] = useState(getNetwork().chain);
  const [showClipboardAlert, setShowClipboardAlert] = useState(false);
  const { SVG } = useQRCode();
  const [shareUrl, setShareUrl] = useState('');

  let { data, isLoading, isSuccess, write } = useContractWrite({
    address: rabbleContract?.address,
    abi: rabbleAbi,
    functionName: 'joinRaffle',
    args: [
      lobbyDetails?.data.raffleId,
      confirmNft.tokenId,
    ],
    value: fee,
    onSuccess: async (hash: any) => {
      const completedLobby = ((lobbyDetails?.data.confirmedPlayers + 1) === lobbyDetails?.data.totalPlayers) ? true : false;
      await updateFirebaseLobby(completedLobby).then(async () => {
        fireAction();
        await getRaffleById(lobbyDetails?.data.raffleId).then(async (res: any) => {
          if (Number(res[3]) === lobbyDetails?.data.confirmedPlayers + 1) {
            raffle();
          }
        })
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

  // Retrieves Moralis NFts
  const unwatchNetwork = watchNetwork((network) => setChain(network.chain));

  const fetchData = async (results: any) => {
    try {
      const q = query(collection(db, 'lobbies'), where(documentId(), '==', params.id));
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        const filtered = results.filter((nft: any) => (nft?.collectionAddress ? nft?.collectionAddress : nft?.tokenAddress.lowercase) == doc.data().collectionAddress);
        setNfts(filtered);
        setLobbyDetails({ id: doc.id, data: doc.data() });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (address && isConnected && chain?.id === 42161)
      getMoralisNfts(address).then((response: any) => fetchData(response));
    if (address && isConnected && chain?.id === 43114)
      getPicassoNfts(address).then((response: any) => fetchData(response));
    console.log('chain', `${window.location.href.split('/join')[0]}/lobby-details/${params.id}`);
  }, [address, isConnected, chain?.id]);

  // Join player to Lobby
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const handleFinalizeJoinLobby = async () => {
    if (confirmNft) {
      verifyApproval((confirmNft?.tokenAddress?.checksum ? confirmNft?.tokenAddress?.checksum : confirmNft?.collectionAddress), write, (isApprovalStatusLoading: boolean) => {
        setIsApprovalLoading(isApprovalStatusLoading);
      });
    }
  }

  // Update the firebase database with the new player
  const updateFirebaseLobby = async (isCompleteLobby: boolean) => {
    const lobbyRef = doc(db, 'lobbies', lobbyDetails.id);
    const modifiedObject = Object.fromEntries(
      Object.entries(chain?.id === 43114 ? confirmNft : confirmNft.toJSON()).map(([key, value]) => [key, value !== undefined ? value : null])
    );
    const playerNft = chain?.id === 43114 ? { ...modifiedObject, battleCry: battleCry } : { ...modifiedObject, battleCry: battleCry };
    const joinedNfts = [...lobbyDetails.data.nfts, playerNft];

    const result = updateDoc(lobbyRef, {
      confirmedPlayers: lobbyDetails?.data.confirmedPlayers + 1,
      nfts: joinedNfts,
      status: isCompleteLobby ? 'Completed' : 'Active'
    });

    result.then(() => {
      setStep(3);
      setShareUrl(`${window.location.href.split('/join')[0]}/lobby-details/${params.id}`);
    });

    return result;
  }

  // Handle battle cry
  const [battleCry, setBattleCry] = useState(null);
  const handleValueChange = (newValue: any) => {
    setBattleCry(newValue);
  };

  // Save share link to clipboard
  const clipboardlink = () => {
    setShowClipboardAlert(true);
    navigator.clipboard.writeText(shareUrl);
    setTimeout(() => {
      setShowClipboardAlert(false);
    }, 3000);
  }

  const [count, setCount] = useState(0); // Initial Count time in seconds
  const raffle = () => {

    window.raffle.showModal();
    const interval = setInterval(() => {
      getRaffleById(lobbyDetails?.data?.raffleId).then(async (res: any) => {
        if (res[5].toString() !== '0x0000000000000000000000000000000000000000') {
          await updateFirebaseWinner(res[5].toString(), lobbyDetails?.id).then(() => {
            window.raffle.close();
            clearInterval(interval);
            location.href = `/lobby-details/${params.id}`;
          });
        } else {
          setCount(prevCounter => prevCounter + 1);
        }
      })
    }, 1000); // Execute every second (1000 milliseconds)

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
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

      <div className="flex justify-center px-4">
        <ul className="steps">
          <li onClick={() => (step > 1 && step !== 4) && setStep(1)} className={step >= 1 ? "step cursor-pointer step-primary" : "step"}></li>
          <li onClick={() => (step > 2 && step !== 4) && setStep(2)} className={step >= 2 ? "step cursor-pointer step-primary" : "step"}></li>
          <li onClick={() => (step > 2 && step !== 4) && setStep(3)} className={step >= 3 ? "step cursor-pointer step-primary" : "step"}></li>
        </ul>
      </div>

      {(step == 1) &&
        <div className="mt-12 text-center">
          {address && isConnected && lobbyDetails ?
            <>
              <h1 className="font-semibold text-2xl mb-2">Select an NFT</h1>
              <p className="mb-4">Choose the NFT you would like to raffle for this lobby. You can only choose from the collection the lobby creator specified.</p>
              <div className="flex justify-between items-center mt-6">
                <div className="dropdown">
                  <label tabIndex={0} className="btn m-1 cursor-default">
                    <span className="font-bold">Collection:</span> {lobbyDetails?.data.collection}
                  </label>
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
                  <div className="flex justify-center items-center">No NFTs in this collection</div>
                  :
                  <ul role="list" className="grid grid-cols-3 gap-x-3 gap-y-3 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-5 lg:grid-cols-7 lg:gap-x-7 lg:gap-y-7">
                    {nfts.map((nft: any, index: any) => (
                      <li onClick={() => { setSelectedNft(nft); window.selectNftModal.showModal() }} key={index} className="relative cursor-pointer">
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
                                <p className="text-white text-lg font-bold truncate px-2">{nft?.name ? nft?.name : nft?.collectionName}</p>
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
                                <p className="text-white text-lg font-bold truncate px-2">{nft?.name ? nft?.name : nft?.collectionName}</p>
                              </div>
                            </div>
                          </div>
                        }
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
        </div>
      }

      {(step == 2) &&
        <div className="mt-12">
          {address && isConnected ?
            <>
              <h1 className="font-semibold text-2xl mb-2 text-center">Review selection</h1>
              <p className="mb-4 text-center">Go over the details of your selection and prepare to play. Additionaly, you can choose a battle cry.</p>
              <div className="grid grid-cols-1 space-x-6 sm:grid-cols-2 mt-6">
                <div className="col-span-1 flex justify-center">

                  <div className="p-6 bg-neutral rounded-box flex justify-center">
                    <div className="card card-compact w-80 bg-base-200 shadow-xl">
                      {confirmNft.metadata?.pImage || confirmNft.media?.mediaCollection?.high.url || confirmNft?.media?.originalMediaUrl ?
                        <figure><img src={confirmNft.metadata?.pImage ? confirmNft.metadata?.pImage : (confirmNft.media?.mediaCollection?.high.url ? confirmNft.media?.mediaCollection?.high.url : confirmNft?.media?.originalMediaUrl)} alt="NFT Image" /></figure>
                        :
                        <figure><Image src="/images/no-images.png" alt="NFT Image" width={500} height={500} /></figure>
                      }
                      <div className="card-body">
                        <h2 className="card-title">{confirmNft?.symbol ? confirmNft?.symbol : confirmNft?.collectionSymbol} #{confirmNft?.tokenId}</h2>
                        <p className="mb-2"><span className="font-semibold truncate">Collection: </span> {confirmNft?.name ? confirmNft?.name : confirmNft?.collectionName}</p>
                        <SoundBoard onValueChange={handleValueChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 mt-4 sm:mt-0 flex flex-col">
                  <div>
                    <div className="mb-4">
                      <h2 className="font-semibold">Time Remaining</h2>
                      <Countdown endTime={lobbyDetails?.data.endDate} size={'medium'} />
                    </div>

                    <div className="mb-4">
                      <h2 className="font-semibold">Network</h2>
                      <p>{lobbyDetails.data.evmChain} </p>
                    </div>

                    <div className="mb-4">
                      <h2 className="font-semibold">Collection
                        <div className="tooltip" data-tip="Players can only raffle with NFTs in this collection.">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                          </svg>
                        </div>
                      </h2>
                      <p>{lobbyDetails.data.collection}</p>
                    </div>

                    <div className="mb-4">
                      <h2 className="font-semibold">Lobby Fee</h2>
                      <p>{formatUnits(fee, 18)} {chain?.nativeCurrency.symbol}</p>
                    </div>

                    <div className="flex flex-col w-full border-opacity-50">
                      <div className="divider"></div>
                    </div>

                    <div className="mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center">
                      <div className="mr-4">
                        <h2 className="font-semibold text-3xl"><span className={myFont.className}>Good Luck</span></h2>
                        <p className="text-xl"><span className={myFont.className}>Player {converter.toWords(lobbyDetails?.data.confirmedPlayers + 1)}</span></p>
                      </div>
                      <Image src="/images/gl-banan.gif" width={60} height={60} alt="Good Luck Banana"></Image>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <button onClick={() => handleFinalizeJoinLobby()} className="btn btn-accent drop-shadow-md mt-4 w-full">
                      {isLoading || isApprovalLoading ? <span className="loading loading-ring loading-lg"></span> : 'Join Game'}
                    </button>
                  </div>
                </div>
              </div>
            </>
            :
            <>
              <h1 className="font-semibold text-2xl mb-4 text-center">Sign into your NFT wallet</h1>
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
                    height={150}
                    width={150}
                    alt="NFT image unreachable" />
                </figure>
              }
            </div>

            <div className="col-span-1 mt-4 sm:mt-0 flex flex-col">
              <div>
                <p><span className="font-semibold">Collection:</span> {selectedNft?.name ? selectedNft?.name : selectedNft?.collectionName}</p>
                <div className="divider"></div>
                <p><span className="font-semibold">Symbol:</span> {selectedNft?.symbol ? selectedNft?.symbol : selectedNft?.collectionSymbol}</p>
                <p><span className="font-semibold">Token ID:</span> {selectedNft?.tokenId}</p>
              </div>
              <div className="mt-auto">
                <button onClick={() => { setConfirmNft(selectedNft); setStep(2) }} className="btn btn-accent drop-shadow-md mt-4 w-full">Confirm</button>
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
      <dialog id="raffle" className="modal">
        {/* TODO: This needs to be updated for polygon testing to ownerOf also */}
        <RaffleAnimation lobbyDetails={lobbyDetails} finalPlayerAddress={confirmNft?.owner} />
      </dialog>
    </>
  )
}