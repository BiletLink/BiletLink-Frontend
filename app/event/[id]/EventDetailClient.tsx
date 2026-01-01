'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ShareButton from '@/components/event/ShareButton';
import { cityToSlug } from '@/utils/cityUtils';

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
    platforms: { platform: string; title?: string; price?: number; url?: string; }[];
}

export default function EventDetailClient({ initialEvent }: { initialEvent?: EventDetail | null }) {
    const params = useParams();
    const [event, setEvent] = useState<EventDetail | null>(initialEvent || null);
    const [loading, setLoading] = useState(!initialEvent);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialEvent && params.id) {
            fetchEventDetail(params.id as string);
        }
        if (params.id) {
            trackView(params.id as string);
        }
    }, [params.id, initialEvent]);

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

    // Group sessions by date - show each workshop/product separately (only merge if same platform AND same title)
    const getGroupedSessions = (): GroupedSession[] => {
        if (!event?.ticketOptions) return [];
        const sessionMap = new Map<string, GroupedSession>();

        event.ticketOptions.forEach(option => {
            const title = option.platformTitle || option.platform;

            // If has sessions
            if (option.sessions.length > 0) {
                option.sessions.forEach(session => {
                    const dateKey = session.sessionDate;
                    if (!sessionMap.has(dateKey)) {
                        sessionMap.set(dateKey, { sessionDate: session.sessionDate, venueName: session.venueName, platforms: [] });
                    }
                    const group = sessionMap.get(dateKey)!;
                    const price = session.minPrice || option.prices[0]?.price;
                    const url = session.performanceUrl || option.prices[0]?.affiliateUrl || option.prices[0]?.url || option.eventUrl;

                    // Only merge if BOTH platform AND title match (same product from same source)
                    const existingPlatform = group.platforms.find(p => p.platform === option.platform && p.title === title);
                    if (existingPlatform) {
                        // Keep the lower price for same product
                        if (price && (!existingPlatform.price || price < existingPlatform.price)) {
                            existingPlatform.price = price;
                            existingPlatform.url = url;
                        }
                    } else {
                        // Add as new entry (different workshop/product)
                        group.platforms.push({ platform: option.platform, title, price, url });
                    }
                });
            } else if (option.prices.length > 0) {
                // Fallback: use event date if no sessions
                const dateKey = event.date;
                if (!sessionMap.has(dateKey)) {
                    sessionMap.set(dateKey, { sessionDate: event.date, platforms: [] });
                }
                const group = sessionMap.get(dateKey)!;
                const price = option.prices[0]?.price;
                const url = option.prices[0]?.affiliateUrl || option.prices[0]?.url || option.eventUrl;

                const existingPlatform = group.platforms.find(p => p.platform === option.platform && p.title === title);
                if (existingPlatform) {
                    if (price && (!existingPlatform.price || price < existingPlatform.price)) {
                        existingPlatform.price = price;
                        existingPlatform.url = url;
                    }
                } else {
                    group.platforms.push({ platform: option.platform, title, price, url });
                }
            }
        });

        // Sort platforms by price within each group
        sessionMap.forEach(group => {
            group.platforms.sort((a, b) => (a.price || 0) - (b.price || 0));
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
                    <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
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
                    <Link href="/" className="text-indigo-600 hover:underline">← Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
                {event.imageUrl ? (
                    <>
                        {/* Background Image with Blur */}
                        <div className="absolute inset-0">
                            <img
                                src={event.imageUrl}
                                alt={event.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900"></div>
                )}

                <div className="absolute inset-0 flex items-end pb-12 md:pb-20 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end gap-8 md:gap-12">
                        {/* Poster Card */}
                        <div className="hidden md:block w-64 h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0 relative group">
                            {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-6xl">🎭</div>
                            )}
                            <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl pointer-events-none"></div>
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 space-y-4 md:space-y-6 text-white drop-shadow-lg">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide uppercase text-indigo-100 shadow-sm">
                                        {event.category}
                                    </span>
                                    <ShareButton
                                        eventName={event.name}
                                        eventUrl={`/${cityToSlug(event.venue?.city || 'etkinlik')}/${cityToSlug(event.category || 'etkinlik')}/${event.slug || event.id}`}
                                    />
                                </div>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tight-tracking">
                                    {event.name}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-lg md:text-xl font-medium text-white/90">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 bg-white/10 rounded-lg backdrop-blur text-xl">📅</span>
                                    <span>{formatDate(event.date)}</span>
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 bg-white/10 rounded-lg backdrop-blur text-xl">⏰</span>
                                    <span>{formatTime(event.date)}</span>
                                </div>
                                {event.venue && (
                                    <>
                                        <div className="hidden md:block w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-white/10 rounded-lg backdrop-blur text-xl">📍</span>
                                            <span>{event.venue.name}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Price Tag (Hero) */}
                        <div className="hidden lg:block mb-2">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl text-center min-w-[180px]">
                                <div className="text-sm font-medium text-indigo-200 uppercase tracking-wider mb-1">Başlayan Fiyatlarla</div>
                                <div className="text-4xl font-black text-white">{formatPrice(cheapestPrice || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Details + Tickets) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Event Details Card */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">📋</span>
                                <h2 className="text-xl font-bold text-gray-800">Etkinlik Hakkında</h2>
                            </div>
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Tarih</div>
                                        <div className="text-lg font-bold text-gray-900">{formatDate(event.date)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Saat</div>
                                        <div className="text-lg font-bold text-gray-900">{formatTime(event.date)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Mekan</div>
                                        <div className="text-lg font-bold text-gray-900">{event.venue?.name}</div>
                                        <div className="text-sm text-gray-500">{event.venue?.city}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wider">Kategori</div>
                                        <div className="text-lg font-bold text-gray-900">{event.category || '-'}</div>
                                    </div>
                                </div>
                                {event.description && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wider">Açıklama</div>
                                        <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
                                            {event.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ticket Options */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 md:px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="bg-white/20 text-white p-2 rounded-xl backdrop-blur">🎟️</span>
                                    <h2 className="text-xl font-bold text-white">Bilet Seçenekleri</h2>
                                </div>
                                <div className="hidden sm:block text-indigo-100 text-sm font-medium">
                                    {groupedSessions.length} seans bulundu
                                </div>
                            </div>

                            <div className="p-6 md:p-8 space-y-4 bg-gray-50/50">
                                {groupedSessions.length > 0 ? (
                                    groupedSessions.map((group, idx) => {
                                        const dateInfo = formatSessionDate(group.sessionDate);
                                        const cheapest = group.platforms.reduce((min, p) =>
                                            (p.price && (!min.price || p.price < min.price)) ? p : min
                                            , group.platforms[0]);

                                        return (
                                            <div key={idx} className="bg-white border text-gray-600 border-gray-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 group">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    {/* Date & Info */}
                                                    <div className="flex items-start gap-5">
                                                        <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 min-w-[90px] text-center">
                                                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{dateInfo.date.split(' ')[2]}</div>
                                                            <div className="text-2xl font-black text-indigo-600 leading-none mb-1">{dateInfo.date.split(' ')[0]}</div>
                                                            <div className="text-sm font-semibold text-indigo-700/80">{dateInfo.date.split(' ')[1]}</div>
                                                        </div>
                                                        <div className="pt-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                                    {dateInfo.time}
                                                                </span>
                                                            </div>
                                                            <div className="font-bold text-gray-900 text-lg mb-0.5">{group.venueName || event.venue?.name}</div>
                                                            <div className="text-sm text-gray-500 font-medium">{event.venue?.city}</div>
                                                        </div>
                                                    </div>

                                                    {/* Platforms */}
                                                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                                        {group.platforms.map((p, pIdx) => {
                                                            const style = getPlatformStyle(p.platform);
                                                            const isCheapest = p === cheapest && group.platforms.length > 1;

                                                            return (
                                                                <a key={pIdx} href={p.url} target="_blank" rel="noopener noreferrer"
                                                                    onClick={() => trackClick(event.id, p.platform)}
                                                                    className={`relative flex flex-col items-center justify-center px-5 py-3 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                                                                        ${isCheapest ? 'border-green-400 bg-green-50/30' : 'border-gray-100 bg-gray-50 hover:bg-white'}`}
                                                                >
                                                                    {isCheapest && (
                                                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap z-10">
                                                                            EN UCUZ
                                                                        </span>
                                                                    )}
                                                                    <span className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${style.text}`}>{p.platform}</span>
                                                                    <span className="font-extrabold text-gray-900 text-lg">{p.price ? formatPrice(p.price) : '-'}</span>
                                                                </a>
                                                            );
                                                        })}

                                                        {/* Primary CTA */}
                                                        {cheapest.url && (
                                                            <a href={cheapest.url} target="_blank" rel="noopener noreferrer"
                                                                onClick={() => trackClick(event.id, cheapest.platform)}
                                                                className="ml-2 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-gray-900/20 active:scale-95 flex items-center gap-2"
                                                            >
                                                                Satın Al
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <div className="text-5xl mb-4 grayscale opacity-50">🎫</div>
                                        <p className="font-medium text-lg">Bu etkinlik için bilet bilgisi bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Artist Card */}
                        {event.artist && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden group">
                                <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white z-10 transition-transform duration-500 group-hover:scale-110">
                                        {event.artist.imageUrl ? (
                                            <img src={event.artist.imageUrl} alt={event.artist.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">🎤</div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-12 pb-6 px-6 text-center">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{event.artist.name}</h3>
                                    <div className="w-12 h-1 bg-indigo-500 rounded-full mx-auto mb-4 opacity-50"></div>
                                    <Link href={`/sanatci/${event.artist.slug || event.artist.id}`}
                                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition-colors"
                                    >
                                        Tüm Etkinlikleri
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Venue (Small) */}
                        {event.venue && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-4 text-gray-400">
                                        <span className="bg-gray-100 p-2 rounded-lg text-xl">📍</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Mekan Bilgisi</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.venue.name}</h3>
                                    <p className="text-gray-500 font-medium mb-6">{event.venue.city} {event.venue.address ? `• ${event.venue.address}` : ''}</p>
                                    <Link href={`/mekan/${event.venue.slug || event.venue.id}`}
                                        className="block text-center w-full py-3 border-2 border-gray-100 hover:border-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                                    >
                                        Mekan Detayları
                                    </Link>
                                </div>
                                {/* Map Background Decoration */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                            </div>
                        )}

                        {/* Mobile Sticky Price Bar (Bottom) */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 font-medium uppercase">Başlayan Fiyatlar</div>
                                    <div className="text-2xl font-black text-indigo-600">{formatPrice(cheapestPrice || 0)}</div>
                                </div>
                                {groupedSessions[0]?.platforms[0]?.url && (
                                    <a href={groupedSessions[0].platforms.reduce((min, p) =>
                                        (p.price && (!min.price || p.price < min.price)) ? p : min
                                        , groupedSessions[0].platforms[0]).url}
                                        target="_blank" rel="noopener noreferrer"
                                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex-1 text-center"
                                    >
                                        Hemen Al
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-12 pb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors group">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </span>
                        Tüm Etkinliklere Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
