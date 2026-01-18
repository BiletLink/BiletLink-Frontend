'use client';

import Link from 'next/link';
import { useState } from 'react';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

interface EventListItemProps {
    id: string;
    name: string;
    slug?: string | null;
    date: string;
    imageUrl?: string | null;
    category?: string | null;
    minPrice?: number | null;
    venueCity?: string | null;
    venueName?: string | null;
    status?: EventStatus;
}

// Helper to generate SEO-friendly URL (Duplicated from EventCard for independence)
function getEventUrl(props: EventListItemProps): string {
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

export default function EventListItem({
    id, name, slug, date, imageUrl, category, minPrice, venueCity, venueName, status = 'Active'
}: EventListItemProps) {

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return {
                day: date.getDate(),
                month: date.toLocaleDateString('tr-TR', { month: 'long' }), // "Ocak"
                monthShort: date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(), // "OCA"
                time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                weekday: date.toLocaleDateString('tr-TR', { weekday: 'long' })
            };
        } catch (e) {
            return { day: '--', month: '---', monthShort: '---', time: '--:--', weekday: '---' };
        }
    };

    const getApperance = (cat?: string | null) => {
        // Returns border color class and text color class
        if (!cat) return { border: 'border-slate-500', text: 'text-slate-600', bg: 'bg-slate-500' };
        const styles: Record<string, { border: string; text: string; bg: string }> = {
            'Konser': { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-500' },
            'Tiyatro': { border: 'border-rose-500', text: 'text-rose-600', bg: 'bg-rose-500' },
            'Spor': { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-500' },
            'Festival': { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-500' },
            'Stand-Up': { border: 'border-orange-500', text: 'text-orange-600', bg: 'bg-orange-500' },
            'Müzikal': { border: 'border-pink-500', text: 'text-pink-600', bg: 'bg-pink-500' },
            'Opera': { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-500' },
            'Bale': { border: 'border-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-500' },
        };
        return styles[cat] || { border: 'border-slate-500', text: 'text-slate-600', bg: 'bg-slate-500' };
    };

    const eventUrl = getEventUrl({ id, name, slug, date, category, venueCity });
    const dateInfo = formatDate(date);
    const style = getApperance(category);
    const isSoldOut = status === 'SoldOut';

    return (
        <Link href={eventUrl} className="group block w-full">
            <div className={`
                relative flex items-center bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-slate-100 min-h-[100px]
                ${status === 'Expired' ? 'opacity-60 saturate-0' : ''}
            `}>
                {/* Left Colored Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bg}`}></div>

                {/* Date Block */}
                <div className="pl-6 pr-6 flex flex-col items-center justify-center min-w-[100px] border-r border-slate-50 py-4">
                    <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{dateInfo.day}</span>
                    <span className="text-sm font-bold text-slate-500 uppercase mt-1">{dateInfo.month}</span>
                    <span className="text-xs text-slate-400 font-medium mt-1">{dateInfo.time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {name}
                            </h3>
                            {/* Status Badge */}
                            {isSoldOut ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600 tracking-wider">
                                    Tükendi
                                </span>
                            ) : status === 'Expired' ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 tracking-wider">
                                    Geçmiş
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-600 tracking-wider">
                                    Satışta
                                </span>
                            )}
                        </div>

                        <div className="flex items-center text-slate-500 text-sm gap-2">
                            {venueName && <span className="font-medium text-slate-700">{venueName}</span>}
                            {venueName && venueCity && <span className="text-slate-300">•</span>}
                            {venueCity && <span>{venueCity}</span>}
                        </div>
                    </div>

                    {/* Right Side: Price & Arrow */}
                    <div className="flex items-center gap-6 justify-between md:justify-end min-w-[140px]">
                        <div className="text-right">
                            {isSoldOut ? (
                                <span className="text-lg font-bold text-red-600 block">Tükendi</span>
                            ) : minPrice ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-slate-400 font-medium uppercas">Başlayan</span>
                                    <span className={`text-xl font-bold ${style.text}`}>
                                        {minPrice.toLocaleString('tr-TR')}₺
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-slate-400">Detaylar</span>
                            )}
                        </div>

                        {/* Arrow Icon */}
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
