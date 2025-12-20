'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface ArtistEvent {
    id: string;
    name: string;
    date: string;
    imageUrl?: string | null;
    venueName?: string | null;
    venueCity?: string | null;
    minPrice?: number | null;
}

interface ArtistDetail {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    imageUrl?: string | null;
    coverImageUrl?: string | null;
    genre?: string | null;
    spotifyUrl?: string | null;
    instagramHandle?: string | null;
    twitterHandle?: string | null;
    eventCount: number;
    upcomingEvents: ArtistEvent[];
}

export default function ArtistDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [artist, setArtist] = useState<ArtistDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
                const response = await fetch(`${apiUrl}/api/artists/${slug}`);

                if (!response.ok) {
                    setError(true);
                    return;
                }

                const data = await response.json();
                setArtist(data);
            } catch (err) {
                console.error('Failed to fetch artist:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArtist();
        }
    }, [slug]);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sanatçı Bulunamadı</h2>
                        <Link href="/sanatcilar" className="text-purple-600 hover:underline">
                            Tüm sanatçılara dön
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
                {/* Cover Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
                    {artist.coverImageUrl && (
                        <img
                            src={artist.coverImageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Image */}
                        <div className="relative">
                            {artist.imageUrl ? (
                                <img
                                    src={artist.imageUrl}
                                    alt={artist.name}
                                    className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover ring-4 ring-white shadow-2xl"
                                />
                            ) : (
                                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-white shadow-2xl">
                                    <span className="text-7xl text-white font-bold">
                                        {artist.name.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                                {artist.name}
                            </h1>
                            {artist.genre && (
                                <p className="text-xl text-purple-300 mb-4">{artist.genre}</p>
                            )}
                            {artist.eventCount > 0 && (
                                <span className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">
                                    {artist.eventCount} yaklaşan etkinlik
                                </span>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-4 mt-6 justify-center md:justify-start">
                                {artist.spotifyUrl && (
                                    <a
                                        href={artist.spotifyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <span className="text-white text-lg">🎵</span>
                                    </a>
                                )}
                                {artist.instagramHandle && (
                                    <a
                                        href={`https://instagram.com/${artist.instagramHandle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <span className="text-white text-lg">📷</span>
                                    </a>
                                )}
                                {artist.twitterHandle && (
                                    <a
                                        href={`https://twitter.com/${artist.twitterHandle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <span className="text-white text-lg">🐦</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bio Section */}
            {artist.bio && (
                <section className="py-8 px-4 bg-white border-b border-slate-100">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Hakkında</h2>
                        <p className="text-slate-600 leading-relaxed">{artist.bio}</p>
                    </div>
                </section>
            )}

            {/* Events Section */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">
                        🎫 Yaklaşan Etkinlikler
                    </h2>

                    {artist.upcomingEvents.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl">
                            <div className="text-5xl mb-4">📅</div>
                            <p className="text-slate-500">Şu an yaklaşan etkinlik bulunmuyor</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {artist.upcomingEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/event/${event.id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group"
                                >
                                    {event.imageUrl && (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.name}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors truncate">
                                            {event.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            📅 {formatDate(event.date)}
                                        </p>
                                        {event.venueName && (
                                            <p className="text-sm text-slate-400">
                                                📍 {event.venueName}{event.venueCity ? `, ${event.venueCity}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    {event.minPrice && (
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">başlayan</p>
                                            <p className="text-lg font-bold text-purple-600">
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
