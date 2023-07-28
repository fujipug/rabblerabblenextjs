'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import confetti from 'canvas-confetti';
import { DocumentData, collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { initializeApp } from "firebase/app";

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

// function ThemeComponent() {
//   const [theme, setTheme] = React.useState('cupcake');
//   const toggleTheme = () => {
//     setTheme(theme === 'dracula' ? 'cupcake' : 'dracula');
//   };
//   // initially set the theme and "listen" for changes to apply them to the HTML tag
//   React.useEffect(() => {
//     document.querySelector('html').setAttribute('data-theme', theme);
//   }, [theme]);
//   return (
//     <label className="swap swap-rotate">
//       <input onClick={toggleTheme} type="checkbox" />
//       <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
//       <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
//     </label>
//   );
// }

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

export default function Example() {
  const [lobbies, setLobbies] = useState([]) as any;
  const fetchData = async () => {
    try {
      const q = query(collection(db, 'lobbies'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const lobbies = [];
      for (const doc of querySnapshot.docs) {
        lobbies.push({ id: doc.id, data: doc.data() });
      }
      console.log(lobbies);
      setLobbies(lobbies);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <div className="relative isolate overflow-hidden bg-base-200 sm:h-screen drop-shadow-md">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a onClick={() => fireAction()} className="inline-flex space-x-6 cursor-pointer">
                <div className="badge badge-neutral badge-outline p-3">What&apos;s new</div>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6">
                  <span>Just shipped v1.0  🎉</span>
                </span>
              </a>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Raffle <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">NFTs</span> with the boys</h1>
            <p className="mt-6 text-lg leading-8"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">Rabble Rabble</span> is a fun and exciting way to wager your NFTs with friends.</p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/private-lobby" className="btn btn-secondary drop-shadow-lg">Start A Lobby</Link>
              <Link href="/learn-more" className="btn btn-ghost">Learn more <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-2 rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/images/avax-nfts(50).gif"
                  alt="NFT gif"
                  width={1200}
                  height={700}
                  className="w-[40rem] rounded-md drop-shadow-2xl"
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
                <th className="cursor-pointer hover:underline"><Link href={`/lobby-details/${lobby.id}`}>{lobby.id}</Link></th>
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
                <td>time</td>
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
