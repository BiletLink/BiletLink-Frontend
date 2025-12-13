import Link from 'next/link';

type EventStatus = 'Active' | 'Expired' | 'SoldOut' | 'Removed';

interface EventCardProps {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl?: string | null;
    category: string;
    minPrice: number;
    venueCity?: string | null;
    status?: EventStatus;
}

export default function EventCard({ id, name, description, date, imageUrl, category, minPrice, venueCity, status = 'Active' }: EventCardProps) {
    const API_BASE = 'http://localhost:5001';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return price > 0 ? `${price.toFixed(0)}₺` : 'Ücretsiz';
    };

    const getImageSrc = () => {
        if (!imageUrl) return null;

        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/images')) return `${API_BASE}${imageUrl}`;

        return `https://www.biletix.com/static/images/live/event/eventimages/${imageUrl}`;
    };

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            'Konser': 'bg-purple-100 text-purple-700',
            'Tiyatro': 'bg-rose-100 text-rose-700',
            'Spor': 'bg-green-100 text-green-700',
            'Atölye': 'bg-amber-100 text-amber-700',
            'Parti': 'bg-pink-100 text-pink-700',
            'Gece Hayatı': 'bg-indigo-100 text-indigo-700',
        };
        return colors[cat] || 'bg-blue-100 text-blue-700';
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'Expired':
                return (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-500/90 text-white backdrop-blur-sm shadow-lg">
                            📅 Geçmiş
                        </span>
                    </div>
                );
            case 'SoldOut':
                return (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-sm shadow-lg">
                            🎫 Tükendi
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (status === 'Removed') return null;

    return (
        <Link href={`/event/${id}`} className="group">
            <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${status === 'Expired' ? 'opacity-60' : ''}`}>
                <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
                    {/* Status Badge */}
                    {getStatusBadge()}

                    {getImageSrc() ? (
                        <img
                            src={getImageSrc()!}
                            alt={name}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${status === 'Expired' ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                            🎭
                        </div>
                    )}

                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
                            {category}
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <div className="text-blue-600 text-sm font-bold mb-2">
                        📅 {formatDate(date)}
                    </div>

                    <h3 className="text-slate-900 font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                        {description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-slate-400 text-xs flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {venueCity || 'İstanbul'}
                        </div>
                        <div className="text-blue-600 font-bold text-lg">
                            {formatPrice(minPrice)}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
