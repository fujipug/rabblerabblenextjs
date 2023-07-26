'use client'
import { ConnectWallet } from "@thirdweb-dev/react";
import Link from "next/link";

export default function Navbar(props: { showButton?: boolean }) {
    return (
        <div className="navbar bg-base-100 flex justify-between drop-shadow-md">
            <Link href="/" className="btn btn-ghost normal-case text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">Rabble Rabble</Link>
            <ConnectWallet theme="dark" />
        </div>

    )
}