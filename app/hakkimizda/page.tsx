'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HakkimizdaPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Hakkımızda
                    </h1>
                    <p className="text-xl text-white/80">
                        BiletLink - Tüm Etkinlikler Tek Platformda
                    </p>
                </div>
            </section>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">BiletLink Nedir?</h2>
                    <p className="text-slate-600 mb-6">
                        BiletLink, Türkiye'deki tüm etkinlik biletlerini tek bir platformda toplayan
                        bir bilet karşılaştırma ve keşif platformudur. Konserlerden tiyatro oyunlarına,
                        spor müsabakalarından stand-up gösterilerine kadar binlerce etkinliği
                        kolayca keşfedebilir ve en uygun fiyatları karşılaştırabilirsiniz.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Misyonumuz</h2>
                    <p className="text-slate-600 mb-6">
                        Etkinlik severlerin hayatını kolaylaştırmak. Farklı platformlardaki
                        etkinlikleri tek bir yerden görüntüleyerek zaman kazandırmak ve
                        en iyi fiyatları bulmalarına yardımcı olmak.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mb-4">İletişim</h2>
                    <p className="text-slate-600">
                        Sorularınız için bize ulaşabilirsiniz: info@biletlink.co
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
