'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr';

// ==================== INTERFACES ====================

interface QueueItem {
    id: string;
    scraperName: string;
    city: string;
    priority: number;
    status: string;
    addedBy: string;
    createdAt: string;
    startedAt?: string;
}

interface LogItem {
    id: string;
    scraperName: string;
    city: string;
    status: string;
    eventsFound: number;
    eventsCreated: number;
    eventsUpdated: number;
    durationSeconds: number;
    message: string;
    createdAt: string;
    totalEvents?: number;
    processedEvents?: number;
    scrapedEventsJson?: string;
}

interface ProgressUpdate {
    scraperId: string;
    scraperName: string;
    city: string;
    totalEvents: number;
    processedEvents: number;
    currentEvent?: string;
    percentage: number;
}

interface ScrapedEventDetail {
    title: string;
    status: string;
    price?: number;
}

interface ScraperStatus {
    isRunning: boolean;
    currentJob: {
        scraperName: string;
        city: string;
        startedAt: string;
    } | null;
    pendingCount: number;
    todayStats: {
        totalRuns: number;
        totalEvents: number;
        totalCreated: number;
        totalUpdated: number;
        errors: number;
    };
}

interface RadioPlaylist {
    id: string;
    name: string;
    scraperType: string;
    cities: string[];
    isActive: boolean;
    cycleCount: number;
    currentCityIndex: number;
    currentScraper: string;
    lastCycleStart?: string;
    lastJobCompleted?: string;
}

// All Turkish cities for selection
const ALL_CITIES = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
    'Konya', 'Gaziantep', 'Mersin', 'Kayseri', 'Eskişehir',
    'Samsun', 'Denizli', 'Trabzon', 'Kocaeli', 'Sakarya',
    'Muğla', 'Balıkesir', 'Tekirdağ', 'Manisa', 'Hatay',
    'Malatya', 'Erzurum', 'Diyarbakır', 'Şanlıurfa', 'Van',
    'Batman', 'Mardin', 'Elazığ', 'Kars', 'Artvin', 'Rize',
    'Giresun', 'Ordu', 'Sinop', 'Kastamonu', 'Çorum', 'Tokat',
    'Amasya', 'Sivas', 'Nevşehir', 'Aksaray', 'Niğde', 'Karaman',
    'Bolu', 'Düzce', 'Zonguldak', 'Bartın', 'Karabük', 'Çankırı',
    'Edirne', 'Kırklareli', 'Çanakkale', 'Aydın', 'Isparta', 'Burdur'
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';

export default function ScrapersPage() {
    const router = useRouter();
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [currentJob, setCurrentJob] = useState<QueueItem | null>(null);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [status, setStatus] = useState<ScraperStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    // Radio Mode state
    const [radioPlaylist, setRadioPlaylist] = useState<RadioPlaylist | null>(null);
    const [radioLoading, setRadioLoading] = useState(false);
    const [showPlaylistEditor, setShowPlaylistEditor] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<{
        name: string;
        scraperType: string;
        cities: string[];
    }>({
        name: 'Ana Liste',
        scraperType: 'Both',
        cities: ['İstanbul', 'Ankara', 'İzmir']
    });

    // Add to queue form state
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedScraper, setSelectedScraper] = useState('Biletix');
    const [addingToQueue, setAddingToQueue] = useState(false);

    // Progress tracking state
    const [progress, setProgress] = useState<ProgressUpdate | null>(null);

    // Log detail modal state
    const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
    const [logDetailLoading, setLogDetailLoading] = useState(false);

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('adminToken');
        }
        return null;
    };

    const fetchData = useCallback(async () => {
        const token = getToken();
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [statusRes, queueRes, logsRes, radioRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/scraper/status`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/queue`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/logs?limit=30`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/radio/active`, { headers })
            ]);

            if (!statusRes.ok) {
                if (statusRes.status === 401) {
                    router.push('/admin/login');
                    return;
                }
            }

            const statusData = await statusRes.json();
            const queueData = await queueRes.json();
            const logsData = await logsRes.json();
            const radioData = radioRes.status === 204 ? null : (radioRes.ok ? await radioRes.json() : null);

            setStatus(statusData);
            setCurrentJob(queueData.currentJob);
            setQueue(queueData.queue || []);
            setLogs(logsData);
            setRadioPlaylist(radioData);
            setIsAuthenticated(true);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setLoading(false);
        }
    }, [router]);

    // Setup SignalR connection
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/scraper`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        newConnection.on('ScraperStatus', (update) => {
            console.log('ScraperStatus update:', update);
            fetchData();
        });

        newConnection.on('QueueUpdate', (update) => {
            console.log('QueueUpdate:', update);
            if (update.queue) {
                const running = update.queue.find((q: QueueItem) => q.status === 'Running');
                setCurrentJob(running || null);
                setQueue(update.queue.filter((q: QueueItem) => q.status === 'Pending'));
            }
        });

        newConnection.on('ScraperProgress', (update: ProgressUpdate) => {
            console.log('ScraperProgress:', update);
            setProgress(update);
        });

        newConnection.on('RadioModeStarted', () => {
            fetchData();
        });

        newConnection.on('RadioModeStopped', () => {
            fetchData();
        });

        newConnection.start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.error('SignalR Error:', err));

        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, [fetchData]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ==================== ACTIONS ====================

    const addToQueue = async () => {
        if (!selectedCity) return;

        const token = getToken();
        if (!token) return;

        setAddingToQueue(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/scraper/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    scraper: selectedScraper,
                    city: selectedCity,
                    priority: 10
                })
            });

            if (res.ok) {
                setSelectedCity('');
                fetchData();
            } else {
                const error = await res.json();
                alert(error.message || 'Ekleme başarısız');
            }
        } catch (error) {
            console.error('Failed to add to queue:', error);
        }
        setAddingToQueue(false);
    };

    const removeFromQueue = async (id: string) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/api/admin/scraper/queue/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Failed to remove from queue:', error);
        }
    };

    const savePlaylist = async () => {
        const token = getToken();
        if (!token) return;

        if (editingPlaylist.cities.length === 0) {
            alert('En az bir şehir seçmelisiniz');
            return;
        }

        setRadioLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/scraper/radio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: radioPlaylist?.id,
                    name: editingPlaylist.name,
                    scraperType: editingPlaylist.scraperType,
                    cities: editingPlaylist.cities
                })
            });

            if (res.ok) {
                setShowPlaylistEditor(false);
                fetchData();
            } else {
                const error = await res.json();
                alert(error.message || 'Kaydetme başarısız');
            }
        } catch (error) {
            console.error('Failed to save playlist:', error);
        }
        setRadioLoading(false);
    };

    const startRadioMode = async () => {
        const token = getToken();
        if (!token || !radioPlaylist) return;

        setRadioLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/scraper/radio/${radioPlaylist.id}/start`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchData();
            } else {
                const error = await res.json();
                alert(error.message || 'Başlatma başarısız');
            }
        } catch (error) {
            console.error('Failed to start radio mode:', error);
        }
        setRadioLoading(false);
    };

    const stopRadioMode = async () => {
        const token = getToken();
        if (!token) return;

        setRadioLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/scraper/radio/stop-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchData();
            } else {
                const error = await res.json();
                alert(error.message || 'Durdurma başarısız');
            }
        } catch (error) {
            console.error('Failed to stop radio mode:', error);
        }
        setRadioLoading(false);
    };

    const fetchLogDetail = async (logId: string) => {
        const token = getToken();
        if (!token) return;

        setLogDetailLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/scraper/logs/${logId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedLog(data);
            }
        } catch (error) {
            console.error('Failed to fetch log detail:', error);
        }
        setLogDetailLoading(false);
    };

    const toggleCitySelection = (city: string) => {
        setEditingPlaylist(prev => ({
            ...prev,
            cities: prev.cities.includes(city)
                ? prev.cities.filter(c => c !== city)
                : [...prev.cities, city]
        }));
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Show loading until authenticated
    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    🔄 Scraper Yönetimi
                    {radioPlaylist?.isActive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                            Radio Mode
                        </span>
                    )}
                </h1>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                    ↻ Yenile
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="text-sm text-gray-400">Bugünkü Taramalar</div>
                    <div className="text-2xl font-bold text-white">{status?.todayStats.totalRuns || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/20">
                    <div className="text-sm text-gray-400">Toplam Etkinlik</div>
                    <div className="text-2xl font-bold text-white">{status?.todayStats.totalEvents || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-500/20">
                    <div className="text-sm text-gray-400">Yeni Eklenen</div>
                    <div className="text-2xl font-bold text-white">{status?.todayStats.totalCreated || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-500/20">
                    <div className="text-sm text-gray-400">Kuyrukta</div>
                    <div className="text-2xl font-bold text-white">{status?.pendingCount || 0}</div>
                </div>
            </div>

            {/* Current Job with Progress */}
            {currentJob && (
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xl animate-spin">⚡</span>
                            </div>
                            <div>
                                <div className="font-semibold text-white">
                                    {currentJob.scraperName === 'Biletix' ? '🎫' : '🎟️'} {currentJob.scraperName} - {currentJob.city}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Başlangıç: {currentJob.startedAt ? formatTime(currentJob.startedAt) : '-'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            {progress && progress.scraperId === `${currentJob.scraperName}-${currentJob.city}`.toLowerCase() ? (
                                <div className="text-green-400 font-medium">
                                    {progress.processedEvents}/{progress.totalEvents} etkinlik
                                </div>
                            ) : (
                                <div className="text-green-400 font-medium">Çalışıyor...</div>
                            )}
                        </div>
                    </div>
                    {progress && progress.scraperId === `${currentJob.scraperName}-${currentJob.city}`.toLowerCase() && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                            {progress.currentEvent && (
                                <div className="text-xs text-gray-400 mt-1 truncate">
                                    📍 {progress.currentEvent}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Radio Mode Control Panel */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📻</span>
                        <div>
                            <h2 className="font-semibold text-white">Radio Mode</h2>
                            <p className="text-sm text-gray-400">Sürekli döngü tarama sistemi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {radioPlaylist?.isActive ? (
                            <>
                                <span className="text-green-400 text-sm mr-2">
                                    Döngü: {radioPlaylist.cycleCount} | Pozisyon: {radioPlaylist.currentCityIndex + 1}/{radioPlaylist.cities?.length || 0}
                                </span>
                                <button
                                    onClick={stopRadioMode}
                                    disabled={radioLoading}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                                >
                                    {radioLoading ? '...' : '⏹️ Durdur'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (radioPlaylist) {
                                            setEditingPlaylist({
                                                name: radioPlaylist.name,
                                                scraperType: radioPlaylist.scraperType,
                                                cities: radioPlaylist.cities || []
                                            });
                                        }
                                        setShowPlaylistEditor(true);
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                >
                                    ⚙️ Düzenle
                                </button>
                                <button
                                    onClick={startRadioMode}
                                    disabled={radioLoading || !radioPlaylist}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                                >
                                    {radioLoading ? '...' : '▶️ Başlat'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Playlist Preview */}
                {radioPlaylist && (
                    <div className="p-4 bg-black/20">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-gray-400 text-sm">Şehirler:</span>
                            {radioPlaylist.cities?.slice(0, 10).map((city, idx) => (
                                <span
                                    key={city}
                                    className={`px-2 py-1 text-xs rounded-full ${radioPlaylist.isActive && idx === radioPlaylist.currentCityIndex
                                        ? 'bg-green-500/30 text-green-300 ring-1 ring-green-400'
                                        : 'bg-white/10 text-gray-300'
                                        }`}
                                >
                                    {city}
                                </span>
                            ))}
                            {(radioPlaylist.cities?.length || 0) > 10 && (
                                <span className="text-gray-400 text-sm">+{radioPlaylist.cities.length - 10} daha</span>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Scraper: {radioPlaylist.scraperType} | Son iş: {radioPlaylist.lastJobCompleted ? formatTime(radioPlaylist.lastJobCompleted) : 'Henüz yok'}
                        </div>
                    </div>
                )}

                {!radioPlaylist && (
                    <div className="p-6 text-center text-gray-400">
                        <p>Henüz playlist oluşturulmadı.</p>
                        <button
                            onClick={() => setShowPlaylistEditor(true)}
                            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                        >
                            + Playlist Oluştur
                        </button>
                    </div>
                )}
            </div>

            {/* One-time Add to Queue */}
            <div className="bg-white/5 rounded-xl border border-white/10">
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        ⚡ Tek Seferlik Tarama
                        <span className="text-xs text-gray-400 font-normal">Öncelikli olarak çalışır</span>
                    </h2>
                </div>
                <div className="p-4 flex flex-wrap items-center gap-3">
                    <select
                        value={selectedScraper}
                        onChange={(e) => setSelectedScraper(e.target.value)}
                        className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="Biletix" className="bg-gray-800 text-white">🎫 Biletix</option>
                        <option value="Bubilet" className="bg-gray-800 text-white">🎟️ Bubilet</option>
                    </select>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                    >
                        <option value="" className="bg-gray-800 text-white">Şehir Seç...</option>
                        {ALL_CITIES.map((city) => (
                            <option key={city} value={city} className="bg-gray-800 text-white">{city}</option>
                        ))}
                    </select>
                    <button
                        onClick={addToQueue}
                        disabled={!selectedCity || addingToQueue}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                    >
                        {addingToQueue ? '...' : '➕ Ekle'}
                    </button>
                </div>

                {/* Queue Items */}
                <div className="divide-y divide-white/5">
                    {queue.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                            Kuyrukta bekleyen iş yok
                        </div>
                    ) : (
                        queue.map((item, index) => (
                            <div
                                key={item.id}
                                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-500 w-6 text-center">{index + 1}.</span>
                                    <span className="text-xl">
                                        {item.scraperName === 'Biletix' ? '🎫' : '🎟️'}
                                    </span>
                                    <div>
                                        <div className="font-medium text-white">
                                            {item.scraperName} - {item.city}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {item.addedBy === 'Radio' ? '📻 Radio' : item.addedBy === 'Admin' ? '👤 Manuel' : item.addedBy} • {formatTime(item.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.addedBy === 'Radio' ? 'bg-purple-500/20 text-purple-400' :
                                        item.addedBy === 'Admin' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        P:{item.priority}
                                    </span>
                                    <button
                                        onClick={() => removeFromQueue(item.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                        title="Sil"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white/5 rounded-xl border border-white/10">
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-semibold text-white">📜 Son Aktiviteler</h2>
                </div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            Henüz log yok
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                                onClick={() => log.status === 'Completed' && fetchLogDetail(log.id)}
                            >
                                <span className="text-gray-500 text-sm w-12">{formatTime(log.createdAt)}</span>
                                <span className="text-lg">
                                    {log.status === 'Completed' ? '✅' : log.status === 'Error' ? '❌' : '⏳'}
                                </span>
                                <div className="flex-1">
                                    <span className="font-medium text-white">
                                        {log.scraperName}-{log.city}
                                    </span>
                                    {log.status === 'Completed' && (
                                        <span className="text-gray-400 ml-2">
                                            {log.eventsFound} etkinlik ({log.eventsCreated} yeni, {log.eventsUpdated} güncelleme)
                                        </span>
                                    )}
                                    {log.status === 'Error' && (
                                        <span className="text-red-400 ml-2 text-sm">{log.message}</span>
                                    )}
                                </div>
                                <span className="text-gray-500 text-sm">{formatDuration(log.durationSeconds)}</span>
                                {log.status === 'Completed' && (
                                    <span className="text-gray-400 hover:text-white transition-colors" title="Detayları Gör">
                                        🔍
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Playlist Editor Modal */}
            {showPlaylistEditor && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPlaylistEditor(false)}>
                    <div
                        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold text-white text-lg">📻 Radio Playlist Düzenle</h3>
                            <button onClick={() => setShowPlaylistEditor(false)} className="text-gray-400 hover:text-white text-2xl">
                                ×
                            </button>
                        </div>

                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Playlist Adı</label>
                                <input
                                    type="text"
                                    value={editingPlaylist.name}
                                    onChange={(e) => setEditingPlaylist(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Scraper</label>
                                <select
                                    value={editingPlaylist.scraperType}
                                    onChange={(e) => setEditingPlaylist(prev => ({ ...prev, scraperType: e.target.value }))}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="Both">🔄 Her İkisi (Biletix + Bubilet)</option>
                                    <option value="Biletix">🎫 Sadece Biletix</option>
                                    <option value="Bubilet">🎟️ Sadece Bubilet</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Şehirler ({editingPlaylist.cities.length} seçili)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-2 bg-black/20 rounded-lg">
                                    {ALL_CITIES.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => toggleCitySelection(city)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${editingPlaylist.cities.includes(city)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                            <button
                                onClick={() => setShowPlaylistEditor(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={savePlaylist}
                                disabled={radioLoading || editingPlaylist.cities.length === 0}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                            >
                                {radioLoading ? 'Kaydediliyor...' : '💾 Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
                    <div
                        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-white text-lg">
                                    {selectedLog.scraperName === 'Biletix' ? '🎫' : '🎟️'} {selectedLog.scraperName} - {selectedLog.city}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {new Date(selectedLog.createdAt).toLocaleString('tr-TR')} • {formatDuration(selectedLog.durationSeconds)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white text-2xl">
                                ×
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-3 gap-4 border-b border-white/10">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{selectedLog.eventsFound}</div>
                                <div className="text-xs text-gray-400">Toplam</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{selectedLog.eventsCreated}</div>
                                <div className="text-xs text-gray-400">Yeni</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">{selectedLog.eventsUpdated}</div>
                                <div className="text-xs text-gray-400">Güncelleme</div>
                            </div>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {logDetailLoading ? (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                    <p className="mt-2">Yükleniyor...</p>
                                </div>
                            ) : selectedLog.scrapedEventsJson ? (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-300 mb-3">📋 Taranan Etkinlikler</h4>
                                    {(() => {
                                        try {
                                            const events: ScrapedEventDetail[] = JSON.parse(selectedLog.scrapedEventsJson);
                                            return events.map((evt, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <span className={
                                                            evt.status === 'created' ? 'text-green-400' :
                                                                evt.status === 'updated' ? 'text-blue-400' : 'text-gray-400'
                                                        }>
                                                            {evt.status === 'created' ? '🆕' : evt.status === 'updated' ? '🔄' : '⏭️'}
                                                        </span>
                                                        <span className="text-white text-sm truncate">{evt.title}</span>
                                                    </div>
                                                    {evt.price && (
                                                        <span className="text-gray-400 text-sm ml-2">{evt.price}₺</span>
                                                    )}
                                                </div>
                                            ));
                                        } catch {
                                            return <p className="text-gray-400">Detay verisi bulunamadı</p>;
                                        }
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    <p>📭 Bu log için detay verisi kaydedilmemiş</p>
                                    <p className="text-sm mt-1">Yeni taramalar detay içerecek</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
