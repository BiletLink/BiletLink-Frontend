'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SSSPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Sıkça Sorulan Sorular
                    </h1>
                    <p className="text-xl text-white/80">
                        Aklınıza takılan soruların yanıtları
                    </p>
                </div>
            </section>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="space-y-6">
                    {/* Soru 1 */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">BiletLink nedir?</h3>
                        <p className="text-slate-600">
                            BiletLink, farklı biletleme platformlarındaki (Biletix, Bubilet vb.) etkinlikleri tek bir çatı altında toplayan ve kullanıcıların etkinlikleri kolayca keşfetmesini sağlayan bir arama motoru ve karşılaştırma platformudur.
                        </p>
                    </div>

                    {/* Soru 2 */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Biletleri doğrudan sizden mi alıyorum?</h3>
                        <p className="text-slate-600">
                            Hayır, BiletLink bir bilet satış platformu değildir. Biz sizi, seçtiğiniz etkinliğin resmi bilet satış sitesine (örneğin Biletix'e) yönlendiririz. Ödeme ve biletleme işlemi ilgili platform üzerinden gerçekleşir.
                        </p>
                    </div>

                    {/* Soru 3 */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">BiletLink kullanmak ücretli mi?</h3>
                        <p className="text-slate-600">
                            Hayır, BiletLink kullanıcılar için tamamen ücretsizdir. Etkinlik aramak ve listelemek için herhangi bir ücret ödemezsiniz.
                        </p>
                    </div>

                    {/* Soru 4 */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Aradığım etkinliği bulamıyorum, ne yapmalıyım?</h3>
                        <p className="text-slate-600">
                            Veritabanımız sürekli güncellenmektedir ancak bazı etkinlikler henüz sistemimize düşmemiş olabilir. Eğer spesifik bir etkinlik arıyorsanız ve bulamıyorsanız, İletişim sayfasından bize bildirebilirsiniz.
                        </p>
                    </div>

                    {/* Soru 5 */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Etkinlik bilgilerinde hata var, nasıl bildirebilirim?</h3>
                        <p className="text-slate-600">
                            Gördüğünüz hatalı bilgileri `info@biletlink.co` adresine e-posta göndererek bize iletebilirsiniz. Geri bildirimleriniz platformumuzu geliştirmemize yardımcı olur.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
