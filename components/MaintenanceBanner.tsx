"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function MaintenanceBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.biletlink.co";
                // Simple HEAD request or GET to check availability
                // signal with timeout to prevent long hanging 
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const res = await fetch(apiUrl, {
                    method: 'HEAD',
                    mode: 'no-cors', // We just care if it's reachable, opaque response is fine to detect network errors
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // If we reach here, we got SOME response (even 404, 500, or opaque), so server is reachable-ish.
                // But for 'maintenance' usually we care if connection fails totally or times out.
                setIsVisible(false);
            } catch (error) {
                // Network error (server down, DNS fail, timeout)
                console.error("API Connectivity Check Failed:", error);
                setIsVisible(true);
            }
        };

        // Check immediately
        checkStatus();

        // Check every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-amber-600 text-white px-4 py-3 shadow-lg relative z-50 transition-all duration-500">
            <div className="container mx-auto flex items-center justify-center gap-3">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <p className="font-medium text-center text-sm md:text-base">
                    Sistemlerimizde planlı bakım çalışması yapılmaktadır. Etkinlik verileri kısa süreliğine görüntülenemeyebilir.
                </p>
            </div>
        </div>
    );
}
