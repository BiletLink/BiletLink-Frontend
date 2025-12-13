'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
                        .stat-value { font-size: 36px; font-weight: bold; color: #059669; }
                        .stat-label { color: #6b7280; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f3f4f6; font-weight: bold; }
                        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>📊 BiletLink Analytics Raporu</h1>
                    <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                    
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-value">${summary?.totalViews || 0}</div>
                            <div class="stat-label">Toplam Görüntülenme</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary?.totalClicks || 0}</div>
                            <div class="stat-label">Toplam Tıklama</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${summary?.clickThroughRate || 0}%</div>
                            <div class="stat-label">Tıklama Oranı</div>
                        </div>
                    </div>
                    
                    <h2>🏆 En Popüler Etkinlikler (Görüntülenme)</h2>
                    <table>
                        <tr><th>Etkinlik</th><th>Şehir</th><th>Görüntüleme</th><th>Tıklama</th><th>CTR</th></tr>
                        ${popularByViews.map(e => `
                            <tr>
                                <td>${e.name}</td>
                                <td>${e.city}</td>
                                <td>${e.viewCount}</td>
                                <td>${e.clickCount}</td>
                                <td>${e.clickThroughRate}%</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <h2>📂 Kategori Bazlı İstatistikler</h2>
                    <table>
                        <tr><th>Kategori</th><th>Etkinlik</th><th>Görüntüleme</th><th>Tıklama</th><th>CTR</th></tr>
                        ${categoryStats.map(c => `
                            <tr>
                                <td>${c.category}</td>
                                <td>${c.eventCount}</td>
                                <td>${c.totalViews}</td>
                                <td>${c.totalClicks}</td>
                                <td>${c.clickThroughRate}%</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <h2>🏙️ Şehir Bazlı İstatistikler</h2>
                    <table>
                        <tr><th>Şehir</th><th>Etkinlik</th><th>Görüntüleme</th><th>Tıklama</th><th>CTR</th></tr>
                        ${cityStats.map(c => `
                            <tr>
                                <td>${c.city}</td>
                                <td>${c.eventCount}</td>
                                <td>${c.totalViews}</td>
                                <td>${c.totalClicks}</td>
                                <td>${c.clickThroughRate}%</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <div class="footer">
                        <p>Bu rapor BiletLink Admin Paneli tarafından oluşturulmuştur.</p>
                        <p>© 2025 BiletLink</p>
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
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link href="/admin" className="text-xl font-bold text-white">🎛️ BiletLink Admin</Link>
                            <div className="flex gap-4">
                                <Link href="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">Dashboard</Link>
                                <Link href="/admin/events" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">🎫 Events</Link>
                                <Link href="/admin/artists" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">🎤 Artists</Link>
                                <Link href="/admin/venues" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">🏛️ Venues</Link>
                                <Link href="/admin/analytics" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">📊 Analytics</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>
                    <button
                        onClick={exportReport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                        📄 PDF Rapor Al
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard label="Toplam Görüntüleme" value={summary?.totalViews || 0} icon="👁️" />
                    <StatCard label="Toplam Tıklama" value={summary?.totalClicks || 0} icon="🖱️" />
                    <StatCard label="Tıklama Oranı" value={`${summary?.clickThroughRate || 0}%`} icon="📈" />
                    <StatCard label="Toplam Etkinlik" value={summary?.totalEvents || 0} icon="🎫" />
                    <StatCard label="Aktif Etkinlik" value={summary?.activeEvents || 0} icon="✅" />
                    <StatCard label="Ort. Görüntüleme" value={summary?.averageViewsPerEvent || 0} icon="📊" />
                </div>

                {/* Popular Events */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">🏆 En Popüler Etkinlikler</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('views')}
                                className={`px-3 py-1 rounded text-sm ${activeTab === 'views' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                            >
                                Görüntüleme
                            </button>
                            <button
                                onClick={() => setActiveTab('clicks')}
                                className={`px-3 py-1 rounded text-sm ${activeTab === 'clicks' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                            >
                                Tıklama
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-400 text-sm border-b border-slate-700">
                                    <th className="text-left py-3 px-2">#</th>
                                    <th className="text-left py-3 px-2">Etkinlik</th>
                                    <th className="text-left py-3 px-2">Şehir</th>
                                    <th className="text-right py-3 px-2">👁️ Görüntüleme</th>
                                    <th className="text-right py-3 px-2">🖱️ Tıklama</th>
                                    <th className="text-right py-3 px-2">📈 CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'views' ? popularByViews : popularByClicks).map((event, i) => (
                                    <tr key={event.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                        <td className="py-3 px-2 text-slate-500">{i + 1}</td>
                                        <td className="py-3 px-2">
                                            <div className="text-white font-medium">{event.name}</div>
                                            <div className="text-slate-400 text-sm">{event.artistName}</div>
                                        </td>
                                        <td className="py-3 px-2 text-slate-300">{event.city}</td>
                                        <td className="py-3 px-2 text-right text-white font-semibold">{event.viewCount}</td>
                                        <td className="py-3 px-2 text-right text-blue-400 font-semibold">{event.clickCount}</td>
                                        <td className="py-3 px-2 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${event.clickThroughRate >= 10 ? 'bg-green-500/20 text-green-400' :
                                                    event.clickThroughRate >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {event.clickThroughRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category & City Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Stats */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">📂 Kategori Bazlı</h3>
                        <div className="space-y-3">
                            {categoryStats.slice(0, 8).map((cat) => (
                                <div key={cat.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">{cat.category}</span>
                                        <span className="text-slate-400 text-sm">{cat.eventCount} etkinlik</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-300">👁️ {cat.totalViews}</span>
                                        <span className="text-blue-400">🖱️ {cat.totalClicks}</span>
                                        <span className="text-green-400">{cat.clickThroughRate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* City Stats */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">🏙️ Şehir Bazlı</h3>
                        <div className="space-y-3">
                            {cityStats.slice(0, 8).map((city) => (
                                <div key={city.city} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">{city.city}</span>
                                        <span className="text-slate-400 text-sm">{city.eventCount} etkinlik</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-300">👁️ {city.totalViews}</span>
                                        <span className="text-blue-400">🖱️ {city.totalClicks}</span>
                                        <span className="text-green-400">{city.clickThroughRate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
    return (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <span className="text-slate-400 text-xs">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
    );
}
