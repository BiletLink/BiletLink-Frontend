'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';

interface Session {
    id: string;
    sessionDate: string;
    venueName?: string;
    minPrice?: number;
    performanceUrl?: string;
    isAvailable: boolean;
}

interface TicketOption {
    platform: string;
    platformTitle: string;
    eventUrl?: string;
    sourceLogo?: string;
    brandColor?: string;
    isVip: boolean;
    isDinnerIncluded: boolean;
    isAvailable: boolean;
    prices: { price: number; currency: string; url?: string; affiliateUrl?: string; }[];
    sessions: Session[];
}

interface EventDetail {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    date: string;
    imageUrl?: string | null;
    category?: string;
    minPrice?: number | null;
    viewCount?: number;
    ticketOptions: TicketOption[];
    artist?: { id: string; name: string; slug?: string; imageUrl?: string; };
    venue?: { id: string; name: string; slug?: string; city: string; address?: string; };
}

interface GroupedSession {
    sessionDate: string;
    venueName?: string;
    platforms: { platform: string; price?: number; url?: string; }[];
}

export default function EventDetailPage() {
    const params = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchEventDetail(params.id as string);
            trackView(params.id as string);
        }
    }, [params.id]);

    const trackView = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/analytics/track/view/${id}`, { method: 'POST' });
        } catch (e) { }
    };

    const trackClick = async (id: string, source: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/analytics/track/click/${id}?source=${source}`, { method: 'POST' });
        } catch (e) { }
    };

    const fetchEventDetail = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/master-events/${id}`);
            if (!response.ok) throw new Error('Event not found');
            const data = await response.json();
            setEvent(data);
        } catch (err) {
            setError('Etkinlik bulunamadı');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatSessionDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' }),
            time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const formatPrice = (price: number) => price > 0 ? `${price.toFixed(0)}₺` : 'Ücretsiz';

    const getPlatformStyle = (platform: string) => {
        const styles: Record<string, { bg: string; border: string; text: string }> = {
            'Biletix': { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600' },
            'Bubilet': { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600' },
        };
        return styles[platform] || { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-600' };
    };

    // Group sessions by date for comparison
    const getGroupedSessions = (): GroupedSession[] => {
        if (!event?.ticketOptions) return [];
        const sessionMap = new Map<string, GroupedSession>();

        event.ticketOptions.forEach(option => {
            // If has sessions
            if (option.sessions.length > 0) {
                option.sessions.forEach(session => {
                    const key = session.sessionDate;
                    if (!sessionMap.has(key)) {
                        sessionMap.set(key, { sessionDate: session.sessionDate, venueName: session.venueName, platforms: [] });
                    }
                    const group = sessionMap.get(key)!;
                    group.platforms.push({
                        platform: option.platform,
                        price: session.minPrice || option.prices[0]?.price,
                        url: session.performanceUrl || option.prices[0]?.affiliateUrl || option.prices[0]?.url || option.eventUrl
                    });
                });
            } else if (option.prices.length > 0) {
                // Fallback: use event date if no sessions
                const key = event.date;
                if (!sessionMap.has(key)) {
                    sessionMap.set(key, { sessionDate: event.date, platforms: [] });
                }
                sessionMap.get(key)!.platforms.push({
                    platform: option.platform,
                    price: option.prices[0]?.price,
                    url: option.prices[0]?.affiliateUrl || option.prices[0]?.url || option.eventUrl
                });
            }
        });

        return Array.from(sessionMap.values()).sort((a, b) =>
            new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
        );
    };

    const groupedSessions = event ? getGroupedSessions() : [];
    const cheapestPrice = event?.minPrice || (groupedSessions[0]?.platforms[0]?.price);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
                    <Link href="/" className="text-blue-600 hover:underline">← Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            {/* Hero Section - Event Image & Basic Info */}
            <div className="relative h-72 md:h-80 bg-gradient-to-br from-blue-600 to-purple-700">
                {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.name} referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="max-w-6xl mx-auto flex items-end gap-6">
                        {/* Event Poster */}
                        <div className="hidden md:block w-40 h-56 rounded-lg overflow-hidden shadow-xl border-4 border-white bg-white flex-shrink-0">
                            {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">🎭</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm mb-2">
                                {event.category}
                            </span>
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">{event.name}</h1>
                            <p className="text-white/80">📅 {formatDate(event.date)} • {formatTime(event.date)}</p>
                            {event.venue && (
                                <p className="text-white/70 text-sm mt-1">📍 {event.venue.name}, {event.venue.city}</p>
                            )}
                        </div>
                        {/* Price Badge */}
                        <div className="hidden md:block text-right">
                            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                                <div className="text-xs opacity-80">En ucuz</div>
                                <div className="text-2xl font-bold">{formatPrice(cheapestPrice || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN - Tickets & Artist (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* BILET FIYATLARI - Session Cards */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3">
                                <h2 className="text-lg font-bold text-white">🎟️ Bilet Fiyatları</h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {groupedSessions.length > 0 ? (
                                    groupedSessions.map((group, idx) => {
                                        const dateInfo = formatSessionDate(group.sessionDate);
                                        const cheapest = group.platforms.reduce((min, p) =>
                                            (p.price && (!min.price || p.price < min.price)) ? p : min
                                            , group.platforms[0]);

                                        return (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    {/* Date & Venue */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center bg-blue-50 rounded-lg px-3 py-2 min-w-[80px]">
                                                            <div className="text-sm font-bold text-blue-800">{dateInfo.date}</div>
                                                            <div className="text-lg font-bold text-blue-600">{dateInfo.time}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-800">{group.venueName || event.venue?.name}</div>
                                                            <div className="text-sm text-gray-500">{event.venue?.city}</div>
                                                        </div>
                                                    </div>

                                                    {/* Platform Prices */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {group.platforms.map((p, pIdx) => {
                                                            const style = getPlatformStyle(p.platform);
                                                            const isCheapest = p === cheapest && group.platforms.length > 1;

                                                            return (
                                                                <a key={pIdx} href={p.url} target="_blank" rel="noopener noreferrer"
                                                                    onClick={() => trackClick(event.id, p.platform)}
                                                                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all hover:shadow-md ${style.bg} ${style.border} ${isCheapest ? 'ring-2 ring-green-400' : ''}`}
                                                                >
                                                                    {isCheapest && (
                                                                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">✓</span>
                                                                    )}
                                                                    <span className={`font-medium ${style.text}`}>{p.platform}</span>
                                                                    <span className="font-bold text-gray-800">{p.price ? formatPrice(p.price) : '-'}</span>
                                                                </a>
                                                            );
                                                        })}

                                                        {/* Buy Cheapest Button */}
                                                        {cheapest.url && (
                                                            <a href={cheapest.url} target="_blank" rel="noopener noreferrer"
                                                                onClick={() => trackClick(event.id, cheapest.platform)}
                                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                                            >
                                                                Satın Al →
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-3xl mb-2">🎫</div>
                                        <p>Bilet bilgisi bulunamadı</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SANATÇI - Artist Info */}
                        {event.artist && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3">
                                    <h2 className="text-lg font-bold text-white">🎤 Sanatçı</h2>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                            {event.artist.imageUrl ? (
                                                <img src={event.artist.imageUrl} alt={event.artist.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">🎤</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{event.artist.name}</h3>
                                            <p className="text-gray-500 text-sm">Sanatçının diğer etkinlikleri için tıklayın</p>
                                            <Link href={`/sanatci/${event.artist.slug || event.artist.id}`}
                                                className="inline-block mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
                                            >
                                                Tüm Etkinlikleri Gör →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN - Event Details & Venue (1/3) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* ETKİNLİK DETAYLARI */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-5 py-3 border-b">
                                <h2 className="text-lg font-bold text-gray-800">📋 Etkinlik Detayları</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Tarih</div>
                                    <div className="font-medium">{formatDate(event.date)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Saat</div>
                                    <div className="font-medium">{formatTime(event.date)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Kategori</div>
                                    <div className="font-medium">{event.category || '-'}</div>
                                </div>
                                {event.description && (
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">Açıklama</div>
                                        <div className="text-sm text-gray-700">{event.description}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MEKAN */}
                        {event.venue && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-5 py-3 border-b">
                                    <h2 className="text-lg font-bold text-gray-800">📍 Mekan</h2>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 mb-1">{event.venue.name}</h3>
                                    <p className="text-gray-500 text-sm mb-3">{event.venue.city}</p>
                                    {event.venue.address && (
                                        <p className="text-gray-600 text-sm mb-3">{event.venue.address}</p>
                                    )}
                                    <Link href={`/mekan/${event.venue.slug || event.venue.id}`}
                                        className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Bu Mekandaki Diğer Etkinlikler →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Mobile Price CTA */}
                        <div className="md:hidden bg-green-500 text-white rounded-xl p-4 text-center shadow-lg">
                            <div className="text-sm opacity-80 mb-1">En ucuz bilet</div>
                            <div className="text-3xl font-bold mb-2">{formatPrice(cheapestPrice || 0)}</div>
                            {groupedSessions[0]?.platforms[0]?.url && (
                                <a href={groupedSessions[0].platforms.reduce((min, p) =>
                                    (p.price && (!min.price || p.price < min.price)) ? p : min
                                    , groupedSessions[0].platforms[0]).url}
                                    target="_blank" rel="noopener noreferrer"
                                    className="block bg-white text-green-600 font-bold py-2 rounded-lg"
                                >
                                    Hemen Satın Al
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Tüm Etkinliklere Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
