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
}

const categories: Category[] = [
    {
        id: 'konser',
        name: 'Konser',
        emoji: '🎤',
        color: 'from-purple-500 to-pink-500',
        subCategories: ['Pop', 'Rock', 'Jazz', 'Klasik Müzik', 'Hip Hop', 'Türkçe Pop', 'Arabesk', 'Elektronik']
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
        emoji: '🎙️',
        color: 'from-orange-500 to-amber-500',
        subCategories: ['Tek Kişilik', 'Grup Gösterisi', 'Doğaçlama']
    },
    {
        id: 'spor',
        name: 'Spor',
        emoji: '⚽',
        color: 'from-green-500 to-emerald-500',
        subCategories: ['Futbol', 'Basketbol', 'Voleybol', 'Tenis', 'E-Spor']
    },
    {
        id: 'festival',
        name: 'Festival',
        emoji: '🎉',
        color: 'from-yellow-500 to-orange-500',
        subCategories: ['Müzik Festivali', 'Film Festivali', 'Kültür Festivali']
    },
    {
        id: 'muzikal',
        name: 'Müzikal',
        emoji: '🎹',
        color: 'from-blue-500 to-cyan-500',
        subCategories: ['Broadway', 'Klasik', 'Modern']
    },
    {
        id: 'opera-bale',
        name: 'Opera & Bale',
        emoji: '🩰',
        color: 'from-pink-500 to-rose-500',
        subCategories: ['Opera', 'Bale', 'Modern Dans']
    },
    {
        id: 'aile',
        name: 'Aile & Çocuk',
        emoji: '👨‍👩‍👧',
        color: 'from-teal-500 to-green-500',
        subCategories: ['Çocuk Gösterisi', 'Sirk', 'Kukla']
    }
];

export default function CategoriesPage() {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        🎫 Kategoriler
                    </h1>
                    <p className="text-lg text-white/80">
                        İlgi alanına göre etkinlikleri keşfet
                    </p>
                </div>
            </section>

            {/* Categories List - Clean & Simple */}
            <section className="py-8 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                {/* Category Header - Always Visible */}
                                <div className="flex items-center">
                                    <Link
                                        href={`/?category=${encodeURIComponent(category.name)}`}
                                        className={`flex-1 flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                            <span className="text-2xl">{category.emoji}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-lg">{category.name}</h3>
                                            <p className="text-sm text-slate-500">{category.subCategories.length} alt kategori</p>
                                        </div>
                                    </Link>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="p-4 hover:bg-slate-100 transition-colors border-l border-slate-100"
                                        aria-label="Alt kategorileri göster"
                                    >
                                        <svg
                                            className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Sub Categories - Expandable */}
                                {expandedCategory === category.id && (
                                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50">
                                        <div className="flex flex-wrap gap-2">
                                            {category.subCategories.map((sub) => (
                                                <Link
                                                    key={sub}
                                                    href={`/?category=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`}
                                                    className="px-3 py-1.5 bg-white rounded-full text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <Link
                        href="/etkinlikler"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
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
