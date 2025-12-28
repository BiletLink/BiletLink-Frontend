'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface VenueEvent {
    id: string;
    name: string;
    date: string;
    slug?: string;
    imageUrl?: string | null;
    category?: string | null;
    artistName?: string | null;
    minPrice?: number | null;
}

interface VenueDetail {
    id: string;
    name: string;
    slug: string;
    city: string;
    district?: string | null;
    address?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    websiteUrl?: string | null;
    phoneNumber?: string | null;
    capacity?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    eventCount: number;
    upcomingEvents: VenueEvent[];
}

// Helper to generate SEO-friendly event URL
function getEventUrl(event: VenueEvent, venueCity: string): string {
    // For now fallback to old URL, can be updated later
    return `/event/${event.id}`;
}

export default function VenueDetailPage() {
    const params = useParams();
    const { city, slug } = params as { city: string; slug: string };
    const [venue, setVenue] = useState<VenueDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
                // Use new city-based endpoint
                const response = await fetch(`${apiUrl}/api/venues/${city}/${slug}`);

                if (!response.ok) {
                    setError(true);
                    return;
                }

                const data = await response.json();
                setVenue(data);
            } catch (err) {
                console.error('Failed to fetch venue:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (city && slug) {
            fetchVenue();
        }
    }, [city, slug]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mekan Bulunamadı</h2>
                        <Link href="/mekanlar" className="text-teal-600 hover:underline">
                            Tüm mekanlara dön
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800">
                    {venue.imageUrl && (
                        <img
                            src={venue.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="w-full md:w-1/3">
                            {venue.imageUrl ? (
                                <img
                                    src={venue.imageUrl}
                                    alt={venue.name}
                                    className="w-full aspect-video md:aspect-square rounded-2xl object-cover shadow-2xl"
                                />
                            ) : (
                                <div className="w-full aspect-video md:aspect-square rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl">
                                    <span className="text-6xl">🏟️</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                                {venue.name}
                            </h1>

                            <div className="space-y-2 text-slate-300 mb-6">
                                <p className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{venue.city}{venue.district ? `, ${venue.district}` : ''}</span>
                                </p>
                                {venue.address && (
                                    <p className="flex items-start gap-2">
                                        <span>🗺️</span>
                                        <span>{venue.address}</span>
                                    </p>
                                )}
                                {venue.capacity && (
                                    <p className="flex items-center gap-2">
                                        <span>👥</span>
                                        <span>{venue.capacity.toLocaleString('tr-TR')} kişi kapasiteli</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {venue.eventCount > 0 && (
                                    <span className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium">
                                        {venue.eventCount} yaklaşan etkinlik
                                    </span>
                                )}
                                {venue.websiteUrl && (
                                    <a
                                        href={venue.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                                    >
                                        🌐 Web Sitesi
                                    </a>
                                )}
                                {venue.latitude && venue.longitude && (
                                    <a
                                        href={`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                                    >
                                        🗺️ Haritada Göster
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Description */}
            {venue.description && (
                <section className="py-8 px-4 bg-white border-b border-slate-100">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Hakkında</h2>
                        <p className="text-slate-600 leading-relaxed">{venue.description}</p>
                    </div>
                </section>
            )}

            {/* Events */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">
                        🎫 Bu Mekandaki Etkinlikler
                    </h2>

                    {venue.upcomingEvents.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl">
                            <div className="text-5xl mb-4">📅</div>
                            <p className="text-slate-500">Şu an yaklaşan etkinlik bulunmuyor</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {venue.upcomingEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={getEventUrl(event, venue.city)}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group"
                                >
                                    {event.imageUrl && (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors truncate">
                                            {event.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            📅 {formatDate(event.date)}
                                        </p>
                                        {event.category && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                                                {event.category}
                                            </span>
                                        )}
                                    </div>
                                    {event.minPrice && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-slate-400">başlayan</p>
                                            <p className="text-lg font-bold text-teal-600">
                                                {event.minPrice.toLocaleString('tr-TR')}₺
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
