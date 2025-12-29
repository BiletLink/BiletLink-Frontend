'use client';

import { useState, useMemo } from 'react';
import { useCity } from '@/contexts/CityContext';
import { cityToSlug } from '@/utils/cityUtils';

// Top 5 most popular cities
const TOP_CITIES = [
    { code: '34', name: 'İstanbul', eventCount: 500 },
    { code: '06', name: 'Ankara', eventCount: 150 },
    { code: '35', name: 'İzmir', eventCount: 120 },
    { code: '07', name: 'Antalya', eventCount: 80 },
    { code: '16', name: 'Bursa', eventCount: 60 },
];

// City images from Unsplash (curated for each city)
const CITY_IMAGES: Record<string, string> = {
    'İstanbul': 'https://images.unsplash.com/photo-1527838832700-50592524d780?w=600&h=400&fit=crop',
    'Ankara': 'https://images.unsplash.com/photo-1588698947656-745a3375cb44?w=600&h=400&fit=crop',
    'İzmir': 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=600&h=400&fit=crop',
    'Antalya': 'https://images.unsplash.com/photo-1596395819057-36e67b2d2072?w=600&h=400&fit=crop',
    'Bursa': 'https://images.unsplash.com/photo-1636287959082-a0b5d0387b92?w=600&h=400&fit=crop',
};

export default function CitySelectPage() {
    const { cities, setSelectedCity } = useCity();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter cities by search
    const filteredCities = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return cities.filter(city =>
            city.name.toLowerCase().includes(q) ||
            city.code.includes(q)
        ).slice(0, 10);
    }, [cities, searchQuery]);

    const handleCitySelect = (cityName: string) => {
        const city = cities.find(c => c.name === cityName);
        if (city) {
            setSelectedCity(city);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
            {/* Abstract background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Logo */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-3xl">🎫</span>
                        </div>
                        <span className="text-4xl font-extrabold text-white tracking-tight">BiletLink</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3">
                    Şehrindeki Etkinlikleri Keşfet
                </h1>
                <p className="text-lg text-white/70 text-center mb-10 max-w-md">
                    Konserler, tiyatrolar ve daha fazlası. Şehrini seç, etkinliklere göz at!
                </p>

                {/* Search */}
                <div className="w-full max-w-xl mb-12 relative">
                    <div className="relative">
                        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Şehir ara... (örn: Samsun, 55)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            {filteredCities.map((city) => (
                                <button
                                    key={city.code}
                                    onClick={() => handleCitySelect(city.name)}
                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors text-left"
                                >
                                    <span className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                        {city.code}
                                    </span>
                                    <span className="font-medium text-slate-800">{city.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Cities Grid */}
                <div className="w-full max-w-5xl">
                    <h2 className="text-xl font-semibold text-white/80 text-center mb-6">Popüler Şehirler</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {TOP_CITIES.map((city) => (
                            <button
                                key={city.code}
                                onClick={() => handleCitySelect(city.name)}
                                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                {/* Background Image */}
                                <img
                                    src={CITY_IMAGES[city.name]}
                                    alt={city.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="font-bold text-lg drop-shadow-lg">{city.name}</h3>
                                    <p className="text-sm text-white/80">{city.eventCount}+ etkinlik</p>
                                </div>

                                {/* Plate Code Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                                        {city.code}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* All Cities Link */}
                <button
                    onClick={() => {
                        // Open modal or expand to show all cities
                        // For now, just show a placeholder
                        const allCitiesDiv = document.getElementById('all-cities');
                        if (allCitiesDiv) {
                            allCitiesDiv.classList.toggle('hidden');
                        }
                    }}
                    className="mt-10 px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all"
                >
                    Tüm Şehirler →
                </button>

                {/* All Cities Grid (hidden by default) */}
                <div id="all-cities" className="hidden w-full max-w-5xl mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h3 className="text-lg font-semibold text-white mb-4">Tüm Şehirler</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                            {cities.map((city) => (
                                <button
                                    key={city.code}
                                    onClick={() => handleCitySelect(city.name)}
                                    className="px-3 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors text-left truncate"
                                >
                                    <span className="text-white/50 mr-1">{city.code}</span>
                                    {city.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 py-6 text-center text-white/50 text-sm">
                © 2025 BiletLink. Tüm hakları saklıdır.
            </div>
        </div>
    );
}
