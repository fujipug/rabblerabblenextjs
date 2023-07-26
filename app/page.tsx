import Link from "next/link";

export default function Example() {
  return (
    <>
      <div className="relative isolate overflow-hidden back sm:h-screen drop-shadow-md">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a className="inline-flex space-x-6 cursor-pointer">
                <div className="badge badge-neutral badge-outline p-3">What's new</div>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6">
                  <span>Just shipped v1.0  🎉</span>
                </span>
              </a>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Raffle <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">NFT's</span> with the boys</h1>
            <p className="mt-6 text-lg leading-8"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">Rabble Rabble</span> is a fun and exciting way to wager your NFTs with friends.</p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/private-lobby" className="btn btn-secondary drop-shadow-lg">Start A Lobby</Link>
              <Link href="/learn-more" className="btn btn-ghost">Learn more <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-2 rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  src="images/avax-nfts(50).gif"
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
            <tr>
              <th>1</th>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
