import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EventListItem from '@/components/event/EventListItem';
import { artistService } from '@/services/artistService';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const artist = await artistService.getBySlug(params.slug);

    if (!artist) {
        return {
            title: 'Sanatçı Bulunamadı - BiletLink',
        };
    }

    return {
        title: `${artist.name} Konserleri ve Biletleri - BiletLink`,
        description: `${artist.name} etkinlikleri, konser tarihleri ve bilet fiyatları BiletLink'te. ${artist.upcomingEvents.length} yaklaşan etkinlik.`,
    };
}

export default async function ArtistPage({ params }: Props) {
    const artist = await artistService.getBySlug(params.slug);

    if (!artist) {
        notFound();
    }

    // Background gradient based on genre or default
    const getGradient = (genre?: string) => {
        const map: Record<string, string> = {
            'Rock': 'from-red-900 to-slate-900',
            'Pop': 'from-purple-900 to-slate-900',
            'Rap': 'from-amber-900 to-slate-900',
            'Alternatif': 'from-teal-900 to-slate-900',
            'Cazz': 'from-blue-900 to-slate-900',
            'Elektronik': 'from-indigo-900 to-slate-900',
        };
        return map[artist.genre || ''] || 'from-slate-800 to-slate-950';
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className={`relative w-full h-[400px] bg-gradient-to-b ${getGradient(artist.genre)} flex items-end`}>
                    {/* Background Pattern/Image */}
                    {artist.coverImageUrl && (
                        <div className="absolute inset-0 opacity-40">
                            <Image
                                src={`http://localhost:5050/api/images/proxy?url=${encodeURIComponent(artist.coverImageUrl)}`}
                                alt={artist.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                        </div>
                    )}

                    <div className="container mx-auto px-4 pb-12 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Profile Image */}
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden relative shrink-0">
                            {artist.imageUrl ? (
                                <Image
                                    src={`http://localhost:5050/api/images/proxy?url=${encodeURIComponent(artist.imageUrl)}`}
                                    alt={artist.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-4xl">
                                    🎤
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left text-white flex-1">
                            {artist.genre && (
                                <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-3">
                                    {artist.genre}
                                </span>
                            )}
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white">{artist.name}</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300">
                                {artist.eventCount > 0 && (
                                    <span className="flex items-center gap-2">
                                        🎫 <strong>{artist.upcomingEvents.length}</strong> yaklaşan etkinlik
                                    </span>
                                )}
                                {artist.spotifyUrl && (
                                    <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                                        Spotify
                                    </a>
                                )}
                                {artist.instagramHandle && (
                                    <a href={`https://instagram.com/${artist.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                                        @{artist.instagramHandle}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    {/* Bio Section - Full Width Top */}
                    {artist.bio && (
                        <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                                ✨ Hakkında
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed relative z-10">
                                <p className="whitespace-pre-line">{artist.bio}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Events */}
                        <div className="lg:col-span-3 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    🗓️ Etkinlik Takvimi
                                </h2>

                                {artist.upcomingEvents.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {artist.upcomingEvents.map(event => (
                                            <EventListItem
                                                key={event.id}
                                                id={event.id}
                                                name={event.name}
                                                slug={null}
                                                date={event.date}
                                                imageUrl={event.imageUrl}
                                                venueName={event.venueName}
                                                venueCity={event.venueCity}
                                                minPrice={event.minPrice}
                                                category={artist.genre || 'Konser'}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                        <div className="text-4xl mb-4">😔</div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Henüz Planlanmış Etkinlik Yok</h3>
                                        <p className="text-slate-500">
                                            Bu sanatçı için şu an aktif bir bilet satışı bulunmuyor. Takipte kalın!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
