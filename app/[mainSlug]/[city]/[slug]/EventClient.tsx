'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventDetailClient from '../../../event/[id]/EventDetailClient';

interface Session {
    id: string;
    sessionDate: string;
    venueName?: string;
    minPrice?: number;
    performanceUrl?: string;
    isAvailable: boolean;
}

interface TicketOption {
    platform: string;
    platformTitle: string;
    eventUrl?: string;
    sourceLogo?: string;
    brandColor?: string;
    isVip: boolean;
    isDinnerIncluded: boolean;
    isAvailable: boolean;
    prices: { price: number; currency: string; url?: string; affiliateUrl?: string; }[];
    sessions: Session[];
}

interface EventDetail {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    date: string;
    imageUrl?: string | null;
    category?: string;
    minPrice?: number | null;
    viewCount?: number;
    ticketOptions: TicketOption[];
    artist?: { id: string; name: string; slug?: string; imageUrl?: string; };
    venue?: { id: string; name: string; slug?: string; city: string; address?: string; };
}

export default function EventBySeoUrl() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { category, city, slug } = params as { category: string; city: string; slug: string };

    useEffect(() => {
        async function fetchEvent() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
                const res = await fetch(`${apiUrl}/api/master-events/by-slug/${category}/${city}/${slug}`);

                if (!res.ok) {
                    setError(true);
                    return;
                }

                const data = await res.json();
                setEvent(data);
            } catch (e) {
                console.error('Error fetching event:', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [category, city, slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Etkinlik Bulunamadı</h1>
                    <p className="text-gray-400 mb-8">Aradığınız etkinlik bulunamadı veya yayından kaldırılmış olabilir.</p>
                    <button
                        onClick={() => router.push('/etkinlikler')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Etkinliklere Dön
                    </button>
                </div>
            </div>
        );
    }

    return <EventDetailClient initialEvent={event} />;
}
