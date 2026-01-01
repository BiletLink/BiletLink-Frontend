import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BiletLink Etkinlik';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface PageParams {
    mainSlug: string;
    subParam: string;
    eventSlug: string;
}

// Helper to determine city vs category
function parseParams(params: PageParams) {
    const { mainSlug, subParam, eventSlug } = params;
    const decodedMain = decodeURIComponent(mainSlug);
    const decodedSub = decodeURIComponent(subParam);
    const decodedEvent = decodeURIComponent(eventSlug);

    // Check if mainSlug is a city by pattern (Turkish cities have specific slugs)
    const cityPatterns = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'eskisehir', 'sinop', 'samsun', 'adana', 'konya', 'gaziantep', 'mersin'];
    if (cityPatterns.some(c => decodedMain.toLowerCase().includes(c))) {
        return { city: decodedMain, category: decodedSub, slug: decodedEvent };
    }
    return { category: decodedMain, city: decodedSub, slug: decodedEvent };
}

export default async function Image({ params }: { params: PageParams }) {
    const { category, city, slug } = parseParams(params);

    // Fetch event data
    let event: any = null;
    try {
        const res = await fetch(`https://api.biletlink.co/api/master-events/by-slug/${category}/${city}/${slug}`, {
            next: { revalidate: 3600 }
        });
        if (res.ok) {
            event = await res.json();
        }
    } catch (e) {
        console.error('Failed to fetch event for OG image:', e);
    }

    const eventName = event?.name || 'Etkinlik';
    const venueName = event?.venue?.name || '';
    const cityName = event?.venue?.city || city;
    const eventDate = event?.eventDate ? new Date(event.eventDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    const imageUrl = event?.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=630&fit=crop';
    const categoryEmoji = getCategoryEmoji(event?.category || category);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Background Image */}
                <img
                    src={imageUrl}
                    alt=""
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />

                {/* Gradient Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '40px 50px',
                        zIndex: 10,
                    }}
                >
                    {/* Event Name */}
                    <div
                        style={{
                            fontSize: 52,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: 16,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                            lineHeight: 1.2,
                        }}
                    >
                        {categoryEmoji} {eventName}
                    </div>

                    {/* Date and Venue */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {eventDate && (
                            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                📅 {eventDate}
                            </div>
                        )}
                        {venueName && (
                            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                📍 {venueName}, {cityName}
                            </div>
                        )}
                    </div>
                </div>

                {/* BiletLink Logo Watermark */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 30,
                        right: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 20px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 16,
                    }}
                >
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                    >
                        BiletLink
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}

function getCategoryEmoji(category: string): string {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('konser')) return '🎵';
    if (cat.includes('tiyatro')) return '🎭';
    if (cat.includes('stand')) return '🎤';
    if (cat.includes('festival')) return '🎉';
    if (cat.includes('spor')) return '⚽';
    return '🎫';
}
