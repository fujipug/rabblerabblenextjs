'use client'
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/navbar";
import LobbiesTable from "../components/lobbies-table";
import { fireAction } from "../utils/functions";

export default function Home() {
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
                  <span>Just shipped Beta v1.01  🎉</span>
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

      <div className="overflow-x-auto mt-4">
        <h1 className="font-semibold text-2xl ml-3 my-2">Recent Lobbies</h1>
        <div className="block sm:hidden transform animate-moveUpDown z-0 right-0 -mt-4 absolute"><Image src="/images/Face_2.png" alt="Quokka Face" width={200} height={200}></Image></div>
        <div className="block sm:hidden z-30 -mt-7 absolute right-0"><Image src="/images/Hands_2.png" alt="Quokka Hands" width={200} height={200}></Image></div>
        <LobbiesTable />
      </div>
    </>
  )
}
