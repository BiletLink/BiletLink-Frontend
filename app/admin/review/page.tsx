"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewItem {
    id: string;
    type: 'match' | 'new_venue' | 'new_artist';
    score: number;
    data: any;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ReviewPage() {
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
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
                method: 'POST'
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
            <h1 className="text-2xl font-bold mb-6">İnceleme Bekleyenler</h1>

            {loading ? (
                <div>Yükleniyor...</div>
            ) : items.length === 0 ? (
                <div className="text-gray-500">İncelenecek öğe yok.</div>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="border p-4 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-2 py-1 text-xs rounded mb-2 ${item.type === 'match' ? 'bg-blue-100 text-blue-800' :
                                            item.type === 'new_venue' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {item.type === 'match' ? 'Eşleşme' : item.type === 'new_venue' ? 'Yeni Mekan' : 'Yeni Sanatçı'}
                                    </span>
                                    <div className="font-medium">Güven Skoru: %{item.score}</div>
                                    <pre className="mt-2 text-sm bg-gray-50 p-2 rounded overflow-auto max-w-xl">
                                        {JSON.stringify(item.data, null, 2)}
                                    </pre>
                                </div>
                                <div className="flex gap-2">
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
