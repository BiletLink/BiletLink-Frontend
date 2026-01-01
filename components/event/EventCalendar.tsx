'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Event {
    id: string;
    name: string;
    date: string;
    slug?: string;
    imageUrl?: string | null;
    category?: string | null;
    artistName?: string | null;
    venueName?: string | null;
    venueCity?: string | null;
    minPrice?: number | null;
}

interface EventCalendarProps {
    events: Event[];
    getEventUrl?: (event: Event) => string;
    accentColor?: 'purple' | 'teal';
}

export default function EventCalendar({
    events,
    getEventUrl = (e) => `/event/${e.id}`,
    accentColor = 'purple'
}: EventCalendarProps) {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const colorClasses = {
        purple: {
            accent: 'text-purple-600',
            bg: 'bg-purple-600',
            bgLight: 'bg-purple-100',
            hover: 'hover:border-purple-300',
            ring: 'ring-purple-500',
        },
        teal: {
            accent: 'text-teal-600',
            bg: 'bg-teal-600',
            bgLight: 'bg-teal-100',
            hover: 'hover:border-teal-300',
            ring: 'ring-teal-500',
        }
    };

    const colors = colorClasses[accentColor];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short'
        });
    };

    // Group events by date for calendar view
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, Event[]> = {};
        events.forEach(event => {
            const dateKey = new Date(event.date).toISOString().split('T')[0];
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    // Calendar grid generation
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const days: { date: Date | null; events: Event[] }[] = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ date: null, events: [] });
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            days.push({ date, events: eventsByDate[dateKey] || [] });
        }

        return days;
    }, [currentMonth, eventsByDate]);

    const monthName = currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-slate-500">Şu an yaklaşan etkinlik bulunmuyor</p>
            </div>
        );
    }

    return (
        <div>
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">{events.length} etkinlik</p>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'list'
                                ? `${colors.bg} text-white`
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        📋 Liste
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar'
                                ? `${colors.bg} text-white`
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        📅 Takvim
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {events.map((event) => (
                        <Link
                            key={event.id}
                            href={getEventUrl(event)}
                            className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 ${colors.hover} hover:shadow-lg transition-all group`}
                        >
                            {event.imageUrl && (
                                <img
                                    src={event.imageUrl}
                                    alt={event.name}
                                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                />
                            )}
                            <div className="flex-grow min-w-0">
                                <h3 className={`font-semibold text-slate-800 group-hover:${colors.accent} transition-colors truncate`}>
                                    {event.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    📅 {formatDate(event.date)}
                                </p>
                                {event.venueName && (
                                    <p className="text-sm text-slate-400">
                                        📍 {event.venueName}{event.venueCity ? `, ${event.venueCity}` : ''}
                                    </p>
                                )}
                                {event.category && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                                        {event.category}
                                    </span>
                                )}
                            </div>
                            {event.minPrice && (
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-slate-400">başlayan</p>
                                    <p className={`text-lg font-bold ${colors.accent}`}>
                                        {event.minPrice.toLocaleString('tr-TR')}₺
                                    </p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ←
                        </button>
                        <h3 className="text-lg font-semibold text-slate-800 capitalize">
                            {monthName}
                        </h3>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            →
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200">
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-slate-500 bg-slate-50">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`min-h-[80px] p-1 border-b border-r border-slate-100 ${day.date ? '' : 'bg-slate-50'
                                    }`}
                            >
                                {day.date && (
                                    <>
                                        <div className={`text-sm font-medium mb-1 ${day.events.length > 0 ? colors.accent : 'text-slate-400'
                                            }`}>
                                            {day.date.getDate()}
                                        </div>
                                        {day.events.slice(0, 2).map(event => (
                                            <Link
                                                key={event.id}
                                                href={getEventUrl(event)}
                                                className={`block text-xs p-1 mb-1 ${colors.bgLight} ${colors.accent} rounded truncate hover:opacity-80`}
                                            >
                                                {event.name}
                                            </Link>
                                        ))}
                                        {day.events.length > 2 && (
                                            <div className={`text-xs ${colors.accent}`}>
                                                +{day.events.length - 2} daha
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
