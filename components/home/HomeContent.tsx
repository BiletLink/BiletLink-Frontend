'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/event/EventCard';
import CitySelectPage from '@/components/home/CitySelectPage';
import { useCity } from '@/contexts/CityContext';
import { cityToSlug, slugToCity } from '@/utils/cityUtils';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

interface Event {
    id: string;
    name: string;
    slug?: string;
    description: string;
    date: string;
    imageUrl?: string | null;
    category: string;
    minPrice: number;
    venueCity?: string | null;
    status?: EventStatus;
    platforms?: string[];
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

interface HomeContentProps {
    initialCategory?: string;
    initialCitySlug?: string;
}

export default function HomeContent({ initialCategory = 'Tümü', initialCitySlug }: HomeContentProps) {
    const router = useRouter();
    const { selectedCity, setSelectedCity, isLoading, hasEverSelectedCity } = useCity();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearch = useDebounce(searchQuery, 300);

    const categories = ['Tümü', 'Konser', 'Tiyatro', 'Stand-Up', 'Spor', 'Festival', 'Müzikal', 'Opera', 'Bale', 'Gösteri'];

    // Handle initial city from props (URL-based)
    useEffect(() => {
        if (initialCitySlug) {
            const city = slugToCity(initialCitySlug);
            if (city && (!selectedCity || selectedCity.name !== city.name)) {
                setSelectedCity(city);
            }
        }
    }, [initialCitySlug, setSelectedCity]);

    // Update URL when city changes
    useEffect(() => {
        if (selectedCity) {
            const slug = cityToSlug(selectedCity.name);
            const currentPath = window.location.pathname;
            const targetPath = `/${slug}`;

            if (currentPath !== targetPath && !currentPath.includes('/etkinlik/') && !currentPath.includes('/mekan/')) {
                router.push(targetPath, { scroll: false });
            }
        }
    }, [selectedCity, router]);

    // Fetch events
    const fetchEvents = useCallback(async () => {
        if (!selectedCity) return; // Don't fetch if no city selected

        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
            const params = new URLSearchParams({
                limit: '50',
                offset: '0',
            });

            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            if (activeCategory !== 'Tümü') {
                params.append('category', activeCategory);
            }

            if (selectedCity) {
                params.append('city', selectedCity.name);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${apiUrl}/api/master-events?${params}`, {
                signal: controller.signal,
                next: { revalidate: 60 }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, activeCategory, selectedCity]);

    // Fetch when dependencies change
    useEffect(() => {
        if (selectedCity) {
            fetchEvents();
        }
    }, [debouncedSearch, activeCategory, selectedCity, fetchEvents]);

    // Categorize events for sections
    const filteredEvents = events.filter(e => e.status !== 'Removed');

    // "Bu Hafta" - Events within next 7 days
    const thisWeekEvents = filteredEvents.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekLater;
    }).slice(0, 8);

    // "Avantajlı" - Events with multiple platforms (price comparison available)
    const advantageEvents = filteredEvents.filter(e =>
        e.platforms && e.platforms.length > 1
    ).slice(0, 8);

    // "Popüler" - Just the first 8 as placeholder (would need API support for actual popularity)
    const popularEvents = filteredEvents.slice(0, 8);

    // Show city select page for first-time visitors
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-white/70">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!hasEverSelectedCity && !initialCitySlug) {
        return <CitySelectPage />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            {/* Compact Hero Section */}
            <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 py-12 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title & City */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            {selectedCity ? `${selectedCity.name}'daki Etkinlikler` : 'Etkinlikler'}
                        </h1>
                        <p className="text-white/70">
                            Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="max-w-xl mx-auto mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Etkinlik, sanatçı veya mekan ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
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

            {/* Event Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

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
                        {/* Bu Hafta Section */}
                        {thisWeekEvents.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="text-2xl">📅</span> Bu Hafta
                                    </h2>
                                    <span className="text-sm text-slate-500">{thisWeekEvents.length} etkinlik</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {thisWeekEvents.map((event) => (
                                        <EventCard key={event.id} {...event} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Avantajlı Section */}
                        {advantageEvents.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="text-2xl">💰</span> Avantajlı Fırsatlar
                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Fiyat Karşılaştırmalı
                                        </span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {advantageEvents.map((event) => (
                                        <EventCard key={event.id} {...event} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Popüler Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="text-2xl">⭐</span> Popüler Etkinlikler
                                </h2>
                                <span className="text-sm text-slate-500">{popularEvents.length} etkinlik</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {popularEvents.map((event) => (
                                    <EventCard key={event.id} {...event} />
                                ))}
                            </div>
                        </section>

                        {/* Tümünü Göster Button */}
                        {filteredEvents.length > 8 && (
                            <div className="text-center pt-8">
                                <button
                                    onClick={() => {
                                        // Could expand to show all or navigate to a full list page
                                        router.push(`/${selectedCity ? cityToSlug(selectedCity.name) : ''}/etkinlikler`);
                                    }}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Tüm Etkinlikleri Gör ({filteredEvents.length})
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
