'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, Badge, Button, PageHeader, StatCard, Skeleton } from '../components/ui';

interface AnalyticsSummary {
    totalViews: number;
    totalClicks: number;
    totalEvents: number;
    activeEvents: number;
    clickThroughRate: number;
    averageViewsPerEvent: number;
}

interface PopularEvent {
    id: string;
    name: string;
    date: string;
    category: string;
    city: string;
    artistName: string;
    viewCount: number;
    clickCount: number;
    clickThroughRate: number;
}

interface CategoryStats {
    category: string;
    eventCount: number;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
}

interface CityStats {
    city: string;
    eventCount: number;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
}

export default function AnalyticsDashboard() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [popularByViews, setPopularByViews] = useState<PopularEvent[]>([]);
    const [popularByClicks, setPopularByClicks] = useState<PopularEvent[]>([]);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [cityStats, setCityStats] = useState<CityStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'views' | 'clicks'>('views');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchAllData(token);
    }, [router]);

    const fetchAllData = async (token: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [summaryRes, viewsRes, clicksRes, categoryRes, cityRes] = await Promise.all([
                fetch(`${apiUrl}/api/analytics/summary`, { headers }),
                fetch(`${apiUrl}/api/analytics/popular/views?limit=10`, { headers }),
                fetch(`${apiUrl}/api/analytics/popular/clicks?limit=10`, { headers }),
                fetch(`${apiUrl}/api/analytics/by-category`, { headers }),
                fetch(`${apiUrl}/api/analytics/by-city`, { headers })
            ]);

            if (summaryRes.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            setSummary(await summaryRes.json());
            setPopularByViews(await viewsRes.json());
            setPopularByClicks(await clicksRes.json());
            setCategoryStats(await categoryRes.json());
            setCityStats(await cityRes.json());
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>BiletLink Analytics Raporu</title>
                    <style>
                        body { font-family: system-ui, sans-serif; padding: 40px; color: #333; max-width: 1000px; margin: 0 auto; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                        .stat-card { background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; }
                        .stat-value { font-size: 32px; font-weight: bold; color: #059669; }
                        .stat-label { color: #6b7280; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f3f4f6; font-weight: 600; }
                        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>📊 BiletLink Analytics Raporu</h1>
                    <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                    
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-value">${(summary?.totalViews || 0).toLocaleString('tr-TR')}</div>
                            <div class="stat-label">Toplam Görüntülenme</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${(summary?.totalClicks || 0).toLocaleString('tr-TR')}</div>
                            <div class="stat-label">Toplam Tıklama</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary?.clickThroughRate || 0}%</div>
                            <div class="stat-label">Tıklama Oranı (CTR)</div>
                        </div>
                    </div>
                    
                    <h2>🏆 En Popüler Etkinlikler</h2>
                    <table>
                        <tr><th>Etkinlik</th><th>Şehir</th><th>Görüntüleme</th><th>Tıklama</th><th>CTR</th></tr>
                        ${popularByViews.slice(0, 10).map(e => `
                            <tr>
                                <td>${e.name}</td>
                                <td>${e.city}</td>
                                <td>${e.viewCount.toLocaleString('tr-TR')}</td>
                                <td>${e.clickCount.toLocaleString('tr-TR')}</td>
                                <td>${e.clickThroughRate}%</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <div class="footer">
                        <p>Bu rapor BiletLink Admin Paneli tarafından otomatik oluşturulmuştur.</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <Skeleton className="h-80 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analytics Dashboard"
                description="Görüntülenme ve tıklama istatistikleri"
                icon="📊"
                actions={
                    <Button variant="success" onClick={exportReport}>
                        📄 PDF Rapor Al
                    </Button>
                }
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Görüntülenme" value={summary?.totalViews || 0} icon="👁️" color="blue" />
                <StatCard title="Tıklama" value={summary?.totalClicks || 0} icon="🖱️" color="green" />
                <StatCard title="CTR" value={`${summary?.clickThroughRate || 0}%`} icon="📈" color="purple" />
                <StatCard title="Toplam Etkinlik" value={summary?.totalEvents || 0} icon="🎫" color="orange" />
                <StatCard title="Aktif Etkinlik" value={summary?.activeEvents || 0} icon="✅" color="green" />
                <StatCard title="Ort. Görüntüleme" value={summary?.averageViewsPerEvent || 0} icon="📊" color="blue" />
            </div>

            {/* Popular Events */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">🏆 En Popüler Etkinlikler</h3>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'views' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveTab('views')}
                            >
                                Görüntüleme
                            </Button>
                            <Button
                                variant={activeTab === 'clicks' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveTab('clicks')}
                            >
                                Tıklama
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800/50 bg-slate-800/30">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Etkinlik</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Şehir</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">👁️ Görüntüleme</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">🖱️ Tıklama</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">📈 CTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {(activeTab === 'views' ? popularByViews : popularByClicks).map((event, i) => (
                                    <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <Link href={`/event/${event.id}`} className="hover:underline">
                                                <div className="text-white font-medium">{event.name}</div>
                                                <div className="text-slate-500 text-sm">{event.artistName}</div>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{event.city}</td>
                                        <td className="px-4 py-3 text-right text-white font-semibold">{event.viewCount.toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right text-blue-400 font-semibold">{event.clickCount.toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Badge
                                                variant={event.clickThroughRate >= 10 ? 'success' : event.clickThroughRate >= 5 ? 'warning' : 'default'}
                                                size="sm"
                                            >
                                                {event.clickThroughRate}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Category & City Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Stats */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">📂 Kategori Bazlı</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categoryStats.slice(0, 8).map((cat) => (
                                <div key={cat.category} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="info" size="md">{cat.category}</Badge>
                                        <span className="text-slate-500 text-sm">{cat.eventCount} etkinlik</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-300">👁️ {cat.totalViews.toLocaleString('tr-TR')}</span>
                                        <span className="text-blue-400">🖱️ {cat.totalClicks.toLocaleString('tr-TR')}</span>
                                        <Badge variant={cat.clickThroughRate >= 5 ? 'success' : 'default'} size="sm">
                                            {cat.clickThroughRate}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* City Stats */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">🏙️ Şehir Bazlı</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cityStats.slice(0, 8).map((city) => (
                                <div key={city.city} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="purple" size="md">{city.city}</Badge>
                                        <span className="text-slate-500 text-sm">{city.eventCount} etkinlik</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-300">👁️ {city.totalViews.toLocaleString('tr-TR')}</span>
                                        <span className="text-blue-400">🖱️ {city.totalClicks.toLocaleString('tr-TR')}</span>
                                        <Badge variant={city.clickThroughRate >= 5 ? 'success' : 'default'} size="sm">
                                            {city.clickThroughRate}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
