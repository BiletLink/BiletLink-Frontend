'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useCity } from '@/contexts/CityContext';
import { cities } from '@/utils/cityUtils';

export default function Header() {
    const { selectedCity, setSelectedCity } = useCity();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
                setSearchQuery('');
            }
        }
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus search input when modal opens
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isModalOpen]);

    // Filter cities by search (name or plate code)
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.code.includes(searchQuery)
    );

    return (
        <>
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

                        {/* City Selector Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium text-slate-700">
                                {selectedCity ? (
                                    <span className="flex items-center gap-1">
                                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold">{selectedCity.code}</span>
                                        {selectedCity.name}
                                    </span>
                                ) : (
                                    'Tüm Şehirler'
                                )}
                            </span>
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

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
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="sm:hidden p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top">
                    <div className="px-4 py-4 space-y-3">
                        {/* Search */}
                        <input
                            type="search"
                            placeholder="Etkinlik, sanatçı veya mekan ara..."
                            className="w-full px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />

                        {/* Navigation Links */}
                        <nav className="space-y-1">
                            <Link
                                href="/etkinlikler"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xl">🎫</span>
                                <span className="font-medium text-slate-700">Tüm Etkinlikler</span>
                            </Link>
                            <Link
                                href="/kategoriler"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xl">📂</span>
                                <span className="font-medium text-slate-700">Kategoriler</span>
                            </Link>
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xl">📍</span>
                                <span className="font-medium text-slate-700">
                                    {selectedCity ? `${selectedCity.name} (${selectedCity.code})` : 'Şehir Seç'}
                                </span>
                            </button>
                        </nav>

                        {/* Quick Categories */}
                        <div className="pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-2 px-4">Popüler Kategoriler</p>
                            <div className="flex flex-wrap gap-2 px-4">
                                {['Konser', 'Tiyatro', 'Stand-Up', 'Spor'].map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/?category=${cat}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-3">
                            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium">
                                Kayıt Ol
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* City Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4 animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    📍 Şehir Seçin
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); setSearchQuery(''); }}
                                    className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Şehir adı veya plaka kodu ile ara... (örn: 34, İstanbul)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3 pl-12 rounded-xl bg-white/20 backdrop-blur text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Cities Grid */}
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            {/* "Tüm Şehirler" Option */}
                            <button
                                onClick={() => {
                                    setSelectedCity(null);
                                    setIsModalOpen(false);
                                    setSearchQuery('');
                                }}
                                className={`w-full mb-4 p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedCity === null
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    🇹🇷
                                </span>
                                <span className="font-semibold">Tüm Şehirler</span>
                                {selectedCity === null && (
                                    <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>

                            {/* Cities List */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.code}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setIsModalOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-left ${selectedCity?.code === city.code
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedCity?.code === city.code
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {city.code}
                                        </span>
                                        <span className="font-medium text-sm truncate">{city.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* No results */}
                            {filteredCities.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p>"{searchQuery}" için sonuç bulunamadı</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
