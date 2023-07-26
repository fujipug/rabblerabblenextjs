'use client'
import { collection, documentId, query, where, getFirestore, getDocs, Timestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import Image from "next/image";

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

declare global {
  interface Window {
    privateLobbyModal: any;
  }
}

function LobbyNftInfo(props: any) {
  const [lobbyDetails, setLobbyDetails] = useState() as any;
  const [placeholders, setPlaceholders] = useState([]) as any;
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 }) as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'lobbies'), where(documentId(), '==', props.lobbyId));
        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
          console.log(doc.data());
          setLobbyDetails(doc.data());
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
        <div className='grid grid-flow-col gap-5 text-center auto-cols-max'>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              {/* <span id="hours" style={{ '--value': timeRemaining.hours }}></span> */}
            </span>
            hours
          </div>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              {/* <span id="minutes" style={{ '--value': timeRemaining.minutes }}></span> */}
            </span>
            min
          </div>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              {/* <span id="seconds" style={{ '--value': timeRemaining.seconds }}></span> */}
            </span>
            sec
          </div>
        </div>
        <button onClick={() => window.privateLobbyModal?.showModal()} className="btn btn-secondary drop-shadow-md">Join Lobby</button>
      </div>

      <div className="snap-x flex p-6 space-x-4 bg-neutral rounded-box w-full overflow-x-scroll">
        {lobbyDetails?.nfts.map((nft: any, index: number) => (
          <div key={index} className="snap-center">
            <div className="card card-compact w-96 bg-base-100 shadow-xl">
              <figure><Image src={nft?.media?.mediaCollection?.high?.url ? nft?.media?.mediaCollection?.high?.url : nft?.media.originalMediaUrl} alt="NFT image unreachable" /></figure>
              <div className="card-body">
                <h2 className="card-title">{nft?.name} #{nft.tokenId}</h2>
                <p><span className="font-semibold">Collection: </span> {nft?.name}</p>
              </div>
            </div>
          </div>
        ))}

        {placeholders.map((placeholder: any, index: number) => (
          <div key={index} className="snap-center">
            <div className="card card-compact w-96 bg-base-100 shadow-xl">
              <figure><div className="bg-gray-200 flex justify-center items-center w-[384px] h-[384px]">
                <span className="text-3xl font-bold rpo text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">Player {index + 1}</span>
              </div></figure>
              <div className="card-body">
                <h2 className="card-title">Waiting for player to join<span className="loading loading-dots loading-xs -mb-3"></span></h2>
                <p><span className="font-semibold">Collection: </span> {placeholder.collection}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <div className="badge badge-outline">{lobbyDetails?.confirmedPlayers}/{lobbyDetails?.totalPlayers}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="col-span-1">
          <h2 className="font-bold text-lg mb-2">Raffle Details</h2>
          <p className="leading-8"><span className="font-semibold">EVM Chain: </span>{lobbyDetails?.evmChain}</p>
          <p className="leading-8"><span className="font-semibold">Started: </span>
            {`${(lobbyDetails?.createdAt)?.toDate().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`} at {`${(lobbyDetails?.createdAt)?.toDate().toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`}</p>
          <p className="leading-8"><span className="font-semibold">Ends: </span>
            {`${(lobbyDetails?.endDate)?.toDate().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`} at {`${(lobbyDetails?.endDate)?.toDate().toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`}</p>
          <p className="leading-8"><span className="font-semibold">Lobby: </span>{lobbyDetails?.isPrivate ? 'Private' : 'Public'}</p>
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
                  <th>Win Ratio</th>
                  <th>Last Transaction</th>
                </tr>
              </thead>
              <tbody>
                <>
                  {lobbyDetails?.nfts.map((nft: any, index: number) => (
                    <tr key={index}>
                      <th>Player {index + 1}</th>
                      <td>{nft.owner_of}</td>
                      <td>50%</td>
                      <td>a day ago</td>
                    </tr>
                  ))}
                </>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
};

export default function LobbyDetails({ params }: { params: { id: string } }) {
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState('');

  return (
    <>
      {/* <div className="flex justify-between items-center mb-4">
        <div className='grid grid-flow-col gap-5 text-center auto-cols-max'>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              <span id="hours" style={{ '--value': 10 }}></span>
            </span>
            hours
          </div>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              <span id="minutes" style={{ '--value': 24 }}></span>
            </span>
            min
          </div>
          <div className='flex flex-col'>
            <span className='countdown font-mono text-4xl'>
              <span id="seconds" style={{ '--value': 36 }}></span>
            </span>
            sec
          </div>
        </div>
        <button onClick={() => window.privateLobbyModal?.showModal()} className="btn btn-secondary drop-shadow-md">Join Lobby</button>

      </div> */}
      <LobbyNftInfo lobbyId={params.id} />

      <dialog id="privateLobbyModal" className="modal">
        <form className="modal-box">
          <h3 className="font-bold text-lg">Join Lobby</h3>
          <p className="py-4">This is a private lobby and requires a password to join.</p>
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
          </div >
          <div className="modal-action">
            <button className="btn drop-shadow-md">Close</button>
            <button className="btn btn-accent drop-shadow-md">Enter</button>
          </div>
        </form>
      </dialog>
    </>
  )
}