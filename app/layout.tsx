import type { Metadata } from "next";
import "./globals.css";
import { CityProvider } from "@/contexts/CityContext";

// Using system font stack instead of Google Fonts to avoid build issues
const fontClassName = "font-sans";

export const metadata: Metadata = {
    title: "BiletLink - Tüm Etkinlikler Tek Platformda",
    description: "Konser, tiyatro, spor ve daha fazlası. En iyi fiyatlarla biletini al!",
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className={fontClassName}>
                <CityProvider>
                    {children}
                </CityProvider>
            </body>
        </html>
    );
}
