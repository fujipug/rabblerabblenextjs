'use client'
import { WagmiConfig, useAccount, useContractWrite } from 'wagmi'
import { getNetwork } from '@wagmi/core';
import { wagmiConfig } from '../../../utils/wagmi-config';
import { getFirestore, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import converter from 'number-to-words';
import localFont from 'next/font/local'
import Countdown from "../../../components/countdown";
import Link from "next/link";
import { firebaseConfig } from "../../../utils/firebase-config";
import { getRaffleById, useFee } from '../../../utils/hooks';
import Confetti from 'react-confetti'
import Image from 'next/image'
const myFont = localFont({ src: '../../../public/fonts/Ready-Player-One.otf' })
import Tilt from 'react-parallax-tilt';
import RenderName from '../../../components/render-name';
import RaffleAnimation from '../../../components/raffle-animation';
import { Lobby } from '../../../types';
import { rabbleAbi, rabbleAddress, rabbleTestAddress } from '../../../utils/config';

declare global {
  interface Window {
    showRespects: any;
    showCelebrate: any;
    raffle: any
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function LobbyNftInfo(props: any) {
  const [lobbyDetails, setLobbyDetails] = useState() as Lobby;
  const [placeholders, setPlaceholders] = useState([]) as any;
  const account = useAccount();
  const network = getNetwork();
  const [refundStatus, setRefundStatus] = useState('') as any;
  // This is used to refund Raffle if it is expired and not refunded
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: network.chain?.id === 42161
      ? rabbleTestAddress
      : rabbleAddress,
    abi: rabbleAbi,
    functionName: 'joinRaffle',
    args: [lobbyDetails?.data.raffleId && BigInt(lobbyDetails?.data.raffleId), 0],
    onSuccess: (res: any) => {
      const lobbyRef = doc(db, 'lobbies', lobbyDetails.id);
      updateDoc(lobbyRef, {
        refunded: true
      });
      setRefundStatus('Success');
      setTimeout(() => {
        setRefundStatus('');
      }, 3000);
    },
    onError(error) {
      console.error(error);
      setRefundStatus('Error');
      setTimeout(() => {
        setRefundStatus('');
      }, 3000);
    }
  });

  useEffect(() => {
    const accountAddress = account.address?.toLocaleLowerCase() ? account.address?.toLocaleLowerCase() : '';
    document.addEventListener('keydown', function (event) {
      if (event.key === 'f' && lobbyDetails?.data.winner?.toLowerCase() !== accountAddress.toLocaleLowerCase()) {
        window.showRespects.showModal();
        setTimeout(() => {
          window.showRespects.close()
        }, 5000);
      }

      if (event.key === 'g' && lobbyDetails?.data.winner?.toLowerCase() === accountAddress.toLocaleLowerCase()) {
        window.showCelebrate.showModal();
        setTimeout(() => {
          window.showCelebrate.close();
        }, 5000);
      }
    });
  }, [account, lobbyDetails?.data.winner]);

  useEffect(() => {
    async function fetchData() {
      try {
        // TODO: also add chain Id
        const unsub = onSnapshot(doc(db, 'lobbies', props.lobbyId), (doc) => {
          setLobbyDetails({ id: doc.id, data: doc.data() });
          const blanks = [];
          for (let i = 0; i < doc.data()?.totalPlayers - doc.data()?.confirmedPlayers; i++)
            blanks.push({ collection: doc.data()?.collection })
          setPlaceholders(blanks);

          if (!doc.data()?.winner && (doc.data()?.totalPlayers === doc.data()?.confirmedPlayers)) {
            window.raffle.showModal()
          }

          if (doc.data()?.winner && (doc.data()?.totalPlayers === doc.data()?.confirmedPlayers)) {
            unsub();
            window.raffle.close()
          }

        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [props.lobbyId, lobbyDetails?.data.winner]);

  const handleRefundRaffle = async (collectionAddress: string) => {
    write();
  }


  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {lobbyDetails?.data.winner && <Confetti width={window.outerWidth} />}
        {lobbyDetails?.data.winner &&
          <div>
            <span className='font-semibold text-3xl flex items-center'>
              <span>Winner:&nbsp;</span>
              <RenderName address={lobbyDetails?.data.winner} isWinner={true} classData={'text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'} />
            </span>
          </div>
        }
        {(!lobbyDetails?.data.winner && lobbyDetails?.data.status === 'Active') &&
          <Countdown endTime={lobbyDetails?.data.endDate} size={'large'} />
        }
        {(!lobbyDetails?.data.winner && lobbyDetails?.data.status === 'Expired') &&
          <span className='text-3xl'>Expired</span>
        }

        {(!lobbyDetails?.data.winner && lobbyDetails?.data.status === 'Expired' && !lobbyDetails?.data.refunded) &&
          <button onClick={() => handleRefundRaffle(lobbyDetails?.data.collectionAddress)} className='btn bg-rose-600 hover:bg-rose-400'>
            {isLoading ? <span className="loading loading-lg"></span> : <span>Refund Raffle</span>}
          </button>
        }

        {(!lobbyDetails?.data.winner && lobbyDetails?.data.status === 'Expired' && lobbyDetails?.data.refunded) &&
          <span className='text-xl text-rose-500'>NFTs Refunded</span>
        }

        {(!lobbyDetails?.data.winner && (lobbyDetails?.data.status !== 'Expired') && (lobbyDetails?.data.confirmedPlayers !== lobbyDetails?.data.totalPlayers)) &&
          <Link href={`/join-lobby/${lobbyDetails?.id}`} className="btn btn-secondary drop-shadow-md">Join Lobby</Link>
        }
        {lobbyDetails?.data.winner && lobbyDetails?.data.winner?.toLowerCase() !== account.address?.toLocaleLowerCase() &&
          <span className='hidden sm:flex'>Press &nbsp;<kbd className="kbd kbd-sm">F</kbd>&nbsp; to pay respects.</span>
        }
        {lobbyDetails?.data.winner && lobbyDetails?.data.winner?.toLowerCase() === account.address?.toLocaleLowerCase() &&
          <span className='hidden sm:flex'>Press &nbsp;<kbd className="kbd kbd-sm">G</kbd>&nbsp; to celebrate.</span>
        }
      </div >

      {
        lobbyDetails?.data.winner ?
          <>
            < div className="p-6 bg-neutral rounded-box w-full flex justify-center" >
              {
                lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div key={index}>
                    {(lobbyDetails?.data.winner?.toLowerCase() == (nft.ownerOf?.toLowerCase() ? nft.ownerOf?.toLowerCase() : nft.owner?.toLowerCase())) &&
                      <Tilt glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="right" glareBorderRadius="20px">
                        <div className="card card-compact w-80 bg-base-100 shadow-xl">
                          {nft?.metadata?.pImage || nft?.media?.mediaCollection?.high?.url || nft?.media?.originalMediaUrl ?
                            <figure><img src={nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url ? nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url : nft?.media?.originalMediaUrl} alt="NFT image unreachable" /></figure>
                            :
                            <figure><Image src="/images/no-images.png" width={500} height={500} alt="NFT image unreachable" /></figure>
                          }
                          <div className="card-body">
                            <h2 className="card-title inner-element">{nft?.symbol ? nft?.symbol : nft?.collectionSymbol} #{nft.tokenId}</h2>
                            <div className='flex justify-between items-center'>
                              <p><span className="font-semibold truncate">Collection: </span> {nft?.name ? nft?.name : nft?.collectionName}</p>
                              {nft?.battleCry &&
                                <SoundButton battleCry={nft?.battleCry} />
                              }
                            </div>
                          </div>
                        </div>
                      </Tilt>
                    }
                  </div>
                ))
              }
            </div >
            <div className='flex justify-between my-4 items-start'>
              <div className="hidden sm:flex avatar-group -space-x-2">
                {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div key={index}>
                    {(lobbyDetails?.data.winner?.toLowerCase() != (nft.ownerOf?.toLowerCase() ? nft.ownerOf?.toLowerCase() : nft.owner?.toLowerCase())) &&
                      <div className="w-16 ml-2.5 mr-2.5">
                        {nft?.metadata?.pImage || nft?.media?.mediaCollection?.high?.url || nft?.media?.originalMediaUrl ?
                          <img src={nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url ? nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url : nft?.media?.originalMediaUrl} alt="NFT image unreachable" className='rounded-lg' />
                          :
                          <Image className='rounded-lg' src="/images/no-images.png" width={200} height={200} alt="NFT image unreachable" />
                        }
                      </div>
                    }
                  </div>
                ))}
              </div>
              <div className="flex sm:hidden avatar-group -space-x-4">
                {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div className='ml-3' key={index}>
                    {(lobbyDetails?.data.winner?.toLowerCase() != (nft.ownerOf?.toLowerCase() ? nft.ownerOf?.toLowerCase() : nft.owner?.toLowerCase())) &&
                      <div className="avatar">
                        <div className="w-12">
                          {nft?.metadata?.pImage || nft?.media?.mediaCollection?.high?.url || nft?.media?.originalMediaUrl ?
                            <img src={nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url ? nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url : nft?.media?.originalMediaUrl} alt="NFT image unreachable" />
                            :
                            <Image src="/images/no-images.png" width={200} height={200} alt="NFT image unreachable" />
                          }
                        </div>
                      </div>
                    }
                  </div>
                ))}
              </div>
              <div className="flex justify-end -mt-1.5">
                <div className="badge badge-outline">{lobbyDetails?.data.confirmedPlayers}/{lobbyDetails?.data.totalPlayers}</div>
              </div>
            </div>
          </>
          :
          <div className="snap-mandatory snap-x flex p-6 space-x-4 bg-neutral rounded-box w-full overflow-x-scroll">
            {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
              <div key={index} className="snap-center">
                <Tilt tiltEnable={false} glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="all" glareBorderRadius="20px">
                  <div className="card card-compact w-80 bg-base-100 shadow-xl">
                    {nft?.metadata?.pImage || nft?.media?.mediaCollection?.high?.url || nft?.media?.originalMediaUrl ?
                      <figure><img src={nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url ? nft?.metadata?.pImage ? nft?.metadata?.pImage : nft?.media?.mediaCollection?.high?.url : nft?.media?.originalMediaUrl} alt="NFT image unreachable" /></figure>
                      :
                      <figure><Image src="/images/no-images.png" width={500} height={500} alt="NFT image unreachable" /></figure>
                    }
                    <div className="card-body">
                      <h2 className="card-title"><span className='truncate'>{nft?.symbol ? nft?.symbol : nft?.collectionSymbol}</span> <span className='truncate'>#{nft.tokenId}</span></h2>
                      <div className='flex justify-between items-center'>
                        <p className='truncate'><span className="font-semibold">Collection: </span> {nft?.name ? nft?.name : nft?.collectionName}</p>
                        {nft?.battleCry &&
                          <SoundButton battleCry={nft?.battleCry} />
                        }
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>
            ))}

            {placeholders.map((placeholder: any, index: number) => (
              <div key={index} className="snap-center">
                <Tilt tiltEnable={false} glareEnable={true} glareMaxOpacity={0.8} glareColor="lightblue" glarePosition="all" glareBorderRadius="20px">
                  <div className="card card-compact w-80 bg-base-100 shadow-xl">
                    <figure><div className="bg-gray-200 flex justify-center items-center w-[320px] h-[320px]">
                      <span className="text-3xl font-bold rpo text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"><span className={myFont.className}>Player {converter.toWords(lobbyDetails?.data.confirmedPlayers + (index + 1))}</span></span>
                    </div></figure>
                    <div className="card-body">
                      <h2 className="card-title">Waiting for player to join<span className="loading loading-dots loading-xs -mb-3"></span></h2>
                      <p className='truncate'><span className="font-semibold">Collection: </span> {placeholder.collection}</p>
                    </div>
                  </div>
                </Tilt>
              </div>
            ))}
          </div>
      }
      {
        !lobbyDetails?.data.winner &&
        <div className="flex justify-end mt-2">
          <div className="badge badge-outline">{lobbyDetails?.data.confirmedPlayers}/{lobbyDetails?.data.totalPlayers}</div>
        </div>
      }
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="col-span-1">
          <h2 className="font-bold text-lg mb-2">Raffle Details</h2>
          <p className="leading-8"><span className="font-semibold">Lobby: </span>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 truncate'>{lobbyDetails?.data.lobbyName ? lobbyDetails?.data.lobbyName : lobbyDetails?.id}</span>
          </p>
          <p className="leading-8"><span className="font-semibold">Network: </span>{lobbyDetails?.data.evmChain}</p>
          <p className="leading-8"><span className="font-semibold">Started: </span>
            {`${(lobbyDetails?.data.createdAt)?.toDate().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`} at {`${(lobbyDetails?.data.createdAt)?.toDate().toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`}</p>
          {lobbyDetails?.data.completedDate ?
            <p className="leading-8"><span className="font-semibold">Ended: </span>
              {`${(lobbyDetails?.data.completedDate)?.toDate().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`} at {`${(lobbyDetails?.data.completedDate)?.toDate().toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}`}</p>
            :
            <p className="leading-8"><span className="font-semibold">Ends: </span>
              {`${(lobbyDetails?.data.endDate)?.toDate().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`} at {`${(lobbyDetails?.data.endDate)?.toDate().toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}`}</p>
          }

          <p className="leading-8"><span className="font-semibold">Type: </span>{lobbyDetails?.data.isPrivate ? 'Private' : 'Public'}</p>
        </div>
        <div className="sm:hidden flex flex-col w-full">
          <div className="divider"></div>
        </div>
        <div className="col-span-1">
          <h2 className="font-bold text-lg">Player Pool</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <>
                  {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                    <tr key={index}>
                      <th>Player {index + 1}</th>
                      <td>
                        {lobbyDetails?.data.winner?.toLowerCase() == ((nft.ownerOf?.toLowerCase() ? nft.ownerOf?.toLowerCase() : nft.owner?.toLowerCase())) ?
                          <RenderName address={nft.ownerOf ? nft.ownerOf : nft.owner} classData={'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'} />
                          :
                          <RenderName address={nft.ownerOf ? nft.ownerOf : nft.owner} classData={''} />
                        }
                      </td>
                    </tr>
                  ))}
                </>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <dialog id="showRespects" className="modal">
        <Image src={'/images/respects.gif'} className="max-w-full max-h-full" fill alt="Pay Respects" />
      </dialog>
      <dialog id="showCelebrate" className="modal">
        <Image src={'/images/winner.gif'} className="max-w-full max-h-full" fill alt="Celebrate" />
      </dialog>
      <dialog id="raffle" className="modal">
        <RaffleAnimation lobbyDetails={lobbyDetails} />
      </dialog>
      <div className="toast toast-center toast-middle">
        {refundStatus === 'Success' &&
          <div className="alert alert-success">
            <span>Refund succesful.</span>
          </div>
        }
        {refundStatus === 'Error' &&
          <div className="alert alert-error">
            <span>Refund error. Please try again.</span>
          </div>
        }
      </div>
    </>
  )
};

function SoundButton(props: { battleCry: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioFile = props.battleCry;
  const handleSoundButtonClick = () => {
    const audioElement = new Audio(audioFile);
    audioElement.play();

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="tooltip z-10" data-tip="Battle Cry">
      <svg onClick={handleSoundButtonClick} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="orange" className="w-5 h-5 cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    </div>
  );
}

export default function LobbyDetails({ params }: { params: { id: string } }) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <LobbyNftInfo lobbyId={params.id} />
      </WagmiConfig>
    </>
  )
}