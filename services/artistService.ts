export interface ArtistEvent {
    id: string;
    name: string;
    date: string;
    imageUrl?: string | null;
    venueName?: string | null;
    venueCity?: string | null;
    minPrice?: number | null;
}

export interface ArtistDetail {
    id: string;
    name: string;
    slug: string;
    bio?: string;
    imageUrl?: string | null;
    coverImageUrl?: string | null;
    genre?: string;
    spotifyUrl?: string;
    instagramHandle?: string;
    twitterHandle?: string;
    eventCount: number;
    upcomingEvents: ArtistEvent[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export const artistService = {
    async getBySlug(slug: string): Promise<ArtistDetail | null> {
        try {
            const response = await fetch(`${API_URL}/api/artists/${slug}`, {
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch artist');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching artist:', error);
            return null;
        }
    }
};
