'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
    id: string;
    name: string;
    date: string;
    category: string;
    status: string;
    city: string;
    venueName: string;
    artistName: string;
    minPrice: number;
    platforms: string[];
}

interface PagedResult {
    items: Event[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function AdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchEvents(token, page, search, categoryFilter);
    }, [page, search, categoryFilter, router]);

    const fetchEvents = async (token: string, pageNum: number, searchTerm: string, cat: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const params = new URLSearchParams({
                page: pageNum.toString(),
                pageSize: '20'
            });
            if (searchTerm) params.append('search', searchTerm);
            if (cat) params.append('category', cat);

            const response = await fetch(`${apiUrl}/api/admin/events?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data: PagedResult = await response.json();
            setEvents(data.items);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" etkinliğini silmek istediğinize emin misiniz?`)) return;

        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        try {
            const response = await fetch(`${apiUrl}/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setEvents(events.filter(e => e.id !== id));
                alert('Event silindi');
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            alert('Bir hata oluştu');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Expired': return 'bg-red-500/20 text-red-400';
            case 'SoldOut': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navbar */}
            <nav className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/admin" className="text-xl font-bold text-white">🎛️ BiletLink Admin</Link>
                            <div className="flex gap-4">
                                <Link href="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    Dashboard
                                </Link>
                                <Link href="/admin/events" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">
                                    🎫 Events
                                </Link>
                                <Link href="/admin/artists" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    🎤 Artists
                                </Link>
                                <Link href="/admin/venues" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    🏛️ Venues
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">🎫 Events ({total})</h2>
                    <div className="flex gap-4">
                        <select
                            value={categoryFilter}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setCategoryFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tüm Kategoriler</option>
                            <option value="Konser">Konser</option>
                            <option value="Tiyatro">Tiyatro</option>
                            <option value="Stand-Up">Stand-Up</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Event ara..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Events Table */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            Sonuç bulunamadı
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Event</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Platform</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tarih</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Şehir</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Kategori</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Durum</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fiyat</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-4">
                                            <div className="text-white font-medium truncate max-w-xs">{event.name}</div>
                                            <div className="text-slate-400 text-sm truncate">{event.artistName}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {event.platforms && event.platforms.includes('Biletix') && (
                                                    <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded text-[10px] border border-blue-800/50">
                                                        Biletix
                                                    </span>
                                                )}
                                                {event.platforms && event.platforms.includes('Bubilet') && (
                                                    <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded text-[10px] border border-purple-800/50">
                                                        Bubilet
                                                    </span>
                                                )}
                                                {(!event.platforms || event.platforms.length === 0) && (
                                                    <span className="text-slate-600 text-[10px]">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300 text-sm">{formatDate(event.date)}</td>
                                        <td className="px-4 py-4 text-slate-300 text-sm">{event.city}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-300 text-sm">
                                            {event.minPrice ? `${event.minPrice}₺` : '-'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/admin/events/${event.id}`}
                                                className="text-blue-400 hover:text-blue-300 mr-4"
                                            >
                                                ✏️
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(event.id, event.name)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50"
                        >
                            ← Önceki
                        </button>
                        <span className="text-slate-400 px-4">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50"
                        >
                            Sonraki →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
