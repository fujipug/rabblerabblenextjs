'use client'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 flex justify-between drop-shadow-md items-center">
      <Link href="/" className="hidden sm:flex btn btn-ghost normal-case text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Rabble Rabble</Link>
      <Link href="/" className="flex sm:hidden btn btn-ghost normal-case text-xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">R R</Link>
      <div className="flex items-center">
        <ConnectButton />
        <span className="ml-4"><ThemeToggle /></span>
      </div>
    </div >

  )
}