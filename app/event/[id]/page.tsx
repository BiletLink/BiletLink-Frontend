'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';

interface TicketOption {
    platform: string;
    platformTitle: string;
    eventUrl?: string;
    sourceLogo?: string;
    brandColor?: string;
    isVip: boolean;
    isDinnerIncluded: boolean;
    isAvailable: boolean;
    prices: {
        price: number;
        currency: string;
        url?: string;
        affiliateUrl?: string;
    }[];
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
    artist?: {
        id: string;
        name: string;
        slug?: string;
        imageUrl?: string;
    };
    venue?: {
        id: string;
        name: string;
        slug?: string;
        city: string;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
}

export default function EventDetailPage() {
    const params = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchEventDetail(params.id as string);
            // Track page view
            trackView(params.id as string);
        }
    }, [params.id]);

    const trackView = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/analytics/track/view/${id}`, { method: 'POST' });
        } catch (e) {
            // Silently fail - analytics shouldn't break the page
        }
    };

    const trackClick = async (id: string, source: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/analytics/track/click/${id}?source=${source}`, { method: 'POST' });
        } catch (e) {
            // Silently fail
        }
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
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return price > 0 ? `${price.toFixed(0)}₺` : 'Ücretsiz';
    };

    const getPlatformColor = (platform: string) => {
        const colors: Record<string, string> = {
            'Biletix': 'bg-orange-500 hover:bg-orange-600',
            'Bubilet': 'bg-purple-500 hover:bg-purple-600',
        };
        return colors[platform] || 'bg-blue-500 hover:bg-blue-600';
    };

    const getPlatformLogo = (platform: string) => {
        switch (platform) {
            case 'Biletix': return '🎫';
            case 'Bubilet': return '🎭';
            default: return '🎟️';
        }
    };

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
                    <Link href="/" className="text-blue-600 hover:underline">
                        ← Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Image */}
            <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-40"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-6xl mx-auto">
                        <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                            {event.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                            {event.name}
                        </h1>
                        <p className="text-xl text-white/80">
                            📅 {formatDate(event.date)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Etkinlik Hakkında</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {event.description || 'Bu etkinlik için açıklama bulunmamaktadır.'}
                            </p>
                        </div>

                        {/* Venue Info */}
                        {event.venue && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Mekan</h2>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                        🏛️
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{event.venue.name}</h3>
                                        <p className="text-gray-500">{event.venue.city}</p>
                                        {event.venue.address && (
                                            <p className="text-gray-400 text-sm mt-1">{event.venue.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Artist Info */}
                        {event.artist && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">🎤 Sanatçı</h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {event.artist.imageUrl ? (
                                            <img src={event.artist.imageUrl} alt={event.artist.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl">🎤</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{event.artist.name}</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Ticket Prices */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">🎟️ Bilet Fiyatları</h2>
                            <p className="text-gray-500 text-sm mb-6">En iyi fiyatları karşılaştırın</p>

                            {event.ticketOptions && event.ticketOptions.length > 0 ? (
                                <div className="space-y-3">
                                    {event.ticketOptions
                                        .filter(opt => opt.prices.length > 0)
                                        .sort((a, b) => (a.prices[0]?.price || 0) - (b.prices[0]?.price || 0))
                                        .map((ticket, index) => (
                                            <a
                                                key={index}
                                                href={ticket.prices[0]?.affiliateUrl || ticket.prices[0]?.url || ticket.eventUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => trackClick(event.id, ticket.platform)}
                                                className={`flex items-center justify-between p-4 rounded-xl text-white transition-all transform hover:scale-102 ${getPlatformColor(ticket.platform)} ${index === 0 ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                                                style={ticket.brandColor ? { backgroundColor: ticket.brandColor } : {}}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getPlatformLogo(ticket.platform)}</span>
                                                    <div>
                                                        <div className="font-semibold">{ticket.platform}</div>
                                                        {ticket.isVip && <span className="text-xs bg-yellow-400 text-black px-2 rounded mr-1">VIP</span>}
                                                        {ticket.isDinnerIncluded && <span className="text-xs bg-orange-400 text-black px-2 rounded">Yemekli</span>}
                                                        {index === 0 && (
                                                            <div className="text-xs opacity-80">✨ En Ucuz</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{formatPrice(ticket.prices[0]?.price || 0)}</div>
                                                    <div className="text-xs opacity-80">Satın Al →</div>
                                                </div>
                                            </a>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">😔</div>
                                    <p>Bilet bilgisi bulunamadı</p>
                                </div>
                            )}

                            {/* Min Price Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">En düşük fiyat:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatPrice(event.minPrice || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
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
