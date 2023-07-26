'use client'
import { useEffect, useState } from "react";

const RotatingGIF = () => {
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const gifList = [
    "https://media0.giphy.com/media/ur8JnxGgsez8Q/giphy.gif?cid=ecf05e470oiesx0acugl32q8fegljxhg0cnzqvvh4smvpj5k&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    "https://media4.giphy.com/media/eSwGh3YK54JKU/giphy.gif?cid=ecf05e47s5rsknn7xd2mu0gvs926i0aximbu9r0c0m75s7ov&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    "https://media3.giphy.com/media/Qv4MZa4BUABEl1CsGW/giphy.gif?cid=ecf05e47o97gohbyaw60s44d8m86dg21hsjl9k1uoyjo192z&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    'https://media4.giphy.com/media/WoF3yfYupTt8mHc7va/giphy.gif?cid=ecf05e47nm0nhq1yek9k05l77hb8he96kr3fwyfv500900s8&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    "https://media4.giphy.com/media/tl9ecXcVwGmBkS4iWk/giphy.gif?cid=ecf05e476pcz7fh3sdyj02rt0jihs43x5pyqz6h2x6gubi2r&ep=v1_gifs_search&rid=giphy.gif&ct=g"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGifIndex((prevIndex) => (prevIndex + 1) % gifList.length);
    }, 1300);

    return () => clearInterval(interval);
  }, [gifList]);

  const currentGIF = gifList[currentGifIndex];

  return <img src={currentGIF} className="w-full h-screen" alt="Rotating GIF" />;
};

export default function RafflePage() {

  return (
    <div className="w-full">
      <RotatingGIF />
      <div className="bottom-left bg-white rounded p-4 drop-shadow-md">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 rpo text-3xl mb-4">Ready Players!</span>
      </div>
    </div >
  )
}