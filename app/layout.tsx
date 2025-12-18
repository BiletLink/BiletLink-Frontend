import MaintenanceBanner from "@/components/MaintenanceBanner";

// ... existing code ...

// Using system font stack instead of Google Fonts to avoid build issues
const fontClassName = "font-sans";

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
