'use client';

import Link from 'next/link';
import { useState } from 'react';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

interface EventCardProps {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    date: string;
    imageUrl?: string | null;
    category?: string | null;
    minPrice?: number | null;
    venueCity?: string | null;
    status?: EventStatus;
    platforms?: string[];
    platformPrices?: Record<string, number>; // Platform name -> min price
}

// Helper to generate SEO-friendly URL
function getEventUrl(props: EventCardProps): string {
    const { id, name, slug, date, category, venueCity } = props;

    // If we have all needed data, generate SEO URL
    if (category && venueCity && date) {
        // Normalize category for URL
        const categorySlug = category.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '-').replace(/\//g, '-');

        // Normalize city for URL
        const citySlug = venueCity.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '-');

        // Generate slug from name if not provided
        const titleSlug = (slug || name).toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Get day and month from date
        const eventDate = new Date(date);
        const day = eventDate.getDate().toString().padStart(2, '0');
        const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');

        return `/${citySlug}/${categorySlug}/${titleSlug}-${day}-${month}`;
    }

    // Fallback to old URL format
    return `/event/${id}`;
}

// Calculate discount percentage between platforms
function calculateDiscount(platformPrices?: Record<string, number>): number | null {
    if (!platformPrices || Object.keys(platformPrices).length < 2) return null;

    const prices = Object.values(platformPrices);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice >= maxPrice || maxPrice === 0) return null;

    const discountPercent = Math.round(((maxPrice - minPrice) / maxPrice) * 100);
    return discountPercent > 0 ? discountPercent : null;
}

export default function EventCard({
    id, name, slug, description, date, imageUrl, category, minPrice, venueCity, status = 'Active', platforms, platformPrices
}: EventCardProps) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
    const [imageError, setImageError] = useState(false);

    const discountPercent = calculateDiscount(platformPrices);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatPrice = (price?: number | null) => {
        if (price === null || price === undefined) return 'Fiyat bilgisi yok';
        return price > 0 ? `${price.toFixed(0)}₺'den` : 'Ücretsiz';
    };

    const getImageSrc = () => {
        if (!imageUrl) return null;

        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        if (imageUrl.startsWith('/images')) {
            return `${API_BASE}${imageUrl}`;
        }

        return `https://www.biletix.com/static/images/live/event/eventimages/${imageUrl}`;
    };

    const getCategoryColor = (cat?: string | null) => {
        if (!cat) return 'bg-blue-100 text-blue-700';
        const colors: Record<string, string> = {
            'Konser': 'bg-purple-100 text-purple-700',
            'Tiyatro': 'bg-rose-100 text-rose-700',
            'Spor': 'bg-green-100 text-green-700',
            'Atölye': 'bg-amber-100 text-amber-700',
            'Parti': 'bg-pink-100 text-pink-700',
            'Gece Hayatı': 'bg-indigo-100 text-indigo-700',
            'Stand-Up': 'bg-orange-100 text-orange-700',
        };
        return colors[cat] || 'bg-blue-100 text-blue-700';
    };

    const getCategoryEmoji = (cat?: string | null) => {
        if (!cat) return '🎫';
        const emojis: Record<string, string> = {
            'Konser': '🎵',
            'Tiyatro': '🎭',
            'Spor': '⚽',
            'Atölye': '🎨',
            'Parti': '🎉',
            'Gece Hayatı': '🌙',
            'Stand-Up': '🎤',
        };
        return emojis[cat] || '🎫';
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'Expired':
                return (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-500/90 text-white backdrop-blur-sm shadow-lg">
                            📅 Geçmiş
                        </span>
                    </div>
                );
            case 'SoldOut':
                return (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-sm shadow-lg">
                            🎫 Tükendi
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (status === 'Removed') return null;

    const imageSrc = getImageSrc();
    const showImage = imageSrc && !imageError;
    const eventUrl = getEventUrl({ id, name, slug, date, category, venueCity });

    return (
        <Link href={eventUrl} className="group">
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${status === 'Expired' ? 'opacity-60' : ''}`}>
                <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
                    {/* Status Badge */}
                    {getStatusBadge()}

                    {/* Discount Badge */}
                    {discountPercent && discountPercent > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                                💰 %{discountPercent} Avantaj
                            </span>
                        </div>
                    )}

                    {showImage ? (
                        <img
                            src={imageSrc}
                            alt={name}
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${status === 'Expired' ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                            {getCategoryEmoji(category)}
                        </div>
                    )}

                    {category && (
                        <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
                                {category}
                            </span>
                        </div>
                    )}

                    {/* Platform count badge */}
                    {platforms && platforms.length > 1 && (
                        <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                                {platforms.length} platform
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <div className="text-blue-600 text-sm font-bold mb-2">
                        📅 {formatDate(date)}
                    </div>

                    <h3 className="text-slate-900 font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    {description && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-slate-400 text-xs flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {venueCity || 'İstanbul'}
                        </div>
                        {/* Always show price */}
                        <div className="flex items-center gap-2">
                            {discountPercent && discountPercent > 0 && (
                                <span className="text-green-600 text-xs font-semibold">
                                    -%{discountPercent}
                                </span>
                            )}
                            <span className="text-blue-600 font-bold text-lg">
                                {formatPrice(minPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
