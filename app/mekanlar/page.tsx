'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useCity } from '@/contexts/CityContext';

interface Venue {
    id: string;
    name: string;
    slug: string;
    city: string;
    district?: string | null;
    imageUrl?: string | null;
    capacity?: number | null;
    eventCount: number;
}

export default function VenuesPage() {
    const { selectedCity } = useCity();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCityFilter, setSelectedCityFilter] = useState<string>('');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 24;

    // Fetch cities for filter
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
                const response = await fetch(`${apiUrl}/api/venues/cities`);
                const data = await response.json();
                setCities(data);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            }
        };
        fetchCities();
    }, []);

    // Set initial city from context
    useEffect(() => {
        if (selectedCity && !selectedCityFilter) {
            setSelectedCityFilter(selectedCity.name);
        }
    }, [selectedCity]);

    const fetchVenues = useCallback(async (reset: boolean = false) => {
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
            if (selectedCityFilter) {
                params.append('city', selectedCityFilter);
            }

            const response = await fetch(`${apiUrl}/api/venues?${params.toString()}`);
            const data = await response.json();

            if (reset) {
                setVenues(data);
            } else {
                setVenues(prev => [...prev, ...data]);
            }

            setHasMore(data.length === LIMIT);
            if (!reset) {
                setOffset(currentOffset + LIMIT);
            }
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, selectedCityFilter, offset]);

    useEffect(() => {
        fetchVenues(true);
    }, [searchQuery, selectedCityFilter]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setOffset(prev => prev + LIMIT);
            fetchVenues(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            🏟️ Mekanlar
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Türkiye'nin en popüler etkinlik mekanlarını keşfet
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Mekan ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            value={selectedCityFilter}
                            onChange={(e) => setSelectedCityFilter(e.target.value)}
                            className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="" className="bg-slate-800">Tüm Şehirler</option>
                            {cities.map((city) => (
                                <option key={city} value={city} className="bg-slate-800">{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Venues Grid */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="aspect-video bg-slate-200"></div>
                                    <div className="p-5">
                                        <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : venues.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🏟️</div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Mekan Bulunamadı</h3>
                            <p className="text-slate-500">Farklı bir arama veya şehir deneyin</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-slate-500 mb-6">
                                {venues.length} mekan bulundu
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {venues.map((venue) => (
                                    <Link
                                        key={venue.id}
                                        href={`/mekanlar/${venue.slug}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
                                    >
                                        <div className="relative aspect-video overflow-hidden">
                                            {venue.imageUrl ? (
                                                <img
                                                    src={venue.imageUrl}
                                                    alt={venue.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                                    <span className="text-5xl">🏟️</span>
                                                </div>
                                            )}
                                            {venue.eventCount > 0 && (
                                                <span className="absolute top-3 right-3 px-2 py-1 bg-teal-600 text-white text-xs font-medium rounded-lg">
                                                    {venue.eventCount} etkinlik
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors truncate mb-1">
                                                {venue.name}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                📍 {venue.city}{venue.district ? `, ${venue.district}` : ''}
                                            </p>
                                            {venue.capacity && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    👥 {venue.capacity.toLocaleString('tr-TR')} kişilik
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="text-center mt-12">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
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
