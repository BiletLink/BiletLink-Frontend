'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, Button, Input, Badge, PageHeader, Pagination, Select } from '../components/ui';

interface Event {
    id: string;
    name: string;
    date: string;
    city: string;
    venueName: string;
    category: string;
    status: string;
    minPrice: number;
    platforms: string[];
    artistName: string;
}

interface PagedResult {
    items: Event[];
    total: number;
    page: number;
    totalPages: number;
}

const categories = [
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'Konser', label: 'Konser' },
    { value: 'Tiyatro', label: 'Tiyatro' },
    { value: 'Stand-Up', label: 'Stand-Up' },
    { value: 'Festival', label: 'Festival' },
    { value: 'Spor', label: 'Spor' },
];

export default function AdminEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchEvents(token, page, search, categoryFilter);
    }, [page, search, categoryFilter, router]);

    const fetchEvents = async (token: string, pageNum: number, searchTerm: string, category: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const params = new URLSearchParams({ page: pageNum.toString(), pageSize: '15' });
            if (searchTerm) params.append('search', searchTerm);
            if (category) params.append('category', category);

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
            } else {
                const data = await response.json();
                alert(data.message || 'Silme başarısız');
            }
        } catch {
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

    return (
        <div className="space-y-6">
            <PageHeader
                title="Etkinlik Yönetimi"
                description={`Toplam ${total} etkinlik`}
                icon="🎫"
            />

            {/* Filters */}
            <Card>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Etkinlik ara..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                icon={<span>🔍</span>}
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                options={categories}
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                            />
                        </div>
                        <Button variant="secondary" onClick={() => { setSearch(''); setCategoryFilter(''); setPage(1); }}>
                            Temizle
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800/50 bg-slate-800/30">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Etkinlik</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarih</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Şehir</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Durum</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Fiyat</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-white font-medium truncate max-w-[250px]">{event.name}</p>
                                                    <p className="text-slate-500 text-sm truncate max-w-[250px]">{event.venueName}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-300 text-sm whitespace-nowrap">
                                                {formatDate(event.date)}
                                            </td>
                                            <td className="px-4 py-4 text-slate-300 text-sm">
                                                {event.city}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="purple" size="sm">{event.category || 'Diğer'}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-1.5">
                                                    {event.platforms?.includes('Biletix') && (
                                                        <Badge variant="info" size="sm">Biletix</Badge>
                                                    )}
                                                    {event.platforms?.includes('Bubilet') && (
                                                        <Badge variant="purple" size="sm">Bubilet</Badge>
                                                    )}
                                                    {(!event.platforms || event.platforms.length === 0) && (
                                                        <span className="text-slate-500 text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant={event.status === 'active' ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {event.status === 'active' ? 'Aktif' : 'Pasif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right text-white font-medium">
                                                {event.minPrice ? `${event.minPrice}₺` : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/events/${event.id}`}>
                                                        <Button variant="ghost" size="sm">✏️</Button>
                                                    </Link>
                                                    <Link href={`/event/${event.id}`} target="_blank">
                                                        <Button variant="ghost" size="sm">👁️</Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(event.id, event.name)}
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {events.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                                <span className="text-4xl block mb-3">📭</span>
                                                Etkinlik bulunamadı
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}
