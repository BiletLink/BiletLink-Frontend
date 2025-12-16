'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function KullanimSartlariPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Kullanım Şartları
                    </h1>
                    <p className="text-xl text-white/80">
                        Son güncelleme: 16 Aralık 2025
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3>1. Kabul Edilme</h3>
                    <p>
                        BiletLink web sitesini ve hizmetlerini kullanarak, bu Kullanım Şartları'nı kabul etmiş sayılırsınız. Eğer bu şartları kabul etmiyorsanız, lütfen sitemizi kullanmayınız.
                    </p>

                    <h3>2. Hizmetin Tanımı</h3>
                    <p>
                        BiletLink, çeşitli biletleme platformlarındaki etkinlikleri listeleyen bir arama motorudur. BiletLink, bilet satıcısı veya etkinlik organizatörü değildir. Bilet alım işlemleri, yönlendirildiğiniz üçüncü taraf sitelerde gerçekleşir.
                    </p>

                    <h3>3. Sorumluluk Reddi</h3>
                    <p>
                        BiletLink, listelenen etkinliklerin bilgilerinin (tarih, saat, fiyat, mekan vb.) doğruluğunu garanti etmez. Etkinlik iptalleri, ertelemeleri veya değişikliklerinden BiletLink sorumlu tutulamaz. Herhangi bir bilet satın almadan önce, ilgili bilet satış platformundaki bilgileri doğrulamanız gerekmektedir.
                    </p>

                    <h3>4. Fikri Mülkiyet</h3>
                    <p>
                        Web sitemizdeki içerik, tasarım, logo ve yazılımlar BiletLink'in mülkiyetindedir ve telif hakkı yasalarıyla korunmaktadır. İzinsiz kopyalanması veya kullanılması yasaktır.
                    </p>

                    <h3>5. Değişiklikler</h3>
                    <p>
                        BiletLink, bu kullanım şartlarını dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler sitede yayınlandığı andan itibaren geçerli olur.
                    </p>

                    <h3>6. İletişim</h3>
                    <p>
                        Kullanım şartları hakkında sorularınız varsa, <a href="/iletisim" className="text-blue-600 hover:underline">İletişim</a> sayfasından bize ulaşabilirsiniz.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
