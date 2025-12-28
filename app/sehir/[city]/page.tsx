'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCity, cities } from '@/contexts/CityContext';

// Helper function to normalize city name to URL slug
function cityToSlug(cityName: string): string {
    return cityName
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/İ/g, 'i')
        .replace(/\s+/g, '-');
}

// Helper function to find city from slug
function slugToCity(slug: string): { code: string; name: string } | null {
    const normalizedSlug = slug.toLowerCase();
    return cities.find(city => cityToSlug(city.name) === normalizedSlug) || null;
}

interface CityPageProps {
    params: { city: string };
}

export default function CityPage({ params }: CityPageProps) {
    const router = useRouter();
    const { setSelectedCity } = useCity();

    useEffect(() => {
        const city = slugToCity(params.city);
        if (city) {
            // Set the city in context and redirect to home
            setSelectedCity(city);
        }
        // Redirect to home - the city context will filter the results
        router.replace('/');
    }, [params.city, setSelectedCity, router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );
}
