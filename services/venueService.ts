export interface VenueEvent {
    id: string;
    name: string;
    date: string;
    imageUrl?: string | null;
    category?: string;
    artistName?: string | null;
    minPrice?: number | null;
}

export interface VenueDetail {
    id: string;
    name: string;
    slug: string;
    city: string;
    district?: string;
    address?: string;
    description?: string;
    imageUrl?: string | null;
    websiteUrl?: string;
    phoneNumber?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
    eventCount: number;
    upcomingEvents: VenueEvent[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export const venueService = {
    async getBySlug(slug: string): Promise<VenueDetail | null> {
        try {
            const response = await fetch(`${API_URL}/api/venues/${slug}`, {
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch venue');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching venue:', error);
            return null;
        }
    }
};
