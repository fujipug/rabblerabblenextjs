'use client'
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../../components/theme-toggle";
import { useEffect, useState } from "react";

function Tweets() {
  const tweets = ['rabblet', 'giraffe'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalDelay = 4200; // Time in milliseconds between each iteration

  useEffect(() => {
    const iterateArray = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tweets.length);
    };
    const intervalId = setInterval(iterateArray, intervalDelay);

    return () => clearInterval(intervalId);
  }, [tweets.length, intervalDelay]);
  return (
    <Image src={`/images/${tweets[currentIndex]}.gif`} width={350} height={100} className="mt-6 drop-shadow-md rounded-lg" alt="Tweet" />
  )
}

export default function LearnMore() {
  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <Image src={'/images/Quokka_Wave.png'} width={400} height={400} className="hidden sm:block max-w-sm" alt="Quokka Wave" />
          <div>
            <div className="flex justify-between items-center">
              <Link href="/" className="inline-flex space-x-6 cursor-pointer">
                <div className="badge badge-outline p-3">
                  Return Home
                </div>
              </Link>
              <div className="right-0 p-3"><ThemeToggle /></div>
            </div>

            <h1 className="text-5xl font-bold">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span></h1>
            <p className="py-6 text-lg sm:text-xl">A thrilling NFT Raffling experience with your friends!</p>
            <Tweets />
          </div>
        </div>
      </div>

      <div className="collapse bg-base-200 my-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          How does <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span> work?
        </div>
        <div className="collapse-content">
          <p><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</span> is an engaging and interactive raffle platform where one person creates a lobby to bet their NFTs against their friends.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Ensuring fairness with Chainlink VRF:
        </div>
        <div className="collapse-content">
          <p>To maintain absolute fairness, we utilize <Link className="text-indigo-500 hover:text-indigo-600" href="https://docs.chain.link/vrf/v2/introduction">Chainlink VRF</Link> for random selection.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Simple participation fee:
        </div>
        <div className="collapse-content">
          <p>For each participant joining or creating a lobby, there is a nominal 0.1 AVAX charge.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Easy Lobby Creation:
        </div>
        <div className="collapse-content">
          <p>To begin, the host creates the lobby for the raffle, specifying the number of participants, the NFT collection to be raffled, and the choice between private or public settings.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Share the fun:
        </div>
        <div className="collapse-content">
          <p>Once the lobby is set up, the host launches lobby links, which can then be shared with friends.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Collection Eligibility:
        </div>
        <div className="collapse-content">
          <p>To ensure a level playing field, currently, only one collection can participate in a single lobby.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Stay tuned for more:
        </div>
        <div className="collapse-content">
          <p>We are continuously working to bring you more exciting features and services. Your feedback and suggestions are valuable to us, so feel free to reach out to us on Twitter
            <Link className="text-sky-500 hover:text-sky-600" href="https://twitter.com/nobsfud"> @nobsfud</Link>.</p>
        </div>
      </div>

      <div className="flex items-center font-mono">
        <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth={1.0} stroke="black" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <span>Developed by
          <Link className="cursor-pointer hover:text-indigo-400" href="https://twitter.com/pugs0x"> Pugs0x</Link>,
          <Link className="cursor-pointer hover:text-sky-500" href="https://twitter.com/nobsfud"> Nobs</Link> &
          <Link className="cursor-pointer hover:text-emerald-500" href="https://twitter.com/0xPrimata"> 0xPrimata</Link>
        </span>
      </div >
    </>
  )
}