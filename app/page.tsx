'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import EventCard from '@/components/event/EventCard';
import { useCity } from '@/contexts/CityContext';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl?: string | null;
    category: string;
    minPrice: number;
    venueCity?: string | null;
    status?: EventStatus;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function Home() {
    const { selectedCity } = useCity();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    const debouncedSearch = useDebounce(searchQuery, 300);

    const categories = ['Tümü', 'Konser', 'Tiyatro', 'Stand-Up', 'Spor', 'Festival', 'Müzikal', 'Opera', 'Bale', 'Gösteri'];

    const fetchEvents = useCallback(async (reset: boolean = false) => {
        try {
            const currentOffset = reset ? 0 : offset;
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else {
                setLoadingMore(true);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const params = new URLSearchParams({
                limit: LIMIT.toString(),
                offset: currentOffset.toString(),
            });

            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            if (activeCategory !== 'Tümü') {
                params.append('category', activeCategory);
            }

            if (selectedCity !== 'Tüm Şehirler') {
                params.append('city', selectedCity);
            }

            const response = await fetch(`${apiUrl}/api/events?${params}`);
            const data = await response.json();

            if (reset) {
                setEvents(data);
            } else {
                setEvents(prev => [...prev, ...data]);
            }

            setHasMore(data.length === LIMIT);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [offset, debouncedSearch, activeCategory, selectedCity]);

    // Initial load and search/category/city change
    useEffect(() => {
        fetchEvents(true);
    }, [debouncedSearch, activeCategory, selectedCity]);

    const loadMore = () => {
        setOffset(prev => prev + LIMIT);
    };

    // Load more when offset changes (but not on initial load)
    useEffect(() => {
        if (offset > 0) {
            fetchEvents(false);
        }
    }, [offset]);

    const filteredEvents = events.filter(e => e.status !== 'Removed');

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-slate-900 py-24 sm:py-32 overflow-hidden">
                {/* Abstract Glow Effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6">
                        Hayalindeki{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Etkinlik
                        </span>
                        <br />
                        Bir Tık Uzağında
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto text-balance">
                        Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası. Türkiye'nin en kapsamlı etkinlik platformu.
                    </p>

                    {/* Search Box */}
                    <div className="max-w-xl mx-auto mb-10">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Etkinlik, sanatçı veya mekan ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-white text-slate-900 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Events Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {activeCategory === 'Tümü' ? 'Tüm Etkinlikler' : activeCategory}
                        {selectedCity !== 'Tüm Şehirler' && ` - ${selectedCity}`}
                    </h2>
                    <p className="text-slate-500">
                        {filteredEvents.length} etkinlik bulundu
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500">Etkinlikler yükleniyor...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <p className="text-xl text-slate-500">Bu kategoride etkinlik bulunamadı.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} {...event} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && filteredEvents.length > 0 && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Yükleniyor...
                                        </span>
                                    ) : (
                                        'Daha Fazla Yükle'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-slate-400">
                        © 2025 BiletLink. Made with 💙 by AI
                    </p>
                </div>
            </footer>
        </div>
    );
}
