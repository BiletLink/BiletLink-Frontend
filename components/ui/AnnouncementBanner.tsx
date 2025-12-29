'use client';

import { useEffect, useRef, useState } from 'react';

interface AnnouncementBannerProps {
    announcements?: string[];
}

const DEFAULT_ANNOUNCEMENTS = [
    '🎉 BiletLink ile tüm platformlardan en iyi fiyatları karşılaştırın!',
    '💰 Bilet fiyatları değişiklik gösterebilir. Güncel fiyatlar için etkinlik sayfasını kontrol edin.',
    '🎫 Yüzlerce etkinlik, tek platformda!',
    '⭐ En avantajlı biletler için BiletLink\'i takip edin.',
];

export default function AnnouncementBanner({ announcements = DEFAULT_ANNOUNCEMENTS }: AnnouncementBannerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Duplicate announcements for seamless loop
    const allAnnouncements = [...announcements, ...announcements];

    return (
        <div
            className="relative bg-gradient-to-r from-[#5EB0EF] to-[#A78BFA] text-white overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                ref={scrollRef}
                className={`flex whitespace-nowrap py-2.5 ${isPaused ? 'animate-pause' : 'animate-marquee'}`}
            >
                {allAnnouncements.map((text, index) => (
                    <span
                        key={index}
                        className="mx-12 text-sm font-medium inline-flex items-center"
                    >
                        {text}
                    </span>
                ))}
            </div>

            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#5EB0EF] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#A78BFA] to-transparent pointer-events-none" />

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-pause {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
