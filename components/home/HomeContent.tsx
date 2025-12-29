'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    venueName?: string | null;
    status?: EventStatus;
    platforms?: string[];
    platformPrices?: Record<string, number>;
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
        if (!selectedCity) return;

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
    }).slice(0, 10);

    // "Avantajlı" - Events with multiple platforms (price comparison available)
    const advantageEvents = filteredEvents.filter(e =>
        e.platforms && e.platforms.length > 1
    ).slice(0, 10);

    // "Popüler" - All events
    const popularEvents = filteredEvents.slice(0, 12);

    // Show city select page for first-time visitors
    if (isLoading) {
        return (
            <div className="min-h-screen bg-biletlink flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-[#5EB0EF]/30 border-t-[#5EB0EF] rounded-full animate-spin"></div>
                    <p className="mt-4 text-white/60">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!hasEverSelectedCity && !initialCitySlug) {
        return <CitySelectPage />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-biletlink party-lights py-16 overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* City & Title */}
                    <div className="text-center mb-10 fade-in">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                            {selectedCity ? (
                                <>
                                    <span className="text-gradient-accent">{selectedCity.name}</span>
                                    <span className="text-white/80">'daki Etkinlikler</span>
                                </>
                            ) : 'Etkinlikler'}
                        </h1>
                        <p className="text-white/60 text-lg">
                            Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="max-w-2xl mx-auto mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="relative">
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Etkinlik, sanatçı veya mekan ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-2xl glass-dark text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2 fade-in" style={{ animationDelay: '0.2s' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-[#5EB0EF] text-white shadow-lg shadow-[#5EB0EF]/30'
                                        : 'glass-dark text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Event Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-[#5EB0EF]/30 border-t-[#5EB0EF] rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500">Etkinlikler yükleniyor...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🎭</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Etkinlik Bulunamadı</h3>
                        <p className="text-slate-500">Bu kategoride henüz etkinlik yok.</p>
                    </div>
                ) : (
                    <>
                        {/* Bu Hafta Section - Horizontal Scroll */}
                        {thisWeekEvents.length > 0 && (
                            <section className="fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5EB0EF] to-[#A78BFA] flex items-center justify-center text-white text-lg">📅</span>
                                        Bu Hafta
                                    </h2>
                                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        {thisWeekEvents.length} etkinlik
                                    </span>
                                </div>
                                <div className="scroll-x">
                                    {thisWeekEvents.map((event) => (
                                        <div key={event.id} className="w-[280px] sm:w-[320px]">
                                            <EventCard {...event} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Avantajlı Section */}
                        {advantageEvents.length > 0 && (
                            <section className="fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#22D3EE] flex items-center justify-center text-white text-lg">💰</span>
                                        Avantajlı Fırsatlar
                                        <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Fiyat Karşılaştırmalı
                                        </span>
                                    </h2>
                                </div>
                                <div className="scroll-x">
                                    {advantageEvents.map((event) => (
                                        <div key={event.id} className="w-[280px] sm:w-[320px]">
                                            <EventCard {...event} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Popüler Section - Grid */}
                        <section className="fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#A78BFA] flex items-center justify-center text-white text-lg">⭐</span>
                                    Popüler Etkinlikler
                                </h2>
                                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                    {popularEvents.length} etkinlik
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {popularEvents.map((event) => (
                                    <EventCard key={event.id} {...event} />
                                ))}
                            </div>
                        </section>

                        {/* View All Button */}
                        {filteredEvents.length > 12 && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => {
                                        router.push(`/${selectedCity ? cityToSlug(selectedCity.name) : ''}/etkinlikler`);
                                    }}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5EB0EF] to-[#A78BFA] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#5EB0EF]/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    Tüm Etkinlikleri Gör
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
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
