'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCity } from '@/contexts/CityContext';
import { cities, cityToSlug } from '@/utils/cityUtils';

// City images for thumbnails
const CITY_IMAGES: Record<string, string> = {
    'İstanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=100&h=80&fit=crop',
    'Ankara': 'https://images.unsplash.com/photo-1569325156885-158a88d4b9d6?w=100&h=80&fit=crop',
    'İzmir': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=80&fit=crop',
    'Antalya': 'https://images.unsplash.com/photo-1593351799227-75df2026356b?w=100&h=80&fit=crop',
    'Bursa': 'https://images.unsplash.com/photo-1609866138210-84bb689f3c61?w=100&h=80&fit=crop',
    'Eskişehir': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=100&h=80&fit=crop',
    'Sinop': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=80&fit=crop',
    'Samsun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=80&fit=crop',
};
const DEFAULT_CITY_IMAGE = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=80&fit=crop';
const FAVORITE_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Eskişehir'];

const getCityImage = (cityName: string) => CITY_IMAGES[cityName] || DEFAULT_CITY_IMAGE;

export default function Header() {
    const { selectedCity, setSelectedCity } = useCity();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setSearchQuery('');
            }
        }
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // Filter cities by search
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.code.includes(searchQuery)
    ).slice(0, 8);

    const handleCitySelect = (city: typeof cities[0]) => {
        setSelectedCity(city);
        setIsDropdownOpen(false);
        setSearchQuery('');
        // Navigate to events page - city is stored in context/localStorage
        router.push('/etkinlikler');
    };

    return (
        <header className="sticky top-0 z-50 bg-[#5dbafc] backdrop-blur-lg border-b border-[#4aa8ea]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logos/logo-transparent.png"
                            alt="BiletLink"
                            width={180}
                            height={50}
                            className="h-10 w-auto group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* City Selector Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl group"
                        >
                            {/* City Image with Plate Overlay */}
                            <div className="relative w-10 h-8 rounded-lg overflow-hidden">
                                <img
                                    src={selectedCity ? getCityImage(selectedCity.name) : DEFAULT_CITY_IMAGE}
                                    alt={selectedCity?.name || 'Şehir'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {/* Semi-transparent Plate Overlay */}
                                {selectedCity && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <span className="text-white text-xs font-bold drop-shadow-lg">{selectedCity.code}</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-semibold text-white text-sm tracking-wide">
                                {selectedCity ? selectedCity.name.toLowerCase() : 'şehir seç'}
                            </span>
                            <svg className={`w-3.5 h-3.5 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                {/* Search */}
                                <div className="p-3 border-b border-slate-100">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Şehir ara..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Favorite Cities Section */}
                                {!searchQuery && (
                                    <div className="p-3 border-b border-slate-100">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Popüler Şehirler</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {FAVORITE_CITIES.map((cityName) => {
                                                const city = cities.find(c => c.name === cityName);
                                                if (!city) return null;
                                                return (
                                                    <button
                                                        key={city.code}
                                                        onClick={() => handleCitySelect(city)}
                                                        className={`relative aspect-[4/3] rounded-lg overflow-hidden group ${selectedCity?.code === city.code ? 'ring-2 ring-[#5EB0EF]' : ''}`}
                                                    >
                                                        <img src={getCityImage(city.name)} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                                        {/* Plate badge */}
                                                        <div className="absolute top-1 left-1 bg-red-600/80 text-white text-[9px] font-bold px-1 rounded">{city.code}</div>
                                                        <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium truncate">{city.name}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Cities List */}
                                <div className="max-h-48 overflow-y-auto">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2">
                                        {searchQuery ? 'Arama Sonuçları' : 'Tüm Şehirler'}
                                    </div>
                                    {filteredCities.map((city) => (
                                        <button
                                            key={city.code}
                                            onClick={() => handleCitySelect(city)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${selectedCity?.code === city.code ? 'bg-[#5EB0EF]/5' : ''}`}
                                        >
                                            {/* City Image with Plate */}
                                            <div className="relative w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={getCityImage(city.name)} alt={city.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <span className="text-white text-[10px] font-bold">{city.code}</span>
                                                </div>
                                            </div>
                                            <span className="font-medium text-slate-700 flex-1">{city.name}</span>
                                            {selectedCity?.code === city.code && (
                                                <svg className="w-5 h-5 text-[#5EB0EF]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link
                        href={selectedCity ? `/${cityToSlug(selectedCity.name)}` : '/'}
                        className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#5dbafc] font-semibold rounded-xl hover:bg-white/90 transition-all text-sm shadow-md"
                    >
                        <span>Etkinlikleri Keşfet</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="sm:hidden p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                    >
                        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4">
                    <Link
                        href={selectedCity ? `/${cityToSlug(selectedCity.name)}` : '/'}
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-[#5EB0EF] to-[#A78BFA] text-white font-medium rounded-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span>Etkinlikleri Keşfet</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            )}
        </header>
    );
}
