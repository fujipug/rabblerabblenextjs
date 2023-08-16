'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { DocumentData, collection, getCountFromServer, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Countdown from "../components/countdown";
import { firebaseConfig } from "../utils/firebase-config";
import RenderName from "../components/render-name";
import Navbar from "../components/navbar";

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

export default function Home() {
  const [lobbies, setLobbies] = useState([]) as any;
  const [lastVisible, setLastVisible] = useState(null) as any;
  const [showMoreButton, setShowMoreButton] = useState(false) as any;
  const [count, setCount] = useState(0) as any;

  const fetchData = async () => {
    try {
      const coll = collection(db, 'lobbies');
      const snapshot = await getCountFromServer(coll);
      setCount(snapshot.data().count);
      const q = query(collection(db, 'lobbies'), orderBy('createdAt', 'desc'), limit(25));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tempLobbies = [] as any;
        for (const doc of querySnapshot.docs) {
          tempLobbies.push({ id: doc.id, data: doc.data() });
        }
        (querySnapshot.docs.length === 25) ? setShowMoreButton(true) : setShowMoreButton(false);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setLobbies(tempLobbies);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMoreLobbies = async () => {
    const next = query(collection(db, 'lobbies'),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(25));
    const documentSnapshots = await getDocs(next);
    const tempLobbies = [] as any;
    for (const doc of documentSnapshots.docs) {
      tempLobbies.push({ id: doc.id, data: doc.data() });
    }
    setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
    setLobbies([...lobbies, ...tempLobbies]);
    (documentSnapshots.docs.length === 25 && (lobbies.length + tempLobbies.length) !== count) ? setShowMoreButton(true) : setShowMoreButton(false);
  };

  return (
    <>
      <div className="relative isolate overflow-hidden bg-base-200 drop-shadow-md">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a onClick={() => fireAction()} className="inline-flex space-x-6 cursor-pointer">
                <div className="badge badge-outline p-3">What&apos;s new</div>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6">
                  <span>Just shipped Beta v1.0  🎉</span>
                </span>
              </a>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Raffle <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">NFTs</span> with the boys</h1>
            <p className="mt-6 text-lg leading-8"><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span> is a fun and exciting way to wager your NFTs with friends.</p>
            <div className="mt-4 flex items-center gap-x-6">
              <Link href="/create-lobby" className="btn btn-secondary drop-shadow-lg z-50">Start A New Lobby</Link>
              <Link href="/learn-more" className="btn btn-ghost z-50">Learn more <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="hidden mx-auto mt-16 sm:flex justify-center max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-2 rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="transform animate-moveUpDown z-0 -mt-4 fixed"><Image src="/images/Face_2.png" alt="Quokka Face" width={200} height={200}></Image></div>
                <div className="z-30 -mt-7 fixed"><Image src="/images/Hands_2.png" alt="Quokka Hands" width={200} height={200}></Image></div>
                <Image
                  src="/images/avax-nfts(50).gif"
                  alt="NFT gif"
                  width={800}
                  height={500}
                  priority={true}
                  className="w-[28rem] rounded-md drop-shadow-2xl z-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {lobbies.length > 0 &&
        <>
          <div className="overflow-x-auto mt-4">
            <h1 className="font-semibold text-2xl ml-3 my-2">Recent Lobbies</h1>
            <div className="block sm:hidden transform animate-moveUpDown z-0 right-0 -mt-4 absolute"><Image src="/images/Face_2.png" alt="Quokka Face" width={200} height={200}></Image></div>
            <div className="block sm:hidden z-30 -mt-7 absolute right-0"><Image src="/images/Hands_2.png" alt="Quokka Hands" width={200} height={200}></Image></div>
            {/* <input type="text" placeholder="Search" className="input w-full max-w-xs" /> */}
            <table className="table bg-base-100">
              <thead>
                <tr>
                  <th>Lobby</th>
                  <th>Type</th>
                  <th>Collection</th>
                  <th>Status</th>
                  <th>Time Remaining</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {lobbies.map((lobby: DocumentData, index: number) => (
                  <tr key={index}>
                    <th className="cursor-pointer hover:underline">
                      <Link href={`/lobby-details/${lobby.id}`} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        {lobby.data.lobbyName ? lobby.data.lobbyName : lobby.id}
                      </Link></th>
                    {lobby.data.isPrivate ?
                      <td>Private</td>
                      :
                      <td>Public</td>
                    }
                    <td>{lobby.data.collection}</td>
                    <td>
                      {lobby.data.status === 'Expired' &&
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/10">
                          {lobby.data.status}
                        </span>
                      }
                      {lobby.data.status === 'Active' &&
                        <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/10">
                          {lobby.data.status}
                        </span>
                      }
                      {lobby.data.status === 'Completed' &&
                        <span className="inline-flex items-center rounded-full bg-lime-50 px-2 py-1 text-xs font-medium text-lime-700 ring-1 ring-inset ring-lime-600/10">
                          {lobby.data.status}
                        </span>
                      }
                    </td>
                    <td>
                      {(lobby.data.status === 'Expired' || lobby.data.status === 'Completed') ?
                        <span>-</span>
                        :
                        <Countdown endTime={lobby.data.endDate} size={'small'} />
                      }
                    </td>
                    {lobby.data.status === 'Expired' &&
                      <td>N/A</td>
                    }
                    {lobby.data.status === 'Active' &&
                      <td>TBA</td>
                    }
                    {lobby.data.status === 'Completed' && lobby.data.winner &&
                      <td><RenderName address={lobby.data.winner} isWinner={true} classData="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500" /></td>

                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center pl-2" aria-hidden="true">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-end">
              <span className="bg-base-100 pl-2 text-sm">
                <span className="badge badge-outline mr-2">
                  {lobbies.length}/{count}
                </span></span>
            </div>
          </div>

          {showMoreButton &&
            <div className="flex justify-center my-2">
              <button onClick={() => getMoreLobbies()} className="btn btn-outline btn-primary">Load More</button>
            </div>
          }
        </>
      }
    </>
  )
}
