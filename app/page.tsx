'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import EventCard from '@/components/event/EventCard';

interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl?: string | null;
    category: string;
    minPrice: number;
}

export default function Home() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tümü');

    const categories = ['Tümü', 'Konser', 'Tiyatro', 'Spor', 'Atölye', 'Parti', 'Gece Hayatı'];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/events?limit=50`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = activeCategory === 'Tümü'
        ? events
        : events.filter(e => e.category === activeCategory);

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
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto text-balance">
                        Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası. Türkiye'nin en kapsamlı etkinlik platformu.
                    </p>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-full font-medium transition-all ${activeCategory === cat
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} {...event} />
                        ))}
                    </div>
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
