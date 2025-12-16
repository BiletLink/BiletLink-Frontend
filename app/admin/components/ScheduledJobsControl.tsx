"use client";
import { useState, useEffect } from 'react';

export default function ScheduledJobsControl() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Main Job State
    const [platform, setPlatform] = useState('biletix');
    const [city, setCity] = useState('');

    // Cron Builder State
    const [cronMode, setCronMode] = useState<'manual' | 'daily' | 'interval'>('daily');
    const [cronManual, setCronManual] = useState('0 3 * * *');
    const [cronHour, setCronHour] = useState('03');
    const [cronMinute, setCronMinute] = useState('00');
    const [cronInterval, setCronInterval] = useState('6');

    // Chaining State
    const [chainEnabled, setChainEnabled] = useState(false);
    const [nextPlatform, setNextPlatform] = useState('bubilet');
    const [nextCity, setNextCity] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiUrl}/api/cron/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        }
    };

    const getFinalCron = () => {
        if (cronMode === 'manual') return cronManual;
        if (cronMode === 'daily') return `${parseInt(cronMinute)} ${parseInt(cronHour)} * * *`;
        if (cronMode === 'interval') return `0 */${cronInterval} * * *`;
        return cronManual;
    };

    const addJob = async () => {
        const finalCron = getFinalCron();
        if (!finalCron) return alert('Cron expression gerekli');

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            const payload: any = {
                scraperType: platform,
                cronExpression: finalCron,
                city: city
            };

            if (chainEnabled) {
                payload.nextJob = {
                    scraperType: nextPlatform,
                    city: nextCity
                };
            }

            const response = await fetch(`${apiUrl}/api/cron/jobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Görev başarıyla eklendi!');
                fetchJobs();
                if (cronMode === 'manual') setCronManual('');
                setCity('');
            } else {
                alert(data.message || 'Hata oluştu');
            }
        } catch (error) {
            alert('Job eklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (id: string) => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/cron/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchJobs();
        } catch (error) {
            alert('Silinemedi');
        }
    };

    const triggerJob = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/cron/trigger/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Görev tetiklendi');
        } catch (error) {
            alert('Tetiklenemedi');
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span>⏰</span> Zamanlanmış Görev & İş Akışı Yöneticisi
            </h3>

            <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Main Schedule */}
                    <div className="space-y-4">
                        <h4 className="text-blue-400 font-semibold border-b border-slate-700 pb-2">1. Ana Görev Tanımı</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Platform</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                >
                                    <option value="biletix">Biletix</option>
                                    <option value="bubilet">Bubilet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Şehir (Opsiyonel)</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Örn: Istanbul"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Cron Builder */}
                        <div>
                            <label className="block text-slate-400 text-xs mb-2">Zamanlama Tipi</label>
                            <div className="flex bg-slate-800 rounded p-1 mb-3">
                                <button onClick={() => setCronMode('daily')} className={`flex-1 py-1 text-xs rounded ${cronMode === 'daily' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Günlük</button>
                                <button onClick={() => setCronMode('interval')} className={`flex-1 py-1 text-xs rounded ${cronMode === 'interval' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Aralıklı</button>
                                <button onClick={() => setCronMode('manual')} className={`flex-1 py-1 text-xs rounded ${cronMode === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Manuel</button>
                            </div>

                            {cronMode === 'daily' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-300 text-sm">Her gün saat:</span>
                                    <select value={cronHour} onChange={(e) => setCronHour(e.target.value)} className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1">
                                        {[...Array(24)].map((_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                    <span className="text-white">:</span>
                                    <select value={cronMinute} onChange={(e) => setCronMinute(e.target.value)} className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1">
                                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            )}

                            {cronMode === 'interval' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-300 text-sm">Her</span>
                                    <input
                                        type="number"
                                        min="1" max="23"
                                        value={cronInterval}
                                        onChange={(e) => setCronInterval(e.target.value)}
                                        className="w-16 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1"
                                    />
                                    <span className="text-slate-300 text-sm">saatte bir çalış.</span>
                                </div>
                            )}

                            {cronMode === 'manual' && (
                                <input
                                    type="text"
                                    value={cronManual}
                                    onChange={(e) => setCronManual(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white font-mono text-sm"
                                    placeholder="* * * * *"
                                />
                            )}

                            <p className="text-xs text-slate-500 mt-2 font-mono">
                                Önizleme: <span className="text-orange-400">{getFinalCron()}</span>
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Chaining */}
                    <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-700 pt-8 lg:pt-0 pl-0 lg:pl-8">
                        <h4 className="text-purple-400 font-semibold border-b border-slate-700 pb-2 flex justify-between items-center">
                            <span>2. İş Akışı / Zincirleme</span>
                            <input
                                type="checkbox"
                                checked={chainEnabled}
                                onChange={(e) => setChainEnabled(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-700"
                            />
                        </h4>

                        <div className={`transition-opacity duration-200 ${chainEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                            <p className="text-slate-400 text-xs mb-4">
                                Ana görev <strong className="text-green-400">başarıyla bittiğinde</strong> aşağıdaki görevi otomatik olarak kuyruğa ekle:
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-slate-400 text-xs mb-1">Sonraki Platform</label>
                                    <select
                                        value={nextPlatform}
                                        onChange={(e) => setNextPlatform(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    >
                                        <option value="biletix">Biletix</option>
                                        <option value="bubilet">Bubilet</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs mb-1">Sonraki Şehir</label>
                                    <input
                                        type="text"
                                        value={nextCity}
                                        onChange={(e) => setNextCity(e.target.value)}
                                        placeholder="Örn: Kocaeli"
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subimit Button - FULL WIDTH below columns */}
                <div className="mt-8 border-t border-slate-800 pt-6">
                    <button
                        onClick={addJob}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Ekleniyor...
                            </>
                        ) : (
                            <>
                                <span>⚡</span> Gorevi Planla
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-2">
                        {chainEnabled ? 'Bu işlem birbirini takip eden 2 görevi planlayacaktır.' : 'Tek bir zamanlanmış görev oluşturulacaktır.'}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900/50 uppercase text-xs font-semibold text-slate-300">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Tip</th>
                            <th className="px-4 py-3">Şehir</th>
                            <th className="px-4 py-3">Cron</th>
                            <th className="px-4 py-3">Son Çalışma</th>
                            <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-700/50">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{job.id.substring(0, 20)}...</td>
                                <td className="px-4 py-3 text-white font-medium">{job.type}</td>
                                <td className="px-4 py-3 text-emerald-400">{job.city}</td>
                                <td className="px-4 py-3 font-mono text-orange-400">{job.cron}</td>
                                <td className="px-4 py-3">{job.lastExecution ? new Date(job.lastExecution).toLocaleString('tr-TR') : '-'}</td>
                                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                    <button
                                        onClick={() => triggerJob(job.id)}
                                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition"
                                    >
                                        Şimdi Çalıştır
                                    </button>
                                    <button
                                        onClick={() => deleteJob(job.id)}
                                        className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-xs transition"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                    Henüz zamanlanmış görev bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
