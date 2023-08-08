import Image from 'next/image'

export function NotFoundPage() {
    return (
        <>
            <div className="h-screen">
                <Image
                    src={'/images/Quokka_Wave.png'}
                    alt="404"
                    width={400}
                    height={400}
                    // layout="fill"
                    objectFit="contain"
                />
                <div>404: Page Not Found</div>
            </div>
        </>
    )
}

export default NotFoundPage