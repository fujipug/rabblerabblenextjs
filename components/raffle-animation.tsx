'use client'
import { WagmiConfig } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../utils/firebase-config";
import RenderName from "../components/render-name";
import { wagmiConfig } from "../utils/wagmi-config";
import { Lobby } from "../types";

// GLHF
const RotatingGIF = () => {
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const gifList = useMemo(() => [
    "https://media0.giphy.com/media/ur8JnxGgsez8Q/giphy.gif?cid=ecf05e470oiesx0acugl32q8fegljxhg0cnzqvvh4smvpj5k&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    "https://media4.giphy.com/media/eSwGh3YK54JKU/giphy.gif?cid=ecf05e47s5rsknn7xd2mu0gvs926i0aximbu9r0c0m75s7ov&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/Qv4MZa4BUABEl1CsGW/giphy.gif?cid=ecf05e47o97gohbyaw60s44d8m86dg21hsjl9k1uoyjo192z&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    'https://media4.giphy.com/media/WoF3yfYupTt8mHc7va/giphy.gif?cid=ecf05e47nm0nhq1yek9k05l77hb8he96kr3fwyfv500900s8&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    "https://media4.giphy.com/media/tl9ecXcVwGmBkS4iWk/giphy.gif?cid=ecf05e476pcz7fh3sdyj02rt0jihs43x5pyqz6h2x6gubi2r&ep=v1_gifs_search&rid=giphy.gif&ct=g"
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifList.length);
    }, 1300);

    return () => clearInterval(interval);
  }, [gifList]);

  const currentGIF = gifList[currentGifIndex];

  return <Image src={currentGIF} className="w-full h-96 sm:h-screen" width={100} height={100} alt="Rotating GIF" />;
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function RaffleAnimation(props: { lobbyDetails: Lobby }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="w-full relative">
        <RotatingGIF />
        <div className="hidden sm:block absolute bottom-20 left-20 bg-white rounded p-4 drop-shadow-md">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 rpo text-3xl mb-4">Lobby Participants</div>
          {props?.lobbyDetails?.data && props?.lobbyDetails?.data.nfts.map((nft: any, index: number) => {
            return (
              <span key={index}>
                <span className="font-semibold">Player {index + 1}:</span>
                <RenderName address={nft.ownerOf ? nft.ownerOf : nft.owner} isWinner={false} classData={''} />
              </span>
            )
          })}
        </div>

        <div className="hidden sm:block absolute top-20 left-20 bg-white bg-opacity-50 rounded p-4 drop-shadow-md">
          <div className="flex items-center">
            <span className="loading loading-ring loading-lg"></span>
            <span className="text-5xl mb-4 h-full mt-2 font-mono text-slate-700">
              &nbsp;Choosing Winner&nbsp;
            </span>
            <span className="loading loading-ring loading-lg"></span>
          </div>
        </div>
      </div >

      <div className="block sm:hidden bg-white bg-opacity-50 rounded p-4 drop-shadow-md -mt-24">
        <div className="flex items-center justify-center">
          <span className="loading loading-ring loading-lg"></span>
          <span className="text-2xl mb-4 h-full mt-2 font-mono text-slate-700">
            &nbsp;Choosing Winner&nbsp;
          </span>
          <span className="loading loading-ring loading-lg"></span>
        </div>
      </div>
      <div className="block sm:hidden bg-white rounded p-4 drop-shadow-md">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 rpo text-2xl mb-4 text-center">Lobby Participants</div>
        <div className="text-center">
          {props?.lobbyDetails?.data && props?.lobbyDetails?.data.nfts.map((nft: any, index: number) => {
            return (
              <span key={index}><span className="font-semibold">Player {index + 1}:
                <RenderName address={nft.ownerOf ? nft.ownerOf : nft.owner} isWinner={false} classData={''} /></span>
              </span>
            )
          })}
        </div>
      </div>
    </WagmiConfig >
  )
}