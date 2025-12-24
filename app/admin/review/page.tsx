"use client";

import { useEffect, useState } from 'react';

interface ReviewItem {
    id: string;
    eventSourceId: string;
    sourceTitle: string;
    sourcePlatform: string;
    sourceUrl?: string;
    sourceVenue?: string;
    sourceCity?: string;
    sourceDate?: string;
    suggestedMasterEventId?: string;
    suggestedMasterEventTitle?: string;
    suggestedMasterEventDate?: string;
    suggestedMasterEventVenue?: string;
    suggestedMasterEventCity?: string;
    matchScore: number;
    status: string;
    createdAt: string;
}

export default function ReviewPage() {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const pageSize = 20;

    useEffect(() => {
        fetchReviews(page);
    }, [page]);

    const fetchReviews = async (currentPage: number) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews?page=${currentPage}&pageSize=${pageSize}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${id}/${action}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                // Remove the item from the list immediately for visual feedback
                setItems(prev => prev.filter(item => item.id !== id));
                setTotal(prev => prev - 1);
            } else {
                alert('İşlem başarısız oldu');
            }
        } catch (error) {
            console.error('Action failed', error);
            alert('Bağlantı hatası');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">İnceleme Bekleyenler</h1>
            <p className="text-gray-500 mb-6">
                {total} adet inceleme bekliyor
                {totalPages > 1 && ` • Sayfa ${page}/${totalPages}`}
            </p>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500">Yükleniyor...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <div>İncelenecek öğe yok.</div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <div key={item.id} className={`border p-4 rounded-lg bg-white shadow-sm transition-opacity ${actionLoading === item.id ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                        {item.sourcePlatform}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Eşleşme Skoru: %{Math.round(item.matchScore)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {/* Kaynak Event */}
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xs text-blue-600 font-medium mb-1">📥 Gelen Kaynak</div>
                                        <div className="font-semibold text-gray-900">{item.sourceTitle}</div>
                                        {item.sourceVenue && (
                                            <div className="text-sm text-gray-600 mt-1">📍 {item.sourceVenue}</div>
                                        )}
                                        {item.sourceCity && (
                                            <div className="text-sm text-gray-600">🏙️ {item.sourceCity}</div>
                                        )}
                                        {item.sourceDate && (
                                            <div className="text-sm text-gray-600">
                                                📅 {new Date(item.sourceDate).toLocaleDateString('tr-TR')} {new Date(item.sourceDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Önerilen Eşleşme */}
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-xs text-green-600 font-medium mb-1">✅ Önerilen Eşleşme</div>
                                        {item.suggestedMasterEventTitle ? (
                                            <>
                                                <div className="font-semibold text-gray-900">{item.suggestedMasterEventTitle}</div>
                                                {item.suggestedMasterEventVenue && (
                                                    <div className="text-sm text-gray-600 mt-1">📍 {item.suggestedMasterEventVenue}</div>
                                                )}
                                                {item.suggestedMasterEventCity && (
                                                    <div className="text-sm text-gray-600">🏙️ {item.suggestedMasterEventCity}</div>
                                                )}
                                                {item.suggestedMasterEventDate && (
                                                    <div className="text-sm text-gray-600">
                                                        📅 {new Date(item.suggestedMasterEventDate).toLocaleDateString('tr-TR')} {new Date(item.suggestedMasterEventDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-400 italic">Eşleşme bulunamadı</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t pt-3">
                                    {item.sourceUrl ? (
                                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 text-sm hover:underline">
                                            Kaynağa git →
                                        </a>
                                    ) : <div />}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(item.id, 'approve')}
                                            disabled={actionLoading === item.id}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === item.id ? '...' : 'Onayla'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.id, 'reject')}
                                            disabled={actionLoading === item.id}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === item.id ? '...' : 'Reddet'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Önceki
                            </button>
                            <span className="text-gray-600">
                                Sayfa {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
