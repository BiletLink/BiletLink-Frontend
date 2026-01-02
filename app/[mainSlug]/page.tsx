'use client';

import HomeContent from '@/components/home/HomeContent';
import { slugToCity } from '@/utils/cityUtils';

interface PageProps {
    params: { mainSlug: string };
}

export default function MainSlugPage({ params }: PageProps) {
    const { mainSlug } = params;

    // Check if slug is a city
    const city = slugToCity(mainSlug);

    if (city) {
        // Render HomeContent with initialCitySlug
        // Add key to force remount when sity slug changes, preventing stale state
        return <HomeContent initialCitySlug={mainSlug} key={mainSlug} />;
    }

    // If not a city, treat as category
    // Capitalize first letter for display (API handles case insensitivity or frontend normalizes)
    // Actually HomeContent expects precise category names for the button active state
    // But for fetching, API might need something else.
    // Let's pass it as initialCategory.
    // To match "Konser", "Tiyatro" etc., we might need to capitalize properly.

    const formattedCategory = mainSlug.charAt(0).toUpperCase() + mainSlug.slice(1).toLowerCase();

    return <HomeContent initialCategory={formattedCategory} />;
}
