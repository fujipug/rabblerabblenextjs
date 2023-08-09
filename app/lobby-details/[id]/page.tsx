'use client'
import { WagmiConfig } from 'wagmi'
import { wagmiConfig } from '../../../utils/wagmi-config';
import { useAccount } from "wagmi";
import { collection, documentId, query, where, getFirestore, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import converter from 'number-to-words';
import localFont from 'next/font/local'
import Countdown from "../../../components/countdown";
import Link from "next/link";
import { firebaseConfig } from "../../../utils/firebase-config";
import { getRaffleById, truncateAddress } from '../../../utils/hooks';
import Confetti from 'react-confetti'
import Image from 'next/image'
const myFont = localFont({ src: '../../../public/fonts/Ready-Player-One.otf' })

declare global {
  interface Window {
    showRespects: any;
    showCelebrate: any;
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function LobbyNftInfo(props: any) {
  const [lobbyDetails, setLobbyDetails] = useState() as any;
  const [placeholders, setPlaceholders] = useState([]) as any;
  const [winner, setWinner] = useState(null) as any;
  const account = useAccount();

  useEffect(() => {
    const accountAddress = account.address?.toLocaleLowerCase() ? account.address?.toLocaleLowerCase() : '';
    document.addEventListener('keydown', function (event) {
      if (event.key === 'f' && winner.toLowerCase() !== accountAddress.toLocaleLowerCase()) {
        window.showRespects.showModal()
        setTimeout(() => {
          window.showRespects.close()
        }, 5000);
      }

      if (event.key === 'g' && winner.toLowerCase() === accountAddress.toLocaleLowerCase()) {
        window.showCelebrate.showModal()
        setTimeout(() => {
          window.showCelebrate.close()
        }, 5000);
      }
    });
  }, [account, winner]);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'lobbies'), where(documentId(), '==', props.lobbyId));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
          setLobbyDetails({ id: doc.id, data: doc.data() })
          getRaffleById(doc.data().raffleId).then((res: any) => {
            if (res[5] && res[5] !== '0x0000000000000000000000000000000000000000') {
              setWinner(res[5] as string);
            }
          });
          const blanks = [];
          for (let i = 0; i < doc.data().totalPlayers - doc.data().confirmedPlayers; i++)
            blanks.push({ collection: doc.data().collection })
          setPlaceholders(blanks);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [props.lobbyId]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        {winner && <Confetti width={window.outerWidth} />}
        {winner &&
          <div><span className='font-semibold text-3xl'>Winner: </span><span className='text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'>{truncateAddress(winner)}</span></div>
        }
        {(!winner && lobbyDetails?.data.status === 'Active') &&
          <Countdown endTime={lobbyDetails?.data.endDate} size={'large'} />
        }
        {(!winner && lobbyDetails?.data.status === 'Expired') &&
          <span className='text-3xl'>Expired</span>
        }
        {(!winner && (lobbyDetails?.data.status !== 'Expired') && (lobbyDetails?.data.confirmedPlayers !== lobbyDetails?.data.totalPlayers)) &&
          <Link href={`/join-lobby/${lobbyDetails?.id}`} className="btn btn-secondary drop-shadow-md">Join Lobby</Link>
        }
        {winner && winner.toLowerCase() !== account.address?.toLocaleLowerCase() &&
          <span className='hidden sm:flex'>Press &nbsp;<kbd className="kbd kbd-sm">F</kbd>&nbsp; to pay respects.</span>
        }
        {winner && winner.toLowerCase() === account.address?.toLocaleLowerCase() &&
          <span className='hidden sm:flex'>Press &nbsp;<kbd className="kbd kbd-sm">G</kbd>&nbsp; to celebrate.</span>
        }
      </div >

      {
        winner ?
          <>
            < div className="p-6 bg-neutral rounded-box w-full flex justify-center" >
              {
                lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div key={index}>
                    {(winner.toLowerCase() == nft.ownerOf.toLowerCase()) &&
                      <div className="card card-compact w-80 bg-base-100 shadow-xl">
                        <figure><img src={nft?.media?.mediaCollection?.high?.url ? nft?.media?.mediaCollection?.high?.url : nft?.media.originalMediaUrl} alt="NFT image unreachable" /></figure>
                        <div className="card-body">
                          <h2 className="card-title">{nft?.name} #{nft.tokenId}</h2>
                          <p><span className="font-semibold">Collection: </span> {nft?.name}</p>
                        </div>
                      </div>
                    }

                  </div>
                ))
              }
            </div >
            <div className='flex justify-between my-4 items-start'>
              <div className="hidden sm:flex avatar-group -space-x-2">
                {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div key={index}>
                    {(winner.toLowerCase() != nft.ownerOf.toLowerCase()) &&
                      <div className="w-16 ml-2.5 mr-2.5">
                        <img src={nft?.media?.mediaCollection?.high?.url ? nft?.media?.mediaCollection?.high?.url : nft?.media.originalMediaUrl} alt="NFT image unreachable" className='rounded-lg' />
                      </div>
                    }
                  </div>
                ))}
              </div>
              <div className="flex sm:hidden avatar-group -space-x-4">
                {lobbyDetails?.data.nfts.map((nft: any, index: number) => (
                  <div key={index}>
                    {(winner.toLowerCase() != nft.ownerOf.toLowerCase()) &&
                      <div className="avatar">
                        <div className="w-12">
                          <img src={nft?.media?.mediaCollection?.high?.url ? nft?.media?.mediaCollection?.high?.url : nft?.media.originalMediaUrl} alt="NFT image unreachable" className='rounded-lg' />
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
                <div className="card card-compact w-80 bg-base-100 shadow-xl">
                  <figure><img src={nft?.media?.mediaCollection?.high?.url ? nft?.media?.mediaCollection?.high?.url : nft?.media.originalMediaUrl} alt="NFT image unreachable" /></figure>
                  <div className="card-body">
                    <h2 className="card-title">{nft?.name} #{nft.tokenId}</h2>
                    <p><span className="font-semibold">Collection: </span> {nft?.name}</p>
                  </div>
                </div>
              </div>
            ))}

            {placeholders.map((placeholder: any, index: number) => (
              <div key={index} className="snap-center">
                <div className="card card-compact w-80 bg-base-100 shadow-xl">
                  <figure><div className="bg-gray-200 flex justify-center items-center w-[320px] h-[320px]">
                    <span className="text-3xl font-bold rpo text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"><span className={myFont.className}>Player {converter.toWords(index + 2)}</span></span>
                  </div></figure>
                  <div className="card-body">
                    <h2 className="card-title">Waiting for player to join<span className="loading loading-dots loading-xs -mb-3"></span></h2>
                    <p><span className="font-semibold">Collection: </span> {placeholder.collection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
      {
        !winner &&
        <div className="flex justify-end mt-2">
          <div className="badge badge-outline">{lobbyDetails?.data.confirmedPlayers}/{lobbyDetails?.data.totalPlayers}</div>
        </div>
      }
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="col-span-1">
          <h2 className="font-bold text-lg mb-2">Raffle Details</h2>
          <p className="leading-8"><span className="font-semibold">EVM Chain: </span>{lobbyDetails?.data.evmChain}</p>
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
          <p className="leading-8"><span className="font-semibold">Lobby: </span>{lobbyDetails?.data.isPrivate ? 'Private' : 'Public'}</p>
        </div>
        <div className="sm:hidden flex flex-col w-full">
          <div className="divider"></div>
        </div>
        <div className="col-span-1">
          <h2 className="font-bold text-lg">Participants</h2>
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
                        {winner?.toLowerCase() == nft.ownerOf?.toLowerCase() ?
                          <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'>{truncateAddress(nft.ownerOf)}</span>
                          :
                          <span>{truncateAddress(nft.ownerOf)}</span>
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
    </>
  )
};

export default function LobbyDetails({ params }: { params: { id: string } }) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <LobbyNftInfo lobbyId={params.id} />
      </WagmiConfig>
    </>
  )
}