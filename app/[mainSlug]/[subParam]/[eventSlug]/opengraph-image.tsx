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

    const imageUrl = event?.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=630&fit=crop';

    // Simple OG image: just the event image resized to 1200x630
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                }}
            >
                {/* Background Image - fills the entire area */}
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
            </div>
        ),
        {
            ...size,
        }
    );
}
