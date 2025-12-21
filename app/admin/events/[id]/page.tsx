'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
    id: string;
    displayName: string;
    description: string;
    eventDate: string;
    category: string;
    status: string;
    imageUrl: string;
    isManuallyEdited: boolean;
    manuallyEditedAt: string | null;
    artist: { name: string } | null;
    venue: { name: string; city: string } | null;
}

export default function EditEvent() {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveType, setSaveType] = useState<'normal' | 'manual' | null>(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        date: '',
        imageUrl: '',
        status: 'Active'
    });
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchEvent(token);
    }, [router, params.id]);

    const fetchEvent = async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/admin/events/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();
            setEvent(data);
            setForm({
                name: data.displayName || data.name || '',
                description: data.description || '',
                category: data.category || '',
                date: data.eventDate ? data.eventDate.split('T')[0] : (data.date ? data.date.split('T')[0] : ''),
                imageUrl: data.imageUrl || '',
                status: data.status || 'Active'
            });
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent, isManual: boolean = false) => {
        e.preventDefault();
        setSaving(true);
        setSaveType(isManual ? 'manual' : 'normal');

        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const endpoint = isManual
                ? `${apiUrl}/api/admin/events/${params.id}/manual`
                : `${apiUrl}/api/admin/events/${params.id}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    date: form.date ? new Date(form.date).toISOString() : null,
                    status: form.status === 'Active' ? 0 : form.status === 'Expired' ? 1 : form.status === 'SoldOut' ? 2 : 3
                })
            });

            if (response.ok) {
                const message = isManual
                    ? 'Event manuel olarak güncellendi. Scraper bu alanları değiştirmeyecek.'
                    : 'Event güncellendi';
                alert(message);
                router.push('/admin/events');
            } else {
                alert('Güncelleme başarısız');
            }
        } catch (error) {
            alert('Bir hata oluştu');
        } finally {
            setSaving(false);
            setSaveType(null);
        }
    };

    const handleResetManual = async () => {
        if (!confirm('Manuel düzenleme bayrağını kaldırmak istediğinize emin misiniz? Scraper bu etkinliği tekrar güncelleyebilecek.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/admin/events/${params.id}/reset-manual`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Manuel düzenleme bayrağı kaldırıldı.');
                fetchEvent(token!);
            }
        } catch (error) {
            alert('Bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navbar */}
            <nav className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link href="/admin" className="text-xl font-bold text-white">🎛️ BiletLink Admin</Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/events" className="text-slate-400 hover:text-white">
                        ← Geri
                    </Link>
                    <h2 className="text-2xl font-bold text-white">Event Düzenle</h2>
                    {event?.isManuallyEdited && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full border border-amber-500/30">
                            ✏️ Manuel Düzenlenmiş
                        </span>
                    )}
                </div>

                {/* Manual Edit Warning */}
                {event?.isManuallyEdited && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                        <p className="text-amber-400 text-sm">
                            ⚠️ Bu etkinlik manuel olarak düzenlenmiş. Scraper bu etkinliğin isim, açıklama, kategori ve görsel alanlarını güncellemeyecek (sadece fiyat güncellenecek).
                            <br />
                            <span className="text-amber-500/70">
                                Manuel düzenleme tarihi: {event.manuallyEditedAt ? new Date(event.manuallyEditedAt).toLocaleString('tr-TR') : '-'}
                            </span>
                        </p>
                        <button
                            onClick={handleResetManual}
                            className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline"
                        >
                            Bayrağı Kaldır (Scraper güncelleyebilsin)
                        </button>
                    </div>
                )}

                <form onSubmit={(e) => handleSave(e, false)} className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ad</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Kategori</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Konser">Konser</option>
                                <option value="Tiyatro">Tiyatro</option>
                                <option value="Stand-Up">Stand-Up</option>
                                <option value="Festival">Festival</option>
                                <option value="Spor">Spor</option>
                                <option value="Parti">Parti</option>
                                <option value="Etkinlik">Etkinlik</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Durum</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="SoldOut">SoldOut</option>
                                <option value="Removed">Removed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tarih</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Görsel URL</label>
                        <input
                            type="text"
                            value={form.imageUrl}
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Read-only Info */}
                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm">
                            <strong>Sanatçı:</strong> {event?.artist?.name || '-'} |
                            <strong> Mekan:</strong> {event?.venue?.name || '-'} ({event?.venue?.city || '-'})
                        </p>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving && saveType === 'normal' ? 'Kaydediliyor...' : '💾 Kaydet'}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSave(e, true)}
                            disabled={saving}
                            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            title="Manuel kaydet: Scraper bu değişikliklerin üzerine yazmayacak"
                        >
                            {saving && saveType === 'manual' ? 'Kaydediliyor...' : '✏️ Manuel Kaydet'}
                        </button>
                        <Link
                            href="/admin/events"
                            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            İptal
                        </Link>
                    </div>
                    <p className="text-xs text-slate-500">
                        💡 <strong>Manuel Kaydet:</strong> Bu seçenek ile kaydettiğinizde scraper bu etkinliğin isim, açıklama, kategori ve görsel alanlarını değiştirmeyecek.
                    </p>
                </form>
            </main>
        </div>
    );
}

