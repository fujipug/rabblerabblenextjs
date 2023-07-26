'use client'
import { ConnectWallet } from "@thirdweb-dev/react";
import Link from "next/link";

export default function Navbar() {
    return (
        <div className="navbar bg-base-100 flex justify-between drop-shadow-md">
            <Link href="/" className="btn btn-ghost normal-case text-xl">Rabble Rabble</Link>
            <ConnectWallet theme="dark" />
        </div>

    )
}