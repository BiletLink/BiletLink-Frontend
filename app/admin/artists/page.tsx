'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Input, Badge, PageHeader, Pagination } from '../components/ui';

interface Artist {
    id: string;
    name: string;
    genre: string;
    bio: string;
    imageUrl: string;
    isManuallyEdited?: boolean;
}

interface PagedResult {
    items: Artist[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminArtists() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', genre: '', bio: '' });
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchArtists(token, page, search);
    }, [page, search, router]);

    const fetchArtists = async (token: string, pageNum: number, searchTerm: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const params = new URLSearchParams({ page: pageNum.toString(), pageSize: '20' });
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${apiUrl}/api/admin/artists?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data: PagedResult = await response.json();
            setArtists(data.items);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (artist: Artist) => {
        setEditingId(artist.id);
        setEditForm({ name: artist.name, genre: artist.genre || '', bio: artist.bio || '' });
    };

    const handleSave = async (isManual: boolean = false) => {
        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        setSaving(true);

        try {
            const endpoint = isManual
                ? `${apiUrl}/api/admin/artists/${editingId}/manual`
                : `${apiUrl}/api/admin/artists/${editingId}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedArtist = { ...editForm, isManuallyEdited: isManual };
                setArtists(artists.map(a => a.id === editingId ? { ...a, ...updatedArtist } : a));
                setEditingId(null);
            }
        } catch {
            alert('Güncelleme başarısız');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" sanatçısını silmek istediğinize emin misiniz?`)) return;

        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        try {
            const response = await fetch(`${apiUrl}/api/admin/artists/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setArtists(artists.filter(a => a.id !== id));
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
                title="Sanatçı Yönetimi"
                description={`Toplam ${total} sanatçı`}
                icon="🎤"
            />

            {/* Search */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder="Sanatçı ara..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                icon={<span>🔍</span>}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Artists Table */}
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sanatçı</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tür</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Biyografi</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {artists.map((artist) => (
                                        <tr key={artist.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-4 py-4">
                                                {editingId === artist.id ? (
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="max-w-[200px]"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">{artist.name}</span>
                                                        {artist.isManuallyEdited && (
                                                            <Badge variant="warning" size="sm">✏️ Manuel</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {editingId === artist.id ? (
                                                    <Input
                                                        value={editForm.genre}
                                                        onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                                                        className="max-w-[150px]"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300">{artist.genre || '-'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-slate-400 text-sm truncate max-w-xs">
                                                {editingId === artist.id ? (
                                                    <Input
                                                        value={editForm.bio}
                                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                    />
                                                ) : (
                                                    artist.bio || '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {editingId === artist.id ? (
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
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(artist)}>✏️</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(artist.id, artist.name)}>🗑️</Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {artists.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                                                <span className="text-4xl block mb-3">📭</span>
                                                Sanatçı bulunamadı
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
