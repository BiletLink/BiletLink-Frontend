import { Metadata } from 'next';
import EventClient from './EventClient';

// Valid categories for routing
const validCategories = ['konser', 'tiyatro', 'festival', 'stand-up', 'sanat', 'cocuk-aile', 'etkinlik', 'muzikal', 'sahne-sanatlari'];

// SEO Metadata Generator
export async function generateMetadata({ params }: { params: { category: string; city: string; slug: string } }): Promise<Metadata> {
    const { category, city, slug } = params;

    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
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

        const canonicalUrl = `https://biletlink.co/${category}/${city}/${slug}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: event.imageUrl ? [event.imageUrl] : [],
                url: canonicalUrl,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: event.imageUrl ? [event.imageUrl] : [],
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

export default function EventPage({ params }: { params: { category: string; city: string; slug: string } }) {
    return <EventClient />;
}

// Generate static paths for common categories
export async function generateStaticParams() {
    // Return empty - let pages be generated on-demand
    return [];
}
