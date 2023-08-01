'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { DocumentData, collection, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import ThemeToggle from "../components/theme-toggle";
import Countdown from "../components/countdown";
import { recentLobbies } from "../utils/hooks";
import { readContract } from "@wagmi/core";
import { rabbleAbi, rabbleTestAddress } from "../utils/config";

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

export default function Home() {
  const [lobbies, setLobbies] = useState([]) as any;
  const fetchData = async () => {
    try {
      const q = query(collection(db, 'lobbies'), orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const lobbies = [];
      for (const doc of querySnapshot.docs) {
        lobbies.push({ id: doc.id, data: doc.data() });
      }
      setLobbies(lobbies);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
    fetchDataFromContract();
  }, []);

  const [raffleCounter, setRaffleCounter] = useState(0);
  const fetchDataFromContract = async () => {
    try {
      // Call the readContract function to get data from the smart contract
      const contractDataResponse = await readContract({
        address: rabbleTestAddress,
        abi: rabbleAbi,
        functionName: "raffleCounter",
      });
      setRaffleCounter(contractDataResponse as any);
      console.log('Raffle Counter:', contractDataResponse);
    } catch (error) {
      console.error('Error fetching data from contract:', error);
    }
  };

  return (
    <>
      <div className="relative isolate overflow-hidden bg-base-200 sm:h-screen drop-shadow-md">
        <div className="fixed p-3 right-0"><ThemeToggle /></div>
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a onClick={() => fireAction()} className="inline-flex space-x-6 cursor-pointer">
                <div className="badge badge-outline p-3">What&apos;s new</div>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6">
                  <span>Just shipped v1.0  🎉</span>
                </span>
              </a>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Raffle <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">NFTs</span> with the boys</h1>
            <p className="mt-6 text-lg leading-8"><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span> is a fun and exciting way to wager your NFTs with friends.</p>
            <div className="mt-10 flex items-center gap-x-6">
              TEST: {raffleCounter}
              <Link href="/create-lobby" className="btn btn-secondary drop-shadow-lg z-50">Start A Lobby</Link>
              <Link href="/learn-more" className="btn btn-ghost">Learn more <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="hidden mx-auto mt-16 sm:flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-2 rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="transform animate-moveUpDown z-0 -mt-4 fixed"><Image src="/images/Face_2.png" alt="Quokka Face" width={200} height={200}></Image></div>
                <div className="z-30 -mt-7 fixed"><Image src="/images/Hands_2.png" alt="Quokka Hands" width={200} height={200}></Image></div>
                <Image
                  src="/images/avax-nfts(50).gif"
                  alt="NFT gif"
                  width={1200}
                  height={700}
                  priority={true}
                  className="w-[40rem] rounded-md drop-shadow-2xl z-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <h1 className="font-semibold text-2xl ml-3 my-2">Recent Lobbiess</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Lobby</th>
              <th>Collection</th>
              <th>Status</th>
              <th>Time Remaining</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {lobbies.map((lobby: DocumentData, index: number) => (
              <tr key={index}>
                <th className="cursor-pointer hover:underline"><Link href={`/lobby-details/${lobby.id}`} className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{lobby.id}</Link></th>
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
                <td><Countdown endTime={lobby.data.endDate} size={'small'} /></td>
                {lobby.data.status === 'Expired' &&
                  <td>N/A</td>
                }
                {lobby.data.status === 'Active' &&
                  <td>TBA</td>
                }
                {lobby.data.status === 'Completed' && lobby.data.winner &&
                  <td>{lobby.data.winner}</td>
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
