'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface Artist {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    genre?: string | null;
    eventCount: number;
}

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 24;

    const fetchArtists = useCallback(async (reset: boolean = false) => {
        try {
            const currentOffset = reset ? 0 : offset;
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else {
                setLoadingMore(true);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
            const params = new URLSearchParams();
            params.append('limit', LIMIT.toString());
            params.append('offset', currentOffset.toString());

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`${apiUrl}/api/artists?${params.toString()}`);
            const data = await response.json();

            if (reset) {
                setArtists(data);
            } else {
                setArtists(prev => [...prev, ...data]);
            }

            setHasMore(data.length === LIMIT);
            if (!reset) {
                setOffset(currentOffset + LIMIT);
            }
        } catch (error) {
            console.error('Failed to fetch artists:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, offset]);

    useEffect(() => {
        fetchArtists(true);
    }, [searchQuery]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setOffset(prev => prev + LIMIT);
            fetchArtists(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            🎤 Sanatçılar
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            En sevdiğin sanatçıların etkinliklerini takip et
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Sanatçı veya tür ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artists Grid */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square rounded-full bg-slate-200 mb-3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    ) : artists.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎤</div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Sanatçı Bulunamadı</h3>
                            <p className="text-slate-500">Farklı bir arama deneyin</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-slate-500 mb-6">
                                {artists.length} sanatçı bulundu
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {artists.map((artist) => (
                                    <Link
                                        key={artist.id}
                                        href={`/sanatcilar/${artist.slug}`}
                                        className="group text-center"
                                    >
                                        <div className="relative aspect-square mb-3">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                                            {artist.imageUrl ? (
                                                <img
                                                    src={artist.imageUrl}
                                                    alt={artist.name}
                                                    className="w-full h-full object-cover rounded-full relative z-10 ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative z-10 ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                    <span className="text-4xl text-white font-bold">
                                                        {artist.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors truncate">
                                            {artist.name}
                                        </h3>
                                        {artist.genre && (
                                            <p className="text-sm text-slate-500 truncate">{artist.genre}</p>
                                        )}
                                        {artist.eventCount > 0 && (
                                            <p className="text-xs text-purple-600 mt-1">
                                                {artist.eventCount} etkinlik
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="text-center mt-12">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
