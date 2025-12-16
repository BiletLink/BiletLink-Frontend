'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function GizlilikPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            <section className="relative pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Gizlilik Politikası
                    </h1>
                    <p className="text-xl text-white/80">
                        Verilerinizin güvenliği bizim için önemlidir
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3>1. Veri Toplama</h3>
                    <p>
                        BiletLink, web sitemizi ziyaret ettiğinizde bazı anonim kullanım verilerini (IP adresi, tarayıcı türü vb.) toplayabilir. Bu veriler, hizmet kalitemizi artırmak ve istatistiksel analizler yapmak amacıyla kullanılır.
                    </p>

                    <h3>2. Çerezler (Cookies)</h3>
                    <p>
                        Kullanıcı deneyimini geliştirmek için çerezler kullanmaktayız. Çerezler, tarayıcınız tarafından saklanan küçük metin dosyalarıdır. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman engelleyebilirsiniz ancak bu durum sitenin bazı özelliklerinin çalışmasını etkileyebilir.
                    </p>

                    <h3>3. Üçüncü Taraf Bağlantılar</h3>
                    <p>
                        Web sitemiz, Biletix, Bubilet gibi üçüncü taraf web sitelerine bağlantılar içerir. Bu sitelerin gizlilik uygulamalarından BiletLink sorumlu değildir. Yönlendirildiğiniz sitelerin gizlilik politikalarını incelemenizi öneririz.
                    </p>

                    <h3>4. Kişisel Veriler</h3>
                    <p>
                        BiletLink üzerinden herhangi bir üyelik veya bilet satın alma işlemi yapılmadığı için, kredi kartı bilgileri veya hassas kimlik bilgileri tarafımızca saklanmamaktadır. Bize e-posta yoluyla ulaştığınızda paylaştığınız bilgiler gizli tutulur.
                    </p>

                    <h3>5. Değişiklikler</h3>
                    <p>
                        Gizlilik politikamızda yapılan güncellemeler bu sayfada yayınlanacaktır. Düzenli olarak kontrol etmeniz önerilir.
                    </p>

                    <h3>6. İletişim</h3>
                    <p>
                        Gizlilik politikamızla ilgili sorularınız için <a href="mailto:info@biletlink.co" className="text-blue-600 hover:underline">info@biletlink.co</a> adresinden bize ulaşabilirsiniz.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
