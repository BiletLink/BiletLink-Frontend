"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SessionReview {
    id: string;
    sessionDate: string;
    venueName?: string;
    venueCity?: string;
    minPrice?: number;
    isAvailable: boolean;
    performanceUrl?: string;
    suggestedMasterEventId?: string;
    suggestedMasterEventTitle?: string;
    matchScore?: number;
}

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
    sessions: SessionReview[];
    bestSessionIndex?: number;
}

export default function ReviewPage() {
    const router = useRouter();
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const pageSize = 20;

    const [autoApproveThreshold, setAutoApproveThreshold] = useState(66);
    const [isAutoApproving, setIsAutoApproving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchReviews(page);
    }, [page, router]);

    const getHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchReviews = async (currentPage: number) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews?page=${currentPage}&pageSize=${pageSize}`, {
                headers: getHeaders()
            });

            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
            } else {
                console.error('Fetch error:', await res.text());
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoApprove = async () => {
        if (!confirm(`%${autoApproveThreshold} ve üzeri puana sahip tüm eşleşmeleri onaylamak istediğinize emin misiniz?`)) return;

        setIsAutoApproving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/auto-approve?threshold=${autoApproveThreshold}`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchReviews(1); // Refresh list
            } else {
                alert(`İşlem başarısız: ${data.message || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Auto approve failed', error);
            alert('Bağlantı hatası: Sunucuya ulaşılamadı');
        } finally {
            setIsAutoApproving(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${id}/${action}`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (res.status === 401) {
                router.push('/admin/login');
                return;
            }

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
                setTotal(prev => prev - 1);
            } else {
                alert(`İşlem başarısız: ${data.message || res.statusText}`);
            }
        } catch (error) {
            console.error('Action failed', error);
            alert('Bağlantı hatası: İşlem gerçekleştirilemedi');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">İnceleme Bekleyenler</h1>
                    <p className="text-gray-500">
                        {total} adet inceleme bekliyor
                        {totalPages > 1 && ` • Sayfa ${page}/${totalPages}`}
                    </p>
                </div>

                {/* Auto Approve Controls */}
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex flex-col">
                        <label className="text-xs text-blue-700 font-medium mb-1">Otomatik Onay (% Min)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={autoApproveThreshold}
                            onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
                            className="w-20 px-2 py-1 border rounded text-sm"
                        />
                    </div>
                    <button
                        onClick={handleAutoApprove}
                        disabled={isAutoApproving || loading}
                        className="h-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                    >
                        {isAutoApproving ? 'İşleniyor...' : 'Otomatik Onayla'}
                    </button>
                </div>
            </div>

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
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                        {item.sourcePlatform}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Eşleşme Skoru: %{Math.round(item.matchScore)}
                                    </span>
                                    {item.sessions && item.sessions.length > 0 && (
                                        <span className="inline-block px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                                            {item.sessions.length} Seans
                                        </span>
                                    )}
                                </div>

                                {/* Main comparison grid */}
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
                                            <div className="text-sm text-gray-600">📅 {formatDate(item.sourceDate)}</div>
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
                                                    <div className="text-sm text-gray-600">📅 {formatDate(item.suggestedMasterEventDate)}</div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-400 italic">Eşleşme bulunamadı</div>
                                        )}
                                    </div>
                                </div>

                                {/* Sessions Section */}
                                {item.sessions && item.sessions.length > 0 && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                                        >
                                            <span>{expandedItems.has(item.id) ? '▼' : '▶'}</span>
                                            <span>Seansları Göster ({item.sessions.length})</span>
                                        </button>

                                        {expandedItems.has(item.id) && (
                                            <div className="mt-3 space-y-2">
                                                {item.sessions.map((session, index) => (
                                                    <div
                                                        key={session.id}
                                                        className={`p-3 rounded-lg border ${index === item.bestSessionIndex ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {index === item.bestSessionIndex && (
                                                                <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded">⭐ En İyi Eşleşme</span>
                                                            )}
                                                            <span className={`text-xs px-2 py-0.5 rounded ${session.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {session.isAvailable ? 'Satışta' : 'Tükendi'}
                                                            </span>
                                                            {session.matchScore && (
                                                                <span className="text-xs text-gray-500">Skor: %{Math.round(session.matchScore)}</span>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <div className="font-medium text-gray-800">📅 {formatDate(session.sessionDate)}</div>
                                                                {session.venueName && <div className="text-gray-600">📍 {session.venueName}</div>}
                                                                {session.venueCity && <div className="text-gray-600">🏙️ {session.venueCity}</div>}
                                                                {session.minPrice && <div className="text-gray-600">💰 {session.minPrice} TL</div>}
                                                            </div>
                                                            <div>
                                                                {session.suggestedMasterEventTitle ? (
                                                                    <div className="text-green-700">
                                                                        → {session.suggestedMasterEventTitle}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-400 italic">Eşleşme yok</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {session.performanceUrl && (
                                                            <a href={session.performanceUrl} target="_blank" rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                                                                Seans sayfasına git →
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer with actions */}
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
