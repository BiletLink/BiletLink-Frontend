import { Metadata } from 'next';
import EventClient from './EventClient';
import { slugToCity } from '@/utils/cityUtils';

interface PageParams {
    mainSlug: string;
    subParam: string;
    eventSlug: string;
}

// Helper to determine which param is city and which is category
function parseParams(params: PageParams) {
    const { mainSlug, subParam, eventSlug } = params;

    // Decode URI components
    const decodedMain = decodeURIComponent(mainSlug);
    const decodedSub = decodeURIComponent(subParam);
    const decodedEvent = decodeURIComponent(eventSlug);

    const cityObj = slugToCity(decodedMain);
    if (cityObj) {
        // Pattern: /samsun/konser/etkinlik-slug
        return { city: decodedMain, category: decodedSub, slug: decodedEvent };
    } else {
        // Pattern: /konser/samsun/etkinlik-slug
        // If mainSlug is NOT a city, we assume it's a category.
        // And subParam is city.
        return { category: decodedMain, city: decodedSub, slug: decodedEvent };
    }
}

// SEO Metadata Generator
export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { category, city, slug } = parseParams(params);

    // Use internal URL for SSG/SSR valid within Vercel/Docker network if possible, 
    // or public URL. Since Vercel doesn't have local network access to your VPS, 
    // it MUST use the public HTTPS URL.
    const apiUrl = 'https://api.biletlink.co';
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    try {
        const res = await fetch(`${baseUrl}/api/master-events/by-slug/${category}/${city}/${slug}`, { next: { revalidate: 60 } });

        if (!res.ok) {
            return {
                title: 'Etkinlik Bulunamadı | BiletLink',
                description: 'Aradığınız etkinlik bulunamadı.',
            };
        }

        const event = await res.json();

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
        const description = `${event.date ? new Date(event.date).toLocaleDateString('tr-TR') : ''} tarihinde ${event.venue?.name || ''} mekanında gerçekleşecek ${event.name} etkinliği için biletler BiletLink'te!`;

        // Prefer /city/category/slug as canonical
        const canonicalUrl = `https://www.biletlink.co/${city}/${category}/${slug}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: event.imageUrl ? [{
                    url: event.imageUrl,
                    width: 800,
                    height: 500,
                    alt: event.name,
                }] : [],
                type: 'website',
                siteName: 'BiletLink',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: event.imageUrl ? [event.imageUrl] : [],
                site: '@biletlink',
            },
            alternates: {
                canonical: canonicalUrl,
            }
        };
    } catch (error) {
        console.error("Error fetching event for metadata:", error);
        return {
            title: 'Etkinlik | BiletLink',
            description: 'BiletLink - Tüm etkinlikler tek platformda.',
        };
    }
}

export default function EventPage({ params }: { params: PageParams }) {
    const { category, city, slug } = parseParams(params);
    return <EventClient city={city} category={category} slug={slug} />;
}

// Generate static paths for common categories
export async function generateStaticParams() {
    // Return empty - let pages be generated on-demand
    return [];
}
