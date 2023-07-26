import Image from 'next/image'

export default function Restricted() {
    return (
        <div className="container min-w-full">
            <Image className="w-full"
                alt="Restricted"
                src="https://media2.giphy.com/media/UK5AQccKV9OMg/giphy.gif?cid=ecf05e476hqk8ot7rrkek199dfu4d9vzbjjapc0c4wbsyq15&ep=v1_gifs_search&rid=giphy.gif&ct=g" />
            <div className="centered bg-white rounded p-4 drop-shadow-md">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 rpo text-3xl">Hey You&apos;re not allowed here</span>
            </div>
        </div>
    )
}