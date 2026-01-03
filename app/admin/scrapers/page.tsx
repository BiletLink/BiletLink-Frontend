'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr';

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

interface City {
    city: string;
    scraperCount: number;
    lastRun: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.biletlink.co';

export default function ScrapersPage() {
    const router = useRouter();
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [currentJob, setCurrentJob] = useState<QueueItem | null>(null);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [status, setStatus] = useState<ScraperStatus | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    // Form state
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedScraper, setSelectedScraper] = useState('Biletix');
    const [addingToQueue, setAddingToQueue] = useState(false);

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

            const [statusRes, queueRes, logsRes, citiesRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/scraper/status`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/queue`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/logs?limit=30`, { headers }),
                fetch(`${API_URL}/api/admin/scraper/cities`, { headers })
            ]);

            if (!statusRes.ok || !queueRes.ok || !logsRes.ok) {
                if (statusRes.status === 401) {
                    router.push('/admin/login');
                    return;
                }
            }

            const statusData = await statusRes.json();
            const queueData = await queueRes.json();
            const logsData = await logsRes.json();
            const citiesData = await citiesRes.json();

            setStatus(statusData);
            setCurrentJob(queueData.currentJob);
            setQueue(queueData.queue || []);
            setLogs(logsData);
            setCities(citiesData);
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
            // Refresh data on status update
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
        // Refresh every 30 seconds as fallback
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

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

    const updatePriority = async (id: string, priority: number) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_URL}/api/admin/scraper/queue/${id}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ priority })
            });
            fetchData();
        } catch (error) {
            console.error('Failed to update priority:', error);
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
                    {status?.isRunning && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                            Çalışıyor
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

            {/* Current Job */}
            {currentJob && (
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
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
                        <div className="text-green-400 font-medium">Çalışıyor...</div>
                    </div>
                </div>
            )}

            {/* Queue (Spotify Style) */}
            <div className="bg-white/5 rounded-xl border border-white/10">
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        🎵 Kuyruk (Radyo Modu)
                        <span className="text-xs text-gray-400">Spotify tarzı sürekli tarama</span>
                    </h2>
                </div>

                {/* Add to Queue Form */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-400">+ Araya Ekle:</span>
                        <select
                            value={selectedScraper}
                            onChange={(e) => setSelectedScraper(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="Biletix">🎫 Biletix</option>
                            <option value="Bubilet">🎟️ Bubilet</option>
                        </select>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                        >
                            <option value="">Şehir Seç...</option>
                            {cities.map((c) => (
                                <option key={c.city} value={c.city}>{c.city}</option>
                            ))}
                        </select>
                        <button
                            onClick={addToQueue}
                            disabled={!selectedCity || addingToQueue}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                        >
                            {addingToQueue ? '...' : 'Ekle'}
                        </button>
                    </div>
                </div>

                {/* Queue Items */}
                <div className="divide-y divide-white/5">
                    {queue.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            Kuyruk boş - Radyo Modu otomatik olarak en eski şehirleri ekleyecek
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
                                            {item.addedBy === 'Auto' ? '🎵 Radyo' : '👤 Manuel'} • {formatTime(item.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.addedBy === 'Auto'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {item.addedBy}
                                    </span>
                                    <button
                                        onClick={() => updatePriority(item.id, item.priority + 10)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Önceliği Artır"
                                    >
                                        ▲
                                    </button>
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
                            <div key={log.id} className="p-3 flex items-center gap-3 hover:bg-white/5">
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
