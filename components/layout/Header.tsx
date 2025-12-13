'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useCity } from '@/contexts/CityContext';

export default function Header() {
    const { selectedCity, setSelectedCity, cities } = useCity();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                            <span className="text-white font-bold text-xl">🎫</span>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">BiletLink</span>
                    </Link>

                    {/* City Selector - Biletix/Bubilet Style */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium text-slate-700">{selectedCity}</span>
                            <svg className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
                                {cities.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2 ${selectedCity === city ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'
                                            }`}
                                    >
                                        {selectedCity === city && (
                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span className={selectedCity !== city ? 'ml-6' : ''}>{city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <input
                            type="search"
                            placeholder="Etkinlik, sanatçı veya mekan ara..."
                            className="w-full px-6 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        <Link href="/etkinlikler" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                            Etkinlikler
                        </Link>
                        <Link href="/kategoriler" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                            Kategoriler
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <div className="flex items-center space-x-4">
                        <button className="hidden sm:block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                            Kayıt Ol
                        </button>
                        <button className="sm:hidden p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
