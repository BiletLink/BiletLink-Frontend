'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Input, Badge, PageHeader, Pagination } from '../components/ui';

interface Venue {
    id: string;
    name: string;
    city: string;
    address: string;
    capacity: number;
    isManuallyEdited?: boolean;
}

interface PagedResult {
    items: Venue[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminVenues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', city: '', address: '', capacity: 0 });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchVenues(token, page, search);
    }, [page, search, router]);

    const fetchVenues = async (token: string, pageNum: number, searchTerm: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const params = new URLSearchParams({ page: pageNum.toString(), pageSize: '20' });
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${apiUrl}/api/admin/venues?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data: PagedResult = await response.json();
            setVenues(data.items);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (venue: Venue) => {
        setEditingId(venue.id);
        setEditForm({ name: venue.name, city: venue.city, address: venue.address || '', capacity: venue.capacity || 0 });
    };

    const handleSave = async (isManual: boolean = false) => {
        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        setSaving(true);

        try {
            const endpoint = isManual
                ? `${apiUrl}/api/admin/venues/${editingId}/manual`
                : `${apiUrl}/api/admin/venues/${editingId}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedVenue = { ...editForm, isManuallyEdited: isManual };
                setVenues(venues.map(v => v.id === editingId ? { ...v, ...updatedVenue } : v));
                setEditingId(null);
            }
        } catch {
            alert('Güncelleme başarısız');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" mekanını silmek istediğinize emin misiniz?`)) return;

        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        try {
            const response = await fetch(`${apiUrl}/api/admin/venues/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setVenues(venues.filter(v => v.id !== id));
            } else {
                const data = await response.json();
                alert(data.message || 'Silme başarısız');
            }
        } catch {
            alert('Bir hata oluştu');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mekan Yönetimi"
                description={`Toplam ${total} mekan`}
                icon="🏛️"
            />

            {/* Search */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder="Mekan ara..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                icon={<span>🔍</span>}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Venues Table */}
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mekan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Şehir</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Adres</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kapasite</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {venues.map((venue) => (
                                        <tr key={venue.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-4 py-4">
                                                {editingId === venue.id ? (
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="max-w-[200px]"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">{venue.name}</span>
                                                        {venue.isManuallyEdited && (
                                                            <Badge variant="warning" size="sm">✏️ Manuel</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {editingId === venue.id ? (
                                                    <Input
                                                        value={editForm.city}
                                                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                                        className="max-w-[120px]"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300">{venue.city}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-slate-400 text-sm truncate max-w-xs">
                                                {editingId === venue.id ? (
                                                    <Input
                                                        value={editForm.address}
                                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                    />
                                                ) : (
                                                    venue.address || '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-slate-300">
                                                {editingId === venue.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.capacity}
                                                        onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                                                        className="max-w-[100px]"
                                                    />
                                                ) : (
                                                    venue.capacity || '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {editingId === venue.id ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleSave(false)}
                                                            isLoading={saving}
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleSave(true)}
                                                            isLoading={saving}
                                                        >
                                                            ✏️ Manuel
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            ✗
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(venue)}>✏️</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(venue.id, venue.name)}>🗑️</Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {venues.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                                <span className="text-4xl block mb-3">📭</span>
                                                Mekan bulunamadı
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
