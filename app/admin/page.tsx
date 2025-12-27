'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, StatCard, Badge, Button, PageHeader, Skeleton } from './components/ui';

interface DashboardStats {
    totalEvents: number;
    totalArtists: number;
    totalVenues: number;
    activeEvents: number;
    expiredEvents: number;
    lastScrapedAt: string | null;
    categoryStats: Record<string, number>;
    platformStats: Record<string, number>;
    cityStats: Record<string, number>;
    eventsThisWeek: number;
    eventsThisMonth: number;
    totalViews: number;
    totalClicks: number;
    biletixOnlyEvents: number;
    bubiletOnlyEvents: number;
    sharedPlatformEvents: number;
}

interface LatestEvent {
    id: string;
    name: string;
    date: string;
    city: string;
    venueName: string;
    minPrice: number;
    platforms: string[];
    category: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [latestEvents, setLatestEvents] = useState<LatestEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [scraperLoading, setScraperLoading] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchData(token);
    }, [router]);

    const fetchData = async (token: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        try {
            const [statsRes, eventsRes] = await Promise.all([
                fetch(`${apiUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/admin/events?page=1&pageSize=5`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            setStats(await statsRes.json());
            const eventsData = await eventsRes.json();
            setLatestEvents(eventsData.items || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runScraper = async (platform: string) => {
        setScraperLoading(platform);
        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/admin/scraper/run`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ scraper: platform, queryType: 'general', queryValue: '' })
            });
            const data = await response.json();
            alert(data.message);
        } catch {
            alert('Scraper başlatılamadı');
        } finally {
            setScraperLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Dashboard"
                description="BiletLink yönetim paneline hoş geldiniz"
                icon="📊"
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => fetchData(localStorage.getItem('adminToken') || '')}>
                            🔄 Yenile
                        </Button>
                    </div>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Toplam Etkinlik" value={stats?.totalEvents || 0} icon="🎫" color="blue" />
                <StatCard title="Aktif Etkinlik" value={stats?.activeEvents || 0} icon="✅" color="green" />
                <StatCard title="Sanatçılar" value={stats?.totalArtists || 0} icon="🎤" color="purple" />
                <StatCard title="Mekanlar" value={stats?.totalVenues || 0} icon="🏛️" color="orange" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform Distribution */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                🌐 Platform Dağılımı
                            </h3>
                            <Badge variant="info">{stats?.activeEvents || 0} aktif</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {/* Biletix */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-slate-300 text-sm">Biletix</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-xs">
                                            %{stats?.activeEvents ? (((stats?.biletixOnlyEvents || 0) / stats.activeEvents) * 100).toFixed(1) : '0'}
                                        </span>
                                        <span className="text-white font-semibold">{stats?.biletixOnlyEvents || 0}</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                                        style={{ width: `${stats?.activeEvents ? ((stats?.biletixOnlyEvents || 0) / stats.activeEvents) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Bubilet */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-slate-300 text-sm">Bubilet</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-xs">
                                            %{stats?.activeEvents ? (((stats?.bubiletOnlyEvents || 0) / stats.activeEvents) * 100).toFixed(1) : '0'}
                                        </span>
                                        <span className="text-white font-semibold">{stats?.bubiletOnlyEvents || 0}</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                                        style={{ width: `${stats?.activeEvents ? ((stats?.bubiletOnlyEvents || 0) / stats.activeEvents) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Her İki Platform */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                        <span className="text-slate-300 text-sm">Her İki Platform</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-xs">
                                            %{stats?.activeEvents ? (((stats?.sharedPlatformEvents || 0) / stats.activeEvents) * 100).toFixed(1) : '0'}
                                        </span>
                                        <span className="text-white font-semibold">{stats?.sharedPlatformEvents || 0}</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                        style={{ width: `${stats?.activeEvents ? ((stats?.sharedPlatformEvents || 0) / stats.activeEvents) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {stats?.sharedPlatformEvents && stats.sharedPlatformEvents > 0 ? (
                            <p className="text-emerald-400 text-sm mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-2">
                                <span>✅</span>
                                <span><strong>{stats.sharedPlatformEvents}</strong> etkinlik her iki platformda eşleştirildi</span>
                            </p>
                        ) : (
                            <p className="text-slate-500 text-xs mt-6 pt-4 border-t border-slate-800/50">
                                ℹ️ Henüz platformlar arası eşleşen etkinlik bulunamadı.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">📈 Hızlı İstatistikler</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Bu Hafta</span>
                            <span className="text-2xl font-bold text-emerald-400">{stats?.eventsThisWeek || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Bu Ay</span>
                            <span className="text-2xl font-bold text-blue-400">{stats?.eventsThisMonth || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Görüntülenme</span>
                            <span className="text-2xl font-bold text-purple-400">{(stats?.totalViews || 0).toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Tıklama</span>
                            <span className="text-2xl font-bold text-orange-400">{(stats?.totalClicks || 0).toLocaleString('tr-TR')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Events */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">🆕 Son Eklenen Etkinlikler</h3>
                            <Link href="/admin/events">
                                <Button variant="ghost" size="sm">Tümünü Gör →</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-800/50">
                            {latestEvents.map((event) => (
                                <div key={event.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{event.name}</p>
                                        <p className="text-slate-500 text-sm truncate">{event.venueName} • {event.city}</p>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="flex gap-1">
                                            {event.platforms?.includes('Biletix') && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500" title="Biletix"></span>
                                            )}
                                            {event.platforms?.includes('Bubilet') && (
                                                <span className="w-2 h-2 rounded-full bg-purple-500" title="Bubilet"></span>
                                            )}
                                        </div>
                                        <span className="text-slate-400 text-sm whitespace-nowrap">{formatDate(event.date)}</span>
                                        <span className="text-slate-300 text-sm font-medium whitespace-nowrap">
                                            {event.minPrice ? `${event.minPrice}₺` : '-'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {latestEvents.length === 0 && (
                                <div className="px-6 py-8 text-center text-slate-500">
                                    Henüz etkinlik yok
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Scraper Control */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">🔄 Scraper Kontrolü</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-slate-500 text-xs">
                            Son çalışma: {stats?.lastScrapedAt ? new Date(stats.lastScrapedAt).toLocaleString('tr-TR') : 'Hiç çalışmadı'}
                        </p>

                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => runScraper('all')}
                                isLoading={scraperLoading === 'all'}
                            >
                                🌐 Tümünü Çalıştır
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => runScraper('biletix')}
                                    isLoading={scraperLoading === 'biletix'}
                                >
                                    Biletix
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => runScraper('bubilet')}
                                    isLoading={scraperLoading === 'bubilet'}
                                >
                                    Bubilet
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800/50">
                            <p className="text-slate-400 text-xs mb-3">Hızlı Şehir</p>
                            <div className="flex flex-wrap gap-2">
                                {['İstanbul', 'Ankara', 'İzmir'].map((city) => (
                                    <Button
                                        key={city}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => runScraper('all')}
                                    >
                                        {city}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category & City Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">🎭 Kategori Dağılımı</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {stats?.categoryStats && Object.entries(stats.categoryStats)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 10)
                                .map(([category, count]) => (
                                    <Badge key={category} variant="purple" size="md">
                                        {category}: {count}
                                    </Badge>
                                ))}
                            {(!stats?.categoryStats || Object.keys(stats.categoryStats).length === 0) && (
                                <p className="text-slate-500 text-sm">Veri yok</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Cities */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-white">🏙️ En Çok Etkinlik - Şehirler</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats?.cityStats && Object.entries(stats.cityStats).map(([city, count], index) => (
                                <div key={city} className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-slate-400 text-black' :
                                                index === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-slate-700 text-white'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <span className="text-slate-300 flex-1">{city}</span>
                                    <span className="text-white font-semibold">{count.toLocaleString('tr-TR')}</span>
                                </div>
                            ))}
                            {(!stats?.cityStats || Object.keys(stats.cityStats).length === 0) && (
                                <p className="text-slate-500 text-sm">Veri yok</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { href: '/admin/events', icon: '🎫', title: 'Etkinlik Yönetimi', desc: 'Etkinlikleri görüntüle ve düzenle', color: 'blue' },
                    { href: '/admin/artists', icon: '🎤', title: 'Sanatçı Yönetimi', desc: 'Sanatçıları görüntüle ve düzenle', color: 'purple' },
                    { href: '/admin/venues', icon: '🏛️', title: 'Mekan Yönetimi', desc: 'Mekanları görüntüle ve düzenle', color: 'orange' },
                    { href: '/admin/analytics', icon: '📊', title: 'Analytics', desc: 'Görüntülenme ve tıklama istatistikleri', color: 'green' },
                ].map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card hover className="h-full">
                            <CardContent>
                                <span className="text-3xl mb-3 block">{item.icon}</span>
                                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
