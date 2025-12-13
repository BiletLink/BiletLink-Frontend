'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Artist {
    id: string;
    name: string;
    genre: string;
    bio: string;
    imageUrl: string;
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

    const handleSave = async () => {
        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        try {
            const response = await fetch(`${apiUrl}/api/admin/artists/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                setArtists(artists.map(a => a.id === editingId ? { ...a, ...editForm } : a));
                setEditingId(null);
            }
        } catch (error) {
            alert('Güncelleme başarısız');
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
        } catch (error) {
            alert('Bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <nav className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/admin" className="text-xl font-bold text-white">🎛️ BiletLink Admin</Link>
                            <div className="flex gap-4">
                                <Link href="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">Dashboard</Link>
                                <Link href="/admin/events" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">🎫 Events</Link>
                                <Link href="/admin/artists" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">🎤 Artists</Link>
                                <Link href="/admin/venues" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">🏛️ Venues</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">🎤 Artists ({total})</h2>
                    <input
                        type="text"
                        placeholder="Sanatçı ara..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tür</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bio</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {artists.map((artist) => (
                                    <tr key={artist.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-4">
                                            {editingId === artist.id ? (
                                                <input
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                                                />
                                            ) : (
                                                <span className="text-white font-medium">{artist.name}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {editingId === artist.id ? (
                                                <input
                                                    value={editForm.genre}
                                                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                                                    className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                                                />
                                            ) : (
                                                <span className="text-slate-300">{artist.genre || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-slate-400 text-sm truncate max-w-xs">
                                            {artist.bio || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {editingId === artist.id ? (
                                                <>
                                                    <button onClick={handleSave} className="text-green-400 hover:text-green-300 mr-2">✓</button>
                                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300">✗</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(artist)} className="text-blue-400 hover:text-blue-300 mr-4">✏️</button>
                                                    <button onClick={() => handleDelete(artist.id, artist.name)} className="text-red-400 hover:text-red-300">🗑️</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50">← Önceki</button>
                        <span className="text-slate-400 px-4">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50">Sonraki →</button>
                    </div>
                )}
            </main>
        </div>
    );
}
