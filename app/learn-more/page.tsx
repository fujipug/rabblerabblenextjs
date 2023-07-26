import Link from "next/link";

export default function LearnMore() {
  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img src="https://placebear.com/500/700" className="max-w-sm rounded-lg shadow-2xl" alt="Hero Image" />
          <div>
            <h1 className="text-5xl font-bold">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">Rabble Rabble!</span></h1>
            <p className="py-6 text-lg sm:text-xl">A thrilling NFT gambling experience with your friends!</p>
          </div>
        </div>
      </div>

      <div className="collapse bg-base-200 my-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          How does Rabble work?
        </div>
        <div className="collapse-content">
          <p>Rabble is an engaging and interactive raffle platform where one person creates a lobby to bet their NFTs against their friends.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Ensuring fairness with Chainlink VRF:
        </div>
        <div className="collapse-content">
          <p>To maintain absolute fairness, we utilize Chainlink VRF for random selection.</p>
        </div>
      </div>

      <div className="collapse bg-base-200 mb-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          Simple participation fee:
        </div>
        <div className="collapse-content">
          <p>For each participant joining or creating a lobby, there is a nominal $1 charge.</p>
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

      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <span>Developed by Pugs0x & Nobs</span>
      </div>
    </>
  )
}