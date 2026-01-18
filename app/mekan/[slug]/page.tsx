import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventListItem from '@/components/event/EventListItem';
import { venueService } from '@/services/venueService';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const venue = await venueService.getBySlug(params.slug);

    if (!venue) {
        return {
            title: 'Mekan Bulunamadı - BiletLink',
        };
    }

    return {
        title: `${venue.name} - Etkinlikler, Adres ve Biletler | BiletLink`,
        description: `${venue.name} (${venue.city}) etkinlik takvimi, adres bilgileri ve ulaşım detayları. ${venue.upcomingEvents.length} yaklaşan etkinlik.`,
    };
}

export default async function VenuePage({ params }: Props) {
    const venue = await venueService.getBySlug(params.slug);

    if (!venue) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative w-full h-[350px] bg-slate-900 overflow-hidden">
                    {venue.imageUrl ? (
                        <>
                            <Image
                                src={`http://localhost:5050/api/images/proxy?url=${encodeURIComponent(venue.imageUrl)}`}
                                alt={venue.name}
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                    )}

                    <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                                        📍 {venue.city} {venue.district ? `• ${venue.district}` : ''}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{venue.name}</h1>
                                <p className="text-slate-300 max-w-2xl text-sm md:text-base opacity-90">
                                    {venue.address}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.city}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2"
                                >
                                    🗺️ Yol Tarifi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Content: Events */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    🎪 Mekandaki Etkinlikler
                                </h2>

                                {venue.upcomingEvents.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {venue.upcomingEvents.map(event => (
                                            <EventListItem
                                                key={event.id}
                                                id={event.id}
                                                name={event.name}
                                                slug={null}
                                                date={event.date}
                                                imageUrl={event.imageUrl}
                                                venueName={venue.name}
                                                venueCity={venue.city}
                                                minPrice={event.minPrice}
                                                category={event.category}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                        <div className="text-4xl mb-4">🌙</div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Etkinlik Bulunamadı</h3>
                                        <p className="text-slate-500">
                                            Şu an bu mekanda planlanmış bir etkinlik görünmüyor.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar: Details */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 divide-y divide-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg">Mekan Bilgileri</h3>

                                {venue.capacity && (
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Kapasite</span>
                                        <span className="font-medium text-slate-900">{venue.capacity.toLocaleString()} Kişi</span>
                                    </div>
                                )}

                                {venue.phoneNumber && (
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Telefon</span>
                                        <a href={`tel:${venue.phoneNumber}`} className="font-medium text-blue-600 hover:underline">
                                            {venue.phoneNumber}
                                        </a>
                                    </div>
                                )}

                                {venue.websiteUrl && (
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Web Sitesi</span>
                                        <a href={venue.websiteUrl} target="_blank" rel="nofollow" className="font-medium text-blue-600 hover:underline truncate max-w-[150px]">
                                            Ziyaret Et ↗
                                        </a>
                                    </div>
                                )}
                            </div>

                            {venue.description && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-4 text-lg">Hakkında</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {venue.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
