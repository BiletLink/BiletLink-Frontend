'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/event/EventCard';
import AnnouncementBanner from '@/components/ui/AnnouncementBanner';
import { useCity } from '@/contexts/CityContext';
import { slugToCity } from '@/utils/cityUtils';

interface Event {
    id: string;
    name: string;
    slug?: string;
    date: string;
    imageUrl?: string | null;
    category?: string;
    minPrice?: number | null;
    venueCity?: string | null;
    venueName?: string | null;
    platforms?: string[];
    platformPrices?: Record<string, number>;
}

const categories = ['Tümü', 'Konser', 'Tiyatro', 'Stand-Up', 'Spor', 'Festival'];

export default function CityEventsPage() {
    const params = useParams();
    const citySlug = params.mainSlug as string;
    const { selectedCity, setSelectedCity } = useCity();

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    // Set city from URL
    useEffect(() => {
        if (citySlug && citySlug !== 'etkinlikler') {
            const city = slugToCity(citySlug);
            if (city && (!selectedCity || selectedCity.name !== city.name)) {
                setSelectedCity(city);
            }
        }
    }, [citySlug, selectedCity, setSelectedCity]);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
            const params = new URLSearchParams({ limit: '100', offset: '0' });

            if (activeCategory !== 'Tümü') {
                params.append('category', activeCategory);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (selectedCity) {
                params.append('city', selectedCity.name);
            }

            const response = await fetch(`${apiUrl}/api/master-events?${params}`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, searchQuery, selectedCity]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const cityName = selectedCity?.name || 'Tüm Türkiye';

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <Header />
            <AnnouncementBanner />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0A0F1C] via-[#1A1F3C] to-[#0F172A] py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                        <span className="text-[#5EB0EF]">{cityName}</span>
                        <span className="text-white/80">'daki Tüm Etkinlikler</span>
                    </h1>
                    <p className="text-white/60 text-lg mb-8">
                        {events.length} etkinlik bulundu
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto mb-6">
                        <div className="relative">
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Etkinlik ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-5 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-[#5EB0EF] text-white shadow-lg'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Events Grid */}
            <section className="flex-1 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="aspect-[16/10] bg-slate-200"></div>
                                    <div className="p-5">
                                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎭</div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">Etkinlik Bulunamadı</h3>
                            <p className="text-slate-500">Bu kategoride henüz etkinlik yok.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event) => (
                                <EventCard key={event.id} {...event} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
