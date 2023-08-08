import Image from 'next/image'

export function NotFoundPage() {
    return (
        <div className="h-screen">
            <Image
                width={500}
                height={500}
                src="/public/images/Quokka_Wave.png"
                alt="404"
                layout="fill"
                objectFit="contain"
            />
        </div>
    )
}

export default NotFoundPage