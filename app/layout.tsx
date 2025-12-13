import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CityProvider } from "@/contexts/CityContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BiletLink - Tüm Etkinlikler Tek Platformda",
    description: "Konser, tiyatro, spor ve daha fazlası. En iyi fiyatlarla biletini al!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className={inter.className}>
                <CityProvider>
                    {children}
                </CityProvider>
            </body>
        </html>
    );
}
