'use client'
import { useEffect, useState } from "react";
import { EvmChain, EvmNft } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { Timestamp, collection, documentId, getDocs, getFirestore, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import converter from 'number-to-words';
import localFont from 'next/font/local'
const myFont = localFont({ src: '../../../public/fonts/Ready-Player-One.otf' })
import Image from "next/image";
import Countdown from "../../../components/countdown";
import { rabbleAbi } from '../../../utils/config.ts';
import { useRabbleContract } from '../../../utils/hooks.ts';

declare global {
  interface Window {
    selectNftModal: any;
  }
}

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

function FinalizeJoinLobby(props: { confirmedNft?: EvmNft, lobbyId?: string }) {
  const endDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // the 24 will change when time limits are added
  const { address, isConnected } = useAccount();
  const rabbleContract = useRabbleContract();
  const { config } = usePrepareContractWrite({
    address: rabbleContract?.address,
    abi: rabbleAbi,
    functionName: 'joinRaffle',
    args: [
      props.lobbyId,
      props.confirmedNft?.tokenId,
    ],
    value: 100000000000000000n,
  })
  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return (
    <>
      <button className="btn btn-accent drop-shadow-md mt-6" onClick={() => write?.()}>
        {isLoading ? <span className="loading loading-ring loading-lg"></span> : 'Join Lobby'}
      </button >
      {
        isSuccess && (
          <div>
            DONE
          </div>
        )
      }
    </>
  )
}

export default function JoinLobbyPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(1);
  const [nfts, setNfts] = useState([] as EvmNft[]);
  const [selectedNft, setSelectedNft] = useState({} as EvmNft);
  const [confirmNft, setConfirmNft] = useState({} as EvmNft);
  const { address, isConnected } = useAccount();
  const [lobbyDetails, setLobbyDetails] = useState() as any;
  const getNfts = async () => {
    const chain = EvmChain.MUMBAI;
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: address as string,
      chain,
      mediaItems: true,
      normalizeMetadata: true,
    });
    console.log('tst');
    return response.result;
  }
  const fetchData = async (results: any) => {
    try {
      const q = query(collection(db, 'lobbies'), where(documentId(), '==', params.id));
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        const filtered = results.filter((nft: any) => nft.name == doc.data().collection);
        console.log(doc.data());
        setNfts(filtered);
        setLobbyDetails(doc.data());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (address && isConnected)
      getNfts().then((nfts) => {
        fetchData(nfts);
      });
  }, [address, isConnected]);

  return (
    <>
      {(step == 1) &&
        <div className="mt-12 text-center">
          {address && isConnected ?
            <>
              <h1 className="font-semibold text-2xl mb-4">Connected wallet address</h1>
              <span className="hidden sm:block">{address}</span>
              {/* <span className="block sm:hidden">{address | pipe}</span> */}
              <div className="flex justify-start items-center mt-6">
                <div className="dropdown">
                  <label tabIndex={0} className="btn m-1 cursor-default">
                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg> */}
                    <span className="font-bold">Collection:</span> {lobbyDetails?.collection}
                  </label>
                </div>
              </div>

              <div className="flex justify-center bg-base-200 rounded-lg p-5 mt-2 drop-shadow-md">
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
                              <p className="text-white text-lg font-bold truncate px-2">{nft.name}</p>
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
                              <p className="text-white text-lg font-bold truncate px-2">{nft.name}</p>
                            </div>
                          </div>
                        }
                      </div>
                    </li>
                  ))
                  }
                </ul>
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
        </div>
      }

      {(step == 2) &&
        <div className="mt-12">
          <div className="grid grid-cols-1 space-x-6 sm:grid-cols-2">
            <div className="col-span-1 flex justify-center">
              <div className="card card-compact w-96 bg-base-100 shadow-xl">
                <figure><img
                  src={confirmNft?.media?.mediaCollection?.high?.url ? confirmNft?.media?.mediaCollection?.high?.url : confirmNft?.media?.originalMediaUrl}
                  alt="NFT Image" /></figure>
                <div className="card-body">
                  <h2 className="card-title">{confirmNft?.name} #{confirmNft?.tokenId}</h2>
                  <p><span className="font-semibold">Symbol: </span> {confirmNft?.symbol}</p>
                </div>
              </div>
            </div>

            <div className="col-span-1 relative mt-4 sm:mt-0">
              <div className="mb-4">
                <h2 className="font-semibold">Time Remaining</h2>
                <Countdown endTime={lobbyDetails?.endDate} size={'medium'} />
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">EVM Chain</h2>
                <p>{lobbyDetails.evmChain} </p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Raffle Collection
                  <div className="tooltip" data-tip="Players can only raffle with NFTs in this collection.">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </h2>
                <p>{lobbyDetails.collection}</p>
              </div>

              <div className="mb-4">
                <h2 className="font-semibold">Lobby Fee</h2>
                <p>0.1 AVAX</p>
              </div>

              <div className="flex flex-col w-full border-opacity-50">
                <div className="divider"></div>
              </div>

              <div className="mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center">
                <div className="mr-4">
                  <h2 className="font-semibold text-3xl"><span className={myFont.className}>Good Luck</span></h2>
                  <p className="text-xl"><span className={myFont.className}>Player {converter.toWords(lobbyDetails?.confirmedPlayers + 1)}</span></p>
                </div>
                <Image src="/images/gl-banan.gif" width={60} height={60} alt="Good Luck Banana"></Image>
              </div>

              <button className="hidden sm:block btn btn-accent drop-shadow-md bottom-0 absolute">Join
                Game</button>
              <button className="block sm:hidden btn btn-accent drop-shadow-md mt-4 w-full">Join
                Game</button>
            </div>
          </div>
        </div>
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
              <button onClick={() => { setConfirmNft(selectedNft), setStep(2) }} className="hidden sm:block btn btn-accent drop-shadow-md bottom-0 absolute">Confirm</button>
              <button onClick={() => { setConfirmNft(selectedNft); setStep(2) }} className="block sm:hidden btn btn-accent drop-shadow-md mt-4 w-full">Confirm</button>
            </div>
          </div >
        </form >
      </dialog >
    </>
  )
}