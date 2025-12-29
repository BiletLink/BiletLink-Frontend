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
    venueName?: string | null;
    status?: EventStatus;
    platforms?: string[];
    platformPrices?: Record<string, number>;
}

// Helper to generate SEO-friendly URL
function getEventUrl(props: EventCardProps): string {
    const { id, name, slug, date, category, venueCity } = props;

    if (category && venueCity && date) {
        const categorySlug = category.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '-').replace(/\//g, '-');

        const citySlug = venueCity.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '-');

        const titleSlug = (slug || name).toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const eventDate = new Date(date);
        const day = eventDate.getDate().toString().padStart(2, '0');
        const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');

        return `/${citySlug}/${categorySlug}/${titleSlug}-${day}-${month}`;
    }

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
    id, name, slug, description, date, imageUrl, category, minPrice, venueCity, venueName, status = 'Active', platforms, platformPrices
}: EventCardProps) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';
    const [imageError, setImageError] = useState(false);

    const discountPercent = calculateDiscount(platformPrices);

    // Calculate effective price
    const effectivePrice = minPrice ?? (
        platformPrices && Object.keys(platformPrices).length > 0
            ? Math.min(...Object.values(platformPrices))
            : null
    );

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return {
                day: date.getDate(),
                month: date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(),
                time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                weekday: date.toLocaleDateString('tr-TR', { weekday: 'short' })
            };
        } catch (e) {
            return { day: '--', month: '---', time: '--:--', weekday: '---' };
        }
    };

    const formatPrice = (price?: number | null) => {
        if (price === null || price === undefined) return null;
        return price > 0 ? `${price.toLocaleString('tr-TR')}₺` : 'Ücretsiz';
    };

    const getImageSrc = () => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/images')) return `${API_BASE}${imageUrl}`;
        return `https://www.biletix.com/static/images/live/event/eventimages/${imageUrl}`;
    };

    const getCategoryStyle = (cat?: string | null) => {
        if (!cat) return { bg: 'bg-slate-100', text: 'text-slate-600' };
        const styles: Record<string, { bg: string; text: string }> = {
            'Konser': { bg: 'bg-purple-100', text: 'text-purple-700' },
            'Tiyatro': { bg: 'bg-rose-100', text: 'text-rose-700' },
            'Spor': { bg: 'bg-green-100', text: 'text-green-700' },
            'Festival': { bg: 'bg-amber-100', text: 'text-amber-700' },
            'Stand-Up': { bg: 'bg-orange-100', text: 'text-orange-700' },
            'Müzikal': { bg: 'bg-pink-100', text: 'text-pink-700' },
            'Opera': { bg: 'bg-blue-100', text: 'text-blue-700' },
            'Bale': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
        };
        return styles[cat] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    };

    if (status === 'Removed') return null;

    const imageSrc = getImageSrc();
    const showImage = imageSrc && !imageError;
    const eventUrl = getEventUrl({ id, name, slug, date, category, venueCity });
    const dateInfo = formatDate(date);
    const catStyle = getCategoryStyle(category);
    const isSoldOut = status === 'SoldOut';

    return (
        <Link href={eventUrl} className="group block h-full">
            <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col ${status === 'Expired' ? 'opacity-60' : ''}`}>
                {/* Image Container */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#5EB0EF] to-[#A78BFA] overflow-hidden">
                    {/* Discount Badge */}
                    {discountPercent && discountPercent > 0 && !isSoldOut && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#10B981] to-[#22D3EE] text-white shadow-lg">
                                <span>💰</span> %{discountPercent} Avantaj
                            </span>
                        </div>
                    )}

                    {/* Sold Out Badge */}
                    {isSoldOut && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                                Tükendi
                            </span>
                        </div>
                    )}

                    {/* Image */}
                    {showImage ? (
                        <img
                            src={imageSrc}
                            alt={name}
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${status === 'Expired' || isSoldOut ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-50">🎫</span>
                        </div>
                    )}

                    {/* Category Badge */}
                    {category && (
                        <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${catStyle.bg} ${catStyle.text}`}>
                                {category}
                            </span>
                        </div>
                    )}

                    {/* Platform Count */}
                    {platforms && platforms.length > 1 && (
                        <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                {platforms.length} platform
                            </span>
                        </div>
                    )}

                    {/* BiletLink Watermark */}
                    <div className="absolute bottom-3 right-3 z-10">
                        <span className="text-white/30 text-xs font-bold tracking-wider">
                            BiletLink
                        </span>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    {/* Date Row */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#5EB0EF]/10">
                            <span className="text-lg font-bold text-[#5EB0EF] leading-none">{dateInfo.day}</span>
                            <span className="text-[10px] font-medium text-[#5EB0EF]/70">{dateInfo.month}</span>
                        </div>
                        <div className="text-sm text-slate-500">
                            <div className="font-medium text-slate-700">{dateInfo.weekday}, {dateInfo.time}</div>
                            <div className="text-xs flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {venueName || venueCity || 'Belirtilmemiş'}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-[#5EB0EF] transition-colors flex-grow">
                        {name}
                    </h3>

                    {/* Price Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="text-sm text-slate-500">
                            {venueCity && (
                                <span className="inline-flex items-center gap-1">
                                    📍 {venueCity}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isSoldOut ? (
                                <span className="text-sm font-semibold text-red-500">
                                    Tükendi
                                </span>
                            ) : (
                                <>
                                    {discountPercent && discountPercent > 0 && (
                                        <span className="text-xs font-semibold text-green-600">
                                            -%{discountPercent}
                                        </span>
                                    )}
                                    {effectivePrice !== null ? (
                                        <span className="text-lg font-bold text-[#5EB0EF]">
                                            {formatPrice(effectivePrice)}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-slate-500">
                                            Detaylar için tıkla
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
