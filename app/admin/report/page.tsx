'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CategoryReport {
    category: string;
    eventCount: number;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    platforms: PlatformDetail[];
}

interface PlatformDetail {
    platform: string;
    eventCount: number;
    totalViews: number;
    totalClicks: number;
    events: EventSummary[];
}

interface EventSummary {
    id: string;
    name: string;
    viewCount: number;
    clickCount: number;
    eventUrl: string;
    sourcePlatform: string;
}

export default function ReportPage() {
    const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchReportData(token);
    }, [router]);

    const fetchReportData = async (token: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        try {
            const response = await fetch(`${apiUrl}/api/analytics/report/by-category`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();
            setCategoryReports(data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>BiletLink Firma Analiz Raporu</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; font-size: 12px; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; background: #f3f4f6; padding: 10px; border-radius: 4px; }
                        h3 { color: #6366f1; margin-top: 20px; }
                        .summary { display: flex; gap: 30px; margin: 20px 0; }
                        .stat { background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; }
                        .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
                        .stat-label { color: #6b7280; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
                        th { background: #f3f4f6; font-weight: bold; }
                        .platform-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
                        .biletix { background: #dbeafe; color: #1d4ed8; }
                        .bubilet { background: #f3e8ff; color: #7c3aed; }
                        a { color: #2563eb; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                        .page-break { page-break-before: always; }
                    </style>
                </head>
                <body>
                    <h1>📊 BiletLink Firma Analiz Raporu</h1>
                    <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                    
                    ${categoryReports.map(cat => `
                        <h2>📂 ${cat.category}</h2>
                        <div class="summary">
                            <div class="stat">
                                <div class="stat-value">${cat.eventCount}</div>
                                <div class="stat-label">Etkinlik</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${cat.totalViews}</div>
                                <div class="stat-label">Görüntüleme</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${cat.totalClicks}</div>
                                <div class="stat-label">Tıklama</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">${cat.clickThroughRate}%</div>
                                <div class="stat-label">CTR</div>
                            </div>
                        </div>
                        
                        ${cat.platforms.map(platform => `
                            <h3><span class="platform-badge ${platform.platform.toLowerCase()}">${platform.platform}</span> - ${platform.eventCount} etkinlik</h3>
                            <table>
                                <tr>
                                    <th>Etkinlik Adı</th>
                                    <th>Görüntüleme</th>
                                    <th>Tıklama</th>
                                    <th>Platform Linki</th>
                                </tr>
                                ${platform.events.slice(0, 10).map(event => `
                                    <tr>
                                        <td>${event.name}</td>
                                        <td>${event.viewCount}</td>
                                        <td>${event.clickCount}</td>
                                        <td><a href="${event.eventUrl}" target="_blank">${event.eventUrl ? 'Link →' : '-'}</a></td>
                                    </tr>
                                `).join('')}
                            </table>
                        `).join('')}
                    `).join('<div class="page-break"></div>')}
                    
                    <div class="footer">
                        <p>Bu rapor BiletLink Admin Paneli tarafından oluşturulmuştur.</p>
                        <p>© 2025 BiletLink - Tüm hakları saklıdır.</p>
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
                                <Link href="/admin/analytics" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700">📊 Analytics</Link>
                                <Link href="/admin/report" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">📄 Rapor</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">📄 Firma Analiz Raporu</h2>
                        <p className="text-slate-400 text-sm mt-1">Kategori ve platform bazlı detaylı analiz</p>
                    </div>
                    <button
                        onClick={exportPDF}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2 font-semibold"
                    >
                        📄 PDF Olarak İndir
                    </button>
                </div>

                {/* Category Cards */}
                <div className="space-y-6">
                    {categoryReports.map((cat) => (
                        <div key={cat.category} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            {/* Category Header */}
                            <div
                                className="p-6 cursor-pointer hover:bg-slate-700/30 transition"
                                onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{getCategoryIcon(cat.category)}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{cat.category}</h3>
                                            <p className="text-slate-400 text-sm">{cat.eventCount} etkinlik • {cat.platforms.length} platform</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{cat.totalViews}</div>
                                            <div className="text-slate-400 text-xs">Görüntüleme</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-400">{cat.totalClicks}</div>
                                            <div className="text-slate-400 text-xs">Tıklama</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-400">{cat.clickThroughRate}%</div>
                                            <div className="text-slate-400 text-xs">CTR</div>
                                        </div>
                                        <span className={`text-slate-400 transform transition ${selectedCategory === cat.category ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Platform Details - Expandable */}
                            {selectedCategory === cat.category && (
                                <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                                    {cat.platforms.map((platform) => (
                                        <div key={platform.platform} className="mb-6 last:mb-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${platform.platform.toLowerCase().includes('biletix')
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    {platform.platform}
                                                </span>
                                                <span className="text-slate-400 text-sm">
                                                    {platform.eventCount} etkinlik • {platform.totalViews} görüntüleme • {platform.totalClicks} tıklama
                                                </span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-slate-400 text-xs border-b border-slate-700">
                                                            <th className="text-left py-2 px-3">Etkinlik</th>
                                                            <th className="text-right py-2 px-3">Görüntüleme</th>
                                                            <th className="text-right py-2 px-3">Tıklama</th>
                                                            <th className="text-left py-2 px-3">Platform Linki</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {platform.events.slice(0, 10).map((event) => (
                                                            <tr key={event.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                                                <td className="py-2 px-3 text-white">{event.name}</td>
                                                                <td className="py-2 px-3 text-right text-slate-300">{event.viewCount}</td>
                                                                <td className="py-2 px-3 text-right text-blue-400">{event.clickCount}</td>
                                                                <td className="py-2 px-3">
                                                                    {event.eventUrl ? (
                                                                        <a
                                                                            href={event.eventUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                                                        >
                                                                            🔗 {platform.platform} →
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-slate-500 text-sm">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'Konser': '🎤',
        'Tiyatro': '🎭',
        'Stand-Up': '😂',
        'Festival': '🎪',
        'Spor': '⚽',
        'Parti': '🎉',
        'Etkinlik': '🎫'
    };
    return icons[category] || '📂';
}
