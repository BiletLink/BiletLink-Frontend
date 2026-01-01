'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCity } from '@/contexts/CityContext';
import { cities, cityToSlug } from '@/utils/cityUtils';

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
        // Navigate to the selected city's page
        const citySlug = cityToSlug(city.name);
        router.push(`/${citySlug}`);
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
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors border border-white/30"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium text-white text-sm">
                                {selectedCity ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-xs font-bold">{selectedCity.code}</span>
                                        <span className="hidden sm:inline">{selectedCity.name}</span>
                                    </span>
                                ) : (
                                    'Şehir Seç'
                                )}
                            </span>
                            <svg className={`w-4 h-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                {/* Search */}
                                <div className="p-3 border-b border-slate-100">
                                    <input
                                        type="text"
                                        placeholder="Şehir ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EB0EF]/50"
                                        autoFocus
                                    />
                                </div>

                                {/* Cities List */}
                                <div className="max-h-64 overflow-y-auto">
                                    {filteredCities.map((city) => (
                                        <button
                                            key={city.code}
                                            onClick={() => handleCitySelect(city)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${selectedCity?.code === city.code ? 'bg-[#5EB0EF]/5' : ''
                                                }`}
                                        >
                                            <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${selectedCity?.code === city.code
                                                ? 'bg-[#5EB0EF] text-white'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {city.code}
                                            </span>
                                            <span className="font-medium text-slate-700">{city.name}</span>
                                            {selectedCity?.code === city.code && (
                                                <svg className="w-5 h-5 text-[#5EB0EF] ml-auto" fill="currentColor" viewBox="0 0 20 20">
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
