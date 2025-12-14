'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Category {
    id: string;
    name: string;
    emoji: string;
    color: string;
    subCategories: string[];
    count?: number;
}

const categories: Category[] = [
    {
        id: 'muzik',
        name: 'Müzik',
        emoji: '🎵',
        color: 'from-purple-500 to-pink-500',
        subCategories: ['Pop', 'Rock', 'Jazz', 'Klasik Müzik', 'Hip Hop / Rap', 'Türk Halk Müziği', 'Türk Sanat Müziği', 'Elektronik']
    },
    {
        id: 'konser',
        name: 'Konser',
        emoji: '🎤',
        color: 'from-violet-500 to-purple-500',
        subCategories: ['Solo Konser', 'Grup Konseri', 'Akustik', 'Canlı Performans']
    },
    {
        id: 'tiyatro',
        name: 'Tiyatro',
        emoji: '🎭',
        color: 'from-rose-500 to-red-500',
        subCategories: ['Dram', 'Komedi', 'Trajedi', 'Müzikli Oyun', 'Çocuk Tiyatrosu']
    },
    {
        id: 'stand-up',
        name: 'Stand-Up',
        emoji: '🎤',
        color: 'from-orange-500 to-amber-500',
        subCategories: ['Tek Kişilik Gösteri', 'Grup Gösterisi', 'Doğaçlama']
    },
    {
        id: 'spor',
        name: 'Spor',
        emoji: '⚽',
        color: 'from-green-500 to-emerald-500',
        subCategories: ['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'E-Spor', 'Boks', 'MMA']
    },
    {
        id: 'festival',
        name: 'Festival',
        emoji: '🎉',
        color: 'from-yellow-500 to-orange-500',
        subCategories: ['Müzik Festivali', 'Film Festivali', 'Kültür Festivali', 'Yemek Festivali']
    },
    {
        id: 'muzikal',
        name: 'Müzikal',
        emoji: '🎹',
        color: 'from-blue-500 to-cyan-500',
        subCategories: ['Broadway', 'Klasik Müzikal', 'Modern Müzikal']
    },
    {
        id: 'opera-bale',
        name: 'Opera & Bale',
        emoji: '🩰',
        color: 'from-pink-500 to-rose-500',
        subCategories: ['Opera', 'Bale', 'Modern Dans', 'Flamenko']
    },
    {
        id: 'aile-cocuk',
        name: 'Aile & Çocuk',
        emoji: '👨‍👩‍👧',
        color: 'from-teal-500 to-green-500',
        subCategories: ['Çocuk Gösterisi', 'Sirk', 'Animasyon', 'Kukla Tiyatrosu']
    },
    {
        id: 'sergi-konferans',
        name: 'Sergi & Konferans',
        emoji: '🎨',
        color: 'from-indigo-500 to-blue-500',
        subCategories: ['Sanat Sergisi', 'Fotoğraf Sergisi', 'Konferans', 'Workshop']
    }
];

export default function CategoriesPage() {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        🎫 Kategoriler
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        İlgi alanına göre etkinlikleri keşfet. Konserlerden tiyatroya, spordan festivallere...
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/?category=${encodeURIComponent(category.name)}`}
                                className="group"
                                onMouseEnter={() => setHoveredCategory(category.id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-6 h-64 flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 text-9xl transform translate-x-8 -translate-y-4">
                                            {category.emoji}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <span className="text-5xl mb-4 block">{category.emoji}</span>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {category.name}
                                        </h3>
                                    </div>

                                    {/* Sub Categories */}
                                    <div className="relative z-10">
                                        <div className={`transition-all duration-300 ${hoveredCategory === category.id ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0'} overflow-hidden`}>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {category.subCategories.slice(0, 4).map((sub) => (
                                                    <span key={sub} className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                                                        {sub}
                                                    </span>
                                                ))}
                                                {category.subCategories.length > 4 && (
                                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                                                        +{category.subCategories.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-white/80 text-sm">
                                            <span>Etkinlikleri Gör</span>
                                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Categories CTA */}
            <section className="py-16 px-4 bg-slate-100">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        Popüler Etkinlikleri Kaçırma! 🔥
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Binlerce etkinlik arasından sana en uygun olanı bul
                    </p>
                    <Link
                        href="/etkinlikler"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Tüm Etkinlikleri Gör
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
