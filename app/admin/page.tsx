'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
    totalEvents: number;
    totalArtists: number;
    totalVenues: number;
    activeEvents: number;
    expiredEvents: number;
    lastScrapedAt: string | null;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [scraperLoading, setScraperLoading] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchStats(token);
    }, [router]);

    const fetchStats = async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const runScraper = async (platform: string, queryType: string = 'general', queryValue: string = '') => {
        setScraperLoading(platform);
        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/admin/scraper/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scraper: platform,
                    queryType,
                    queryValue
                })
            });

            const data = await response.json();
            if (data.workflowUrl) {
                alert(`${data.message}\n\nGitHub Actions: ${data.workflowUrl}`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Scraper başlatılamadı');
        } finally {
            setScraperLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Hiç çalışmadı';
        return new Date(dateStr).toLocaleString('tr-TR');
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
                            <h1 className="text-xl font-bold text-white">🎛️ BiletLink Admin</h1>
                            <div className="flex gap-4">
                                <Link href="/admin" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">
                                    Dashboard
                                </Link>
                                <Link href="/admin/events" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    🎫 Events
                                </Link>
                                <Link href="/admin/artists" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    🎤 Artists
                                </Link>
                                <Link href="/admin/venues" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    🏛️ Venues
                                </Link>
                                <Link href="/admin/analytics" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 transition">
                                    📊 Analytics
                                </Link>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-300 hover:text-white text-sm"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-white mb-8">Dashboard</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Toplam Event"
                        value={stats?.totalEvents || 0}
                        icon="🎫"
                        color="blue"
                    />
                    <StatCard
                        title="Aktif Event"
                        value={stats?.activeEvents || 0}
                        icon="✅"
                        color="green"
                    />
                    <StatCard
                        title="Sanatçılar"
                        value={stats?.totalArtists || 0}
                        icon="🎤"
                        color="purple"
                    />
                    <StatCard
                        title="Mekanlar"
                        value={stats?.totalVenues || 0}
                        icon="🏛️"
                        color="orange"
                    />
                </div>

                {/* Scraper Control */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">🔄 Scraper Kontrolü</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Son çalışma: {formatDate(stats?.lastScrapedAt || null)}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Platform Seçimi */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Platform</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                id="scraper-platform"
                                defaultValue="all"
                            >
                                <option value="all">🌐 Tümü</option>
                                <option value="biletix">🎫 Biletix</option>
                                <option value="bubilet">🎟️ Bubilet</option>
                            </select>
                        </div>

                        {/* Sorgu Tipi */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Sorgu Tipi</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                id="scraper-query-type"
                                defaultValue="general"
                            >
                                <option value="general">📋 Genel (Tüm Etkinlikler)</option>
                                <option value="city">🏙️ Şehir Bazlı</option>
                                <option value="venue">🏛️ Mekan Bazlı</option>
                                <option value="artist">🎤 Sanatçı Bazlı</option>
                            </select>
                        </div>

                        {/* Sorgu Değeri */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Sorgu Değeri</label>
                            <input
                                type="text"
                                id="scraper-query-value"
                                placeholder="Örn: İstanbul, Volkswagen Arena..."
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                            />
                        </div>

                        {/* Çalıştır Butonu */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    const platform = (document.getElementById('scraper-platform') as HTMLSelectElement)?.value || 'all';
                                    const queryType = (document.getElementById('scraper-query-type') as HTMLSelectElement)?.value || 'general';
                                    const queryValue = (document.getElementById('scraper-query-value') as HTMLInputElement)?.value || '';
                                    runScraper(platform, queryType, queryValue);
                                }}
                                disabled={scraperLoading !== null}
                                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition font-semibold"
                            >
                                {scraperLoading ? '⏳ Çalışıyor...' : '▶️ Çalıştır'}
                            </button>
                        </div>
                    </div>

                    {/* Hızlı Erişim Butonları */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
                        <span className="text-slate-400 text-sm mr-2">Hızlı:</span>
                        <button
                            onClick={() => runScraper('all', 'general', '')}
                            disabled={scraperLoading !== null}
                            className="px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 disabled:opacity-50"
                        >
                            🌐 Tümü
                        </button>
                        <button
                            onClick={() => runScraper('biletix', 'general', '')}
                            disabled={scraperLoading !== null}
                            className="px-3 py-1 bg-blue-600/30 text-blue-400 rounded text-sm hover:bg-blue-600/50 disabled:opacity-50"
                        >
                            Biletix
                        </button>
                        <button
                            onClick={() => runScraper('bubilet', 'general', '')}
                            disabled={scraperLoading !== null}
                            className="px-3 py-1 bg-purple-600/30 text-purple-400 rounded text-sm hover:bg-purple-600/50 disabled:opacity-50"
                        >
                            Bubilet
                        </button>
                        <button
                            onClick={() => runScraper('all', 'city', 'İstanbul')}
                            disabled={scraperLoading !== null}
                            className="px-3 py-1 bg-orange-600/30 text-orange-400 rounded text-sm hover:bg-orange-600/50 disabled:opacity-50"
                        >
                            🏙️ İstanbul
                        </button>
                        <button
                            onClick={() => runScraper('all', 'city', 'Ankara')}
                            disabled={scraperLoading !== null}
                            className="px-3 py-1 bg-orange-600/30 text-orange-400 rounded text-sm hover:bg-orange-600/50 disabled:opacity-50"
                        >
                            🏙️ Ankara
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/events" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition group">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400">🎫 Events Yönetimi</h3>
                        <p className="text-slate-400 text-sm">Etkinlikleri görüntüle, düzenle veya sil</p>
                    </Link>
                    <Link href="/admin/artists" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition group">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400">🎤 Artists Yönetimi</h3>
                        <p className="text-slate-400 text-sm">Sanatçıları görüntüle ve düzenle</p>
                    </Link>
                    <Link href="/admin/venues" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition group">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400">🏛️ Venues Yönetimi</h3>
                        <p className="text-slate-400 text-sm">Mekanları görüntüle ve düzenle</p>
                    </Link>
                    <Link href="/admin/analytics" className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 transition group">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400">📊 Analytics</h3>
                        <p className="text-slate-400 text-sm">Görüntülenme, tıklama ve popülerlik istatistikleri</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600'
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
