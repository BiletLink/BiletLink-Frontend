'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface HorizontalScrollProps {
    children: ReactNode;
    title: string;
    icon: ReactNode;
    badge?: ReactNode;
    itemCount?: number;
}

export default function HorizontalScroll({ children, title, icon, badge, itemCount }: HorizontalScrollProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        checkScrollability();
        container.addEventListener('scroll', checkScrollability);
        window.addEventListener('resize', checkScrollability);

        return () => {
            container.removeEventListener('scroll', checkScrollability);
            window.removeEventListener('resize', checkScrollability);
        };
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <section className="fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5EB0EF] to-[#A78BFA] flex items-center justify-center text-white text-lg">
                        {icon}
                    </span>
                    {title}
                    {badge}
                </h2>

                {/* Navigation Arrows + Count */}
                <div className="flex items-center gap-3">
                    {itemCount && (
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {itemCount} etkinlik
                        </span>
                    )}

                    {/* Arrow Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${canScrollLeft
                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#5EB0EF] hover:text-[#5EB0EF] shadow-sm'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                            aria-label="Scroll left"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${canScrollRight
                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#5EB0EF] hover:text-[#5EB0EF] shadow-sm'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                            aria-label="Scroll right"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll Container */}
            <div className="relative">
                {/* Left Fade Gradient */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                )}

                {/* Right Fade Gradient */}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                )}

                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto pb-4 gap-4 scroll-smooth scrollbar-hide"
                    style={{
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {children}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
