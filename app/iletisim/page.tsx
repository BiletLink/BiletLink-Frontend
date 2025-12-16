'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function IletisimPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        İletişim
                    </h1>
                    <p className="text-xl text-white/80">
                        Bizimle iletişime geçin
                    </p>
                </div>
            </section>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Bize Ulaşın</h2>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">E-posta</h3>
                                    <p className="text-slate-600 mt-1">
                                        Genel sorular ve destek için:
                                        <a href="mailto:info@biletlink.co" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                                            info@biletlink.co
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Partnerlik</h3>
                                    <p className="text-slate-600 mt-1">
                                        İş birliği ve partnerlik fırsatları için:
                                        <a href="mailto:partners@biletlink.co" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                                            partners@biletlink.co
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Sıkça Sorulan Sorular</h2>
                        <p className="text-slate-600 mb-4">
                            Hızlı yanıtlar için <a href="/sss" className="text-blue-600 hover:underline">Sıkça Sorulan Sorular</a> sayfamızı ziyaret edebilirsiniz.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
