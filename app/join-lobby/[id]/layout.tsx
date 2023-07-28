import Navbar from "../../../components/navbar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 mb-8">
                {children}
            </div>
        </>
    );
}