'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCity } from '@/contexts/CityContext';
import { cityToSlug } from '@/utils/cityUtils';
import PartyLights from '@/components/ui/PartyLights';

// City images for landmarks
const CITY_IMAGES: Record<string, { image: string; landmark: string }> = {
    'İstanbul': { image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop', landmark: 'Ayasofya' },
    'Ankara': { image: 'https://images.unsplash.com/photo-1569325156885-158a88d4b9d6?w=600&h=400&fit=crop', landmark: 'Anıtkabir' },
    'İzmir': { image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop', landmark: 'Saat Kulesi' },
    'Antalya': { image: 'https://images.unsplash.com/photo-1593351799227-75df2026356b?w=600&h=400&fit=crop', landmark: 'Kaleiçi' },
    'Bursa': { image: 'https://images.unsplash.com/photo-1609866138210-84bb689f3c61?w=600&h=400&fit=crop', landmark: 'Uludağ' },
    'Eskişehir': { image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', landmark: 'Odunpazarı' },
};

const DEFAULT_CITY_IMAGE = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop';
const TOP_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Eskişehir'];

export default function CitySelectPage() {
    const { cities, setSelectedCity } = useCity();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllCities, setShowAllCities] = useState(false);

    const filteredCities = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return cities.filter(city =>
            city.name.toLowerCase().includes(q) || city.code.includes(q)
        ).slice(0, 8);
    }, [cities, searchQuery]);

    const router = useRouter();

    const handleCitySelect = (cityName: string) => {
        const city = cities.find(c => c.name === cityName);
        if (city) {
            setSelectedCity(city);
            const citySlug = cityToSlug(city.name);
            router.push(`/${citySlug}`);
        }
    };

    const getCityImage = (cityName: string) => CITY_IMAGES[cityName]?.image || DEFAULT_CITY_IMAGE;
    const getCityLandmark = (cityName: string) => CITY_IMAGES[cityName]?.landmark || '';

    return (
        <PartyLights className="min-h-screen">
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header with Transparent Logo */}
                <header className="py-12 px-4">
                    <div className="max-w-7xl mx-auto flex justify-center">
                        <Image
                            src="/logos/logo-transparent.png"
                            alt="BiletLink"
                            width={350}
                            height={90}
                            className="h-20 sm:h-28 w-auto"
                            priority
                        />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center px-4 pb-16">
                    {/* Hero Text */}
                    <div className="text-center mb-10 fade-in">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Hayalindeki <span className="text-gradient-accent">Etkinlik</span>
                            <br />Bir Tık Uzağında
                        </h1>
                        <p className="text-lg text-white/60 max-w-lg mx-auto">
                            Konserler, tiyatrolar, spor etkinlikleri ve daha fazlası.
                        </p>
                    </div>

                    {/* Search Box */}
                    <div className="w-full max-w-xl mb-12 relative fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="relative">
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Şehir ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-5 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50 transition-all"
                            />
                        </div>

                        {/* Search Dropdown */}
                        {filteredCities.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1F3C]/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.code}
                                        onClick={() => handleCitySelect(city.name)}
                                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/10 transition-colors text-left"
                                    >
                                        <img src={getCityImage(city.name)} alt={city.name} className="w-14 h-10 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <span className="font-medium text-white">{city.name}</span>
                                            {getCityLandmark(city.name) && <span className="text-white/50 text-sm ml-2">• {getCityLandmark(city.name)}</span>}
                                        </div>
                                        <span className="text-white/40 text-sm font-medium">{city.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Skip to All Turkey */}
                    <button
                        onClick={() => {
                            setSelectedCity(null);
                            window.location.href = '/etkinlikler';
                        }}
                        className="mb-10 px-6 py-3 bg-gradient-to-r from-[#5EB0EF] to-[#A78BFA] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#5EB0EF]/30 transition-all transform hover:-translate-y-0.5 fade-in"
                        style={{ animationDelay: '0.15s' }}
                    >
                        🇹🇷 Tüm Türkiye'deki Etkinlikler
                    </button>

                    {/* Popular Cities */}
                    <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
                        veya Şehir Seç
                    </h2>

                    <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 fade-in" style={{ animationDelay: '0.3s' }}>
                        {TOP_CITIES.map((cityName) => {
                            const city = cities.find(c => c.name === cityName);
                            if (!city) return null;

                            return (
                                <button
                                    key={city.code}
                                    onClick={() => handleCitySelect(city.name)}
                                    className="group relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <img src={getCityImage(city.name)} alt={city.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-bold mr-2">{city.code}</span>
                                        <h3 className="font-bold text-xl text-white inline">{city.name}</h3>
                                        {getCityLandmark(city.name) && <p className="text-sm text-white/70 mt-0.5">{getCityLandmark(city.name)}</p>}
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#5EB0EF]/60 transition-all" />
                                </button>
                            );
                        })}
                    </div>

                    {/* All Cities */}
                    <button
                        onClick={() => setShowAllCities(!showAllCities)}
                        className="mt-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                        {showAllCities ? 'Gizle' : 'Tüm Şehirler'}
                        <svg className={`w-4 h-4 transition-transform ${showAllCities ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showAllCities && (
                        <div className="w-full max-w-5xl mt-6 fade-in">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2">
                                    {cities.map((city) => (
                                        <button
                                            key={city.code}
                                            onClick={() => handleCitySelect(city.name)}
                                            className="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-[#5EB0EF]/20 rounded-xl text-white text-sm transition-colors text-left"
                                        >
                                            <img src={getCityImage(city.name)} alt={city.name} className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{city.name}</div>
                                                <div className="text-white/40 text-xs">{city.code}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="py-6 text-center text-white/30 text-sm">
                    © 2025 BiletLink. Tüm hakları saklıdır.
                </footer>
            </div>
        </PartyLights>
    );
}
