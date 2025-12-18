import MaintenanceBanner from "@/components/MaintenanceBanner";

// ... existing code ...

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className={fontClassName}>
                <MaintenanceBanner />
                <CityProvider>
                    {children}
                </CityProvider>
            </body>
        </html>
    );
}
