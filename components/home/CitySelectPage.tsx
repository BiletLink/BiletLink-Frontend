'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCity } from '@/contexts/CityContext';
import PartyLights from '@/components/ui/PartyLights';

// Top 5 most popular cities with curated images
const TOP_CITIES = [
    { code: '34', name: 'İstanbul', eventCount: 500, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop' },
    { code: '06', name: 'Ankara', eventCount: 150, image: 'https://images.unsplash.com/photo-1569325156885-158a88d4b9d6?w=600&h=400&fit=crop' },
    { code: '35', name: 'İzmir', eventCount: 120, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop' },
    { code: '07', name: 'Antalya', eventCount: 80, image: 'https://images.unsplash.com/photo-1593351799227-75df2026356b?w=600&h=400&fit=crop' },
    { code: '16', name: 'Bursa', eventCount: 60, image: 'https://images.unsplash.com/photo-1609866138210-84bb689f3c61?w=600&h=400&fit=crop' },
];

export default function CitySelectPage() {
    const { cities, setSelectedCity } = useCity();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllCities, setShowAllCities] = useState(false);

    // Filter cities by search
    const filteredCities = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return cities.filter(city =>
            city.name.toLowerCase().includes(q) ||
            city.code.includes(q)
        ).slice(0, 8);
    }, [cities, searchQuery]);

    const handleCitySelect = (cityName: string) => {
        const city = cities.find(c => c.name === cityName);
        if (city) {
            setSelectedCity(city);
        }
    };

    return (
        <PartyLights className="min-h-screen">
            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="py-6 px-4">
                    <div className="max-w-7xl mx-auto flex justify-center">
                        <Image
                            src="/logos/logo-text.jpg"
                            alt="BiletLink"
                            width={180}
                            height={50}
                            className="h-12 w-auto"
                            priority
                        />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
                    {/* Hero Text */}
                    <div className="text-center mb-12 fade-in">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                            Hayalindeki <span className="text-gradient-accent">Etkinlik</span>
                            <br />Bir Tık Uzağında
                        </h1>
                        <p className="text-lg text-white/60 max-w-lg mx-auto">
                            Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası.
                            <br />Türkiye'nin en kapsamlı etkinlik platformu.
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="w-full max-w-2xl mb-12 relative fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="relative">
                            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Şehir ara... (örn: Samsun, 55)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-5 pl-16 rounded-2xl glass-dark text-white placeholder-white/40 text-lg focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {filteredCities.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.code}
                                        onClick={() => handleCitySelect(city.name)}
                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <span className="w-12 h-12 rounded-xl bg-[#5EB0EF]/20 flex items-center justify-center text-[#5EB0EF] font-bold text-sm group-hover:bg-[#5EB0EF] group-hover:text-white transition-all">
                                            {city.code}
                                        </span>
                                        <span className="font-medium text-white">{city.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-16 fade-in" style={{ animationDelay: '0.2s' }}>
                        {['Tümü', 'Konser', 'Tiyatro', 'Stand Up', 'Spor', 'Festival', 'Müzikal', 'Opera', 'Bale', 'Gösteri'].map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${i === 0
                                    ? 'bg-[#5EB0EF] text-white shadow-lg shadow-[#5EB0EF]/30'
                                    : 'glass-dark text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Popular Cities */}
                    <div className="w-full max-w-6xl fade-in" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-xl font-semibold text-white/80 text-center mb-8">
                            Popüler Şehirler
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                            {TOP_CITIES.map((city, index) => (
                                <button
                                    key={city.code}
                                    onClick={() => handleCitySelect(city.name)}
                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden card-hover"
                                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                                >
                                    {/* Background Image */}
                                    <img
                                        src={city.image}
                                        alt={city.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="font-bold text-lg text-white drop-shadow-lg">{city.name}</h3>
                                        <p className="text-sm text-white/70">{city.eventCount}+ etkinlik</p>
                                    </div>

                                    {/* Plate Code Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                                            {city.code}
                                        </span>
                                    </div>

                                    {/* Hover Border */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#5EB0EF]/50 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* All Cities Toggle */}
                    <button
                        onClick={() => setShowAllCities(!showAllCities)}
                        className="mt-12 px-8 py-3.5 glass-dark rounded-full text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        {showAllCities ? 'Gizle' : 'Tüm Şehirler'}
                        <svg
                            className={`w-4 h-4 transition-transform ${showAllCities ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* All Cities Grid */}
                    {showAllCities && (
                        <div className="w-full max-w-5xl mt-8 fade-in">
                            <div className="glass-dark rounded-2xl p-6">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto">
                                    {cities.map((city) => (
                                        <button
                                            key={city.code}
                                            onClick={() => handleCitySelect(city.name)}
                                            className="px-3 py-2.5 bg-white/5 hover:bg-[#5EB0EF]/20 rounded-lg text-white text-sm transition-colors text-left truncate"
                                        >
                                            <span className="text-white/40 mr-1.5">{city.code}</span>
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-white/40 text-sm">
                    © 2025 BiletLink. Tüm hakları saklıdır.
                </footer>
            </div>
        </PartyLights>
    );
}
