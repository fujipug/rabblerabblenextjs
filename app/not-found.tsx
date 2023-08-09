import Image from 'next/image'

export function NotFoundPage() {
  return (
    <>
      <div className="h-screen bg-black flex justify-center items-center">
        <Image
          src={'/images/Quokka_Leaf.png'}
          alt="404"
          width={400}
          height={400}
          objectFit="contain"
        />
        <div className='text-2xl text-gray-100'>404: Page Not Found</div>
      </div>
    </>
  )
}

export default NotFoundPage