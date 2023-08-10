'use client'
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../../../utils/wagmi-config.ts";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import { collection, documentId, getDocs, getFirestore, where, query, updateDoc, doc, Timestamp } from "firebase/firestore";
import { firebaseConfig } from "../../../utils/firebase-config";
import { getRaffleById, truncateAddress } from "../../../utils/hooks";

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

export default function RafflePage({ params }: { params: { id: string } }) {
  const [lobbyDetails, setLobbyDetails] = useState() as any;

  const fetchFirebaseData = async () => {
    try {
      const q = query(collection(db, 'lobbies'), where(documentId(), '==', params.id));
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        setLobbyDetails({ id: doc.id, data: doc.data() });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Update the firebase database with the winner
  const updateFirebaseLobby = async (winner: string) => {
    const lobbyRef = doc(db, 'lobbies', lobbyDetails.id);
    return await updateDoc(lobbyRef, {
      winner: winner,
      completedDate: Timestamp.now()
    });
  }

  const [count, setCount] = useState(0); // Initial Count time in seconds
  useEffect(() => {
    const interval = setInterval(() => {
      getRaffleById(lobbyDetails?.data.raffleId).then(async (res: any) => {
        if (res[5].toString() !== '0x0000000000000000000000000000000000000000') {
          updateFirebaseLobby(res[5].toString()).then(() => {
            location.href = `/lobby-details/${params.id}`;
            clearInterval(interval);
          });
        } else {
          setCount(prevCounter => prevCounter + 1);
        }
      })
    }, 1000); // Execute every second (1000 milliseconds)

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [count, lobbyDetails?.data.raffleId, params.id]);


  useEffect(() => {
    fetchFirebaseData();
  }, [params.id]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="w-full relative">
        <RotatingGIF />
        <div className="hidden sm:block absolute bottom-20 left-20 bg-white rounded p-4 drop-shadow-md">
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 rpo text-3xl mb-4">Lobby Participants</div>
          {lobbyDetails?.data && lobbyDetails?.data.nfts.map((nft: any, index: number) => {
            return (
              <p key={index}><span className="font-semibold">Player {index + 1}: </span>{truncateAddress(nft.ownerOf ? nft.ownerOf : nft.owner)}</p>
            )
          })}
        </div>

        <div className="hidden sm:block absolute top-20 left-20 bg-white bg-opacity-50 rounded p-4 drop-shadow-md">
          <div className="flex items-center">
            <span className="loading loading-ring loading-lg"></span>
            <span className="text-5xl mb-4 h-full mt-2 font-mono">
              &nbsp;Choosing Winner&nbsp;
            </span>
            <span className="loading loading-ring loading-lg"></span>
          </div>
        </div>
      </div >

      <div className="block sm:hidden bg-white bg-opacity-50 rounded p-4 drop-shadow-md -mt-24">
        <div className="flex items-center justify-center">
          <span className="loading loading-ring loading-lg"></span>
          <span className="text-2xl mb-4 h-full mt-2 font-mono">
            &nbsp;Choosing Winner&nbsp;
          </span>
          <span className="loading loading-ring loading-lg"></span>
        </div>
      </div>
      <div className="block sm:hidden bg-white rounded p-4 drop-shadow-md">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 rpo text-2xl mb-4 text-center">Lobby Participants</div>
        <div className="text-center">
          {lobbyDetails?.data && lobbyDetails?.data.nfts.map((nft: any, index: number) => {
            return (
              <p key={index}><span className="font-semibold">Player {index + 1}: </span>{truncateAddress(nft.ownerOf ? nft.ownerOf : nft.owner)}</p>
            )
          })}
        </div>
      </div>
    </WagmiConfig >
  )
}