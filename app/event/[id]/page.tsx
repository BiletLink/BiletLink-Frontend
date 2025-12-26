
import { Metadata } from 'next';
import EventDetailClient from './EventDetailClient';

// Helper to fetch data on the server
async function getEvent(id: string) {
    // Determine API URL:
    // If running in Docker internal network (SSR), use http://api:8080 or the internal service name.
    // If locally or build time, use NEXT_PUBLIC_API_URL.
    // We prioritize internal docker networking if available via API_URL env var we set in docker-compose.
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    // Ensure we don't have double slashes if env var has trailing slash
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    try {
        // Force no-store to ensure fresh data on each request (or revalidate: 60 for caching)
        // Adjust cache strategy as needed for your specific requirements.
        const res = await fetch(`${baseUrl}/api/master-events/${id}`, { next: { revalidate: 60 } });

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching event for metadata:", error);
        return null;
    }
}

// SEO Metadata Generator
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const event = await getEvent(params.id);

    if (!event) {
        return {
            title: 'Etkinlik Bulunamadı | BiletLink',
            description: 'Aradığınız etkinlik bulunamadı veya yayından kaldırılmış olabilir.',
        };
    }

    // Dynamic Title Suffix Generation
    let suffix = "Biletleri";
    if (event.category?.toLowerCase().includes("konser")) {
        suffix = "Konseri Biletleri";
    } else if (event.category?.toLowerCase().includes("tiyatro")) {
        suffix = "Tiyatro Oyunu Biletleri";
    } else if (event.category?.toLowerCase().includes("festival")) {
        suffix = "Festivali Biletleri";
    } else if (event.category?.toLowerCase().includes("stand")) {
        suffix = "Stand-Up Biletleri";
    }

    const title = `${event.name} ${suffix} | ${event.venue?.name || ''} | BiletLink`;
    const description = `${event.date ? new Date(event.date).toLocaleDateString('tr-TR') : ''} tarihinde ${event.venue?.name || ''} mekanında gerçekleşecek ${event.name} etkinliği için biletler BiletLink'te! En uygun fiyatlarla ${event.name} biletini hemen al.`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: event.imageUrl ? [event.imageUrl] : [],
            url: `https://biletlink.co/event/${event.id}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: event.imageUrl ? [event.imageUrl] : [],
        },
        alternates: {
            canonical: `https://biletlink.co/event/${event.id}`,
        }
    };
}

export default async function EventPage({ params }: { params: { id: string } }) {
    const event = await getEvent(params.id);

    return <EventDetailClient initialEvent={event} />;
}
