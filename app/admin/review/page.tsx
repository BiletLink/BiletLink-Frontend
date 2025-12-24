"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewItem {
    id: string;
    eventSourceId: string;
    sourceTitle: string;
    sourcePlatform: string;
    sourceUrl?: string;
    suggestedMasterEventId?: string;
    suggestedMasterEventTitle?: string;
    suggestedMasterEventDate?: string;
    suggestedMasterEventVenue?: string;
    matchScore: number;
    status: string;
    createdAt: string;
}

export default function ReviewPage() {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${id}/${action}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                fetchReviews(); // Refresh list
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">İnceleme Bekleyenler</h1>
            {total > 0 && <p className="text-gray-500 mb-6">{total} adet inceleme bekliyor</p>}

            {loading ? (
                <div>Yükleniyor...</div>
            ) : items.length === 0 ? (
                <div className="text-gray-500">İncelenecek öğe yok.</div>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="border p-4 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                            {item.sourcePlatform}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Eşleşme Skoru: %{Math.round(item.matchScore)}
                                        </span>
                                    </div>
                                    <div className="font-medium text-lg">{item.sourceTitle}</div>
                                    {item.suggestedMasterEventTitle && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded">
                                            <div className="text-sm text-gray-600">Önerilen eşleşme:</div>
                                            <div className="font-medium">{item.suggestedMasterEventTitle}</div>
                                            {item.suggestedMasterEventVenue && (
                                                <div className="text-sm text-gray-500">{item.suggestedMasterEventVenue}</div>
                                            )}
                                            {item.suggestedMasterEventDate && (
                                                <div className="text-sm text-gray-500">
                                                    {new Date(item.suggestedMasterEventDate).toLocaleDateString('tr-TR')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {item.sourceUrl && (
                                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                                            Kaynağa git →
                                        </a>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleAction(item.id, 'approve')}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Onayla
                                    </button>
                                    <button
                                        onClick={() => handleAction(item.id, 'reject')}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Reddet
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

