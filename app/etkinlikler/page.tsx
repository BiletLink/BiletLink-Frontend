'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/event/EventCard';
import { useCity } from '@/contexts/CityContext';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

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
    artistName?: string | null;
    sourceCount?: number;
    platforms?: string[];
}

const categories = ['Tümü', 'Konser', 'Tiyatro', 'Stand-Up', 'Spor', 'Festival', 'Müzikal', 'Opera', 'Bale', 'Gösteri'];

const dateFilters = [
    { id: 'all', name: 'Tüm Tarihler' },
    { id: 'today', name: 'Bugün' },
    { id: 'week', name: 'Bu Hafta' },
    { id: 'month', name: 'Bu Ay' },
    { id: 'weekend', name: 'Hafta Sonu' },
];

const priceFilters = [
    { id: 'all', name: 'Tüm Fiyatlar' },
    { id: 'free', name: 'Ücretsiz' },
    { id: '0-100', name: '0 - 100₺' },
    { id: '100-300', name: '100 - 300₺' },
    { id: '300-500', name: '300 - 500₺' },
    { id: '500+', name: '500₺+' },
];

export default function EventsPage() {
    const { selectedCity } = useCity();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [activeDateFilter, setActiveDateFilter] = useState('all');
    const [activePriceFilter, setActivePriceFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const LIMIT = 24;

    const fetchEvents = useCallback(async (reset: boolean = false) => {
        try {
            const currentOffset = reset ? 0 : offset;
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else {
                setLoadingMore(true);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
            console.log('Fetching events from:', apiUrl); // Debug log
            const params = new URLSearchParams();
            params.append('limit', LIMIT.toString());
            params.append('offset', currentOffset.toString());

            if (activeCategory !== 'Tümü') {
                params.append('category', activeCategory);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (selectedCity) {
                params.append('city', selectedCity.name);
            }

            const response = await fetch(`${apiUrl}/api/master-events?${params.toString()}`);
            const data = await response.json();

            let filteredData = data;

            // Client-side date filtering
            if (activeDateFilter !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                filteredData = data.filter((event: Event) => {
                    const eventDate = new Date(event.date);

                    switch (activeDateFilter) {
                        case 'today':
                            return eventDate >= today && eventDate < tomorrow;
                        case 'week': {
                            const weekEnd = new Date(today);
                            weekEnd.setDate(weekEnd.getDate() + 7);
                            return eventDate >= today && eventDate < weekEnd;
                        }
                        case 'month': {
                            const monthEnd = new Date(today);
                            monthEnd.setMonth(monthEnd.getMonth() + 1);
                            return eventDate >= today && eventDate < monthEnd;
                        }
                        case 'weekend': {
                            // Find next Saturday and Sunday
                            const dayOfWeek = today.getDay();
                            const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
                            const saturday = new Date(today);
                            saturday.setDate(saturday.getDate() + daysUntilSaturday);
                            const monday = new Date(saturday);
                            monday.setDate(monday.getDate() + 2);
                            return eventDate >= saturday && eventDate < monday;
                        }
                        default:
                            return true;
                    }
                });
            }

            // Client-side price filtering
            if (activePriceFilter !== 'all') {
                filteredData = filteredData.filter((event: Event) => {
                    switch (activePriceFilter) {
                        case 'free': return event.minPrice === 0;
                        case '0-100': return event.minPrice > 0 && event.minPrice <= 100;
                        case '100-300': return event.minPrice > 100 && event.minPrice <= 300;
                        case '300-500': return event.minPrice > 300 && event.minPrice <= 500;
                        case '500+': return event.minPrice > 500;
                        default: return true;
                    }
                });
            }

            // Sort
            if (sortBy === 'price-asc') {
                filteredData.sort((a: Event, b: Event) => a.minPrice - b.minPrice);
            } else if (sortBy === 'price-desc') {
                filteredData.sort((a: Event, b: Event) => b.minPrice - a.minPrice);
            } else if (sortBy === 'date') {
                filteredData.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }

            if (reset) {
                setEvents(filteredData);
            } else {
                setEvents(prev => [...prev, ...filteredData]);
            }

            setHasMore(data.length === LIMIT);
            if (!reset) {
                setOffset(currentOffset + LIMIT);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeCategory, searchQuery, selectedCity, offset, activeDateFilter, activePriceFilter, sortBy]);

    useEffect(() => {
        fetchEvents(true);
    }, [activeCategory, searchQuery, selectedCity, activeDateFilter, activePriceFilter, sortBy]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setOffset(prev => prev + LIMIT);
            fetchEvents(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            🎫 Tüm Etkinlikler
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            {selectedCity ? `${selectedCity.name} şehrindeki` : "Türkiye'deki"} tüm etkinlikleri keşfet
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Etkinlik, sanatçı veya mekan ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    {/* Category Pills */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 flex-nowrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filtreler
                            </button>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date">Tarihe Göre</option>
                                <option value="price-asc">Fiyat (Artan)</option>
                                <option value="price-desc">Fiyat (Azalan)</option>
                            </select>
                        </div>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                        <div className="pt-4 border-t border-slate-100 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tarih</label>
                                <div className="flex flex-wrap gap-2">
                                    {dateFilters.map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveDateFilter(filter.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDateFilter === filter.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {filter.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat</label>
                                <div className="flex flex-wrap gap-2">
                                    {priceFilters.map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActivePriceFilter(filter.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePriceFilter === filter.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {filter.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Events Grid */}
            <section className="flex-grow py-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="aspect-video bg-slate-200"></div>
                                    <div className="p-5">
                                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
                                        <div className="flex justify-between pt-3 border-t border-slate-100">
                                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Etkinlik Bulunamadı</h3>
                            <p className="text-slate-500">Farklı filtreler deneyebilirsin</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-slate-500 mb-6">
                                {events.length} etkinlik bulundu
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {events.map((event) => (
                                    <EventCard key={event.id} {...event} />
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="text-center mt-12">
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
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
