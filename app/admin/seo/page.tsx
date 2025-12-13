'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SEOReport {
    url: string;
    analyzedAt: string;
    overallScore: number;
    issues: SEOIssue[];
    recommendations: string[];
    meta: MetaAnalysis;
    performance: PerformanceAnalysis;
    content: ContentAnalysis;
    technical: TechnicalAnalysis;
}

interface SEOIssue {
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    fix: string;
}

interface MetaAnalysis {
    title: { value: string; length: number; score: number; issues: string[] };
    description: { value: string; length: number; score: number; issues: string[] };
    keywords: string[];
    ogTags: { property: string; content: string }[];
    canonical: string;
}

interface PerformanceAnalysis {
    loadTime: string;
    pageSize: string;
    requests: number;
    score: number;
}

interface ContentAnalysis {
    wordCount: number;
    headings: { tag: string; text: string }[];
    images: { withAlt: number; withoutAlt: number };
    links: { internal: number; external: number };
    score: number;
}

interface TechnicalAnalysis {
    ssl: boolean;
    mobile: boolean;
    robots: boolean;
    sitemap: boolean;
    score: number;
}

export default function SEOAnalysis() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<SEOReport | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        }
    }, [router]);

    const analyzeUrl = async () => {
        if (!url) return;
        setLoading(true);

        try {
            // Simulate SEO analysis (in production, this would call a backend API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockReport: SEOReport = {
                url: url,
                analyzedAt: new Date().toISOString(),
                overallScore: Math.floor(Math.random() * 30) + 60,
                issues: [
                    { severity: 'critical', category: 'Meta', message: 'Meta description eksik veya çok kısa', fix: 'En az 150 karakter meta description ekleyin' },
                    { severity: 'warning', category: 'Content', message: 'H1 etiketi birden fazla kullanılmış', fix: 'Sayfada sadece bir H1 etiketi bulunmalı' },
                    { severity: 'warning', category: 'Images', message: '3 görsel alt etiketi eksik', fix: 'Tüm görsellere açıklayıcı alt etiketleri ekleyin' },
                    { severity: 'info', category: 'Performance', message: 'Sayfa boyutu optimize edilebilir', fix: 'Görselleri sıkıştırın ve lazy loading kullanın' },
                ],
                recommendations: [
                    'Sayfa başlığını 50-60 karakter arasında tutun',
                    'Meta description\'ı 150-160 karakter arasında tutun',
                    'Tüm görsellere alt etiket ekleyin',
                    'İç bağlantı stratejisini güçlendirin',
                    'Mobil uyumluluğu kontrol edin',
                    'Sayfa yükleme hızını optimize edin',
                    'Schema markup kullanmayı düşünün',
                    'SSL sertifikası aktif olmalı'
                ],
                meta: {
                    title: { value: 'Örnek Sayfa Başlığı | Site Adı', length: 35, score: 80, issues: ['Başlık 50-60 karakter olmalı'] },
                    description: { value: 'Bu bir örnek meta description metnidir.', length: 42, score: 45, issues: ['Description çok kısa (min 150 karakter)'] },
                    keywords: ['konser', 'bilet', 'etkinlik', 'İstanbul'],
                    ogTags: [
                        { property: 'og:title', content: 'Örnek Sayfa' },
                        { property: 'og:type', content: 'website' },
                    ],
                    canonical: url
                },
                performance: {
                    loadTime: '2.3s',
                    pageSize: '1.8 MB',
                    requests: 45,
                    score: 72
                },
                content: {
                    wordCount: 850,
                    headings: [
                        { tag: 'H1', text: 'Ana Başlık' },
                        { tag: 'H2', text: 'Alt Başlık 1' },
                        { tag: 'H2', text: 'Alt Başlık 2' },
                        { tag: 'H3', text: 'Detay Başlık' }
                    ],
                    images: { withAlt: 8, withoutAlt: 3 },
                    links: { internal: 15, external: 5 },
                    score: 68
                },
                technical: {
                    ssl: true,
                    mobile: true,
                    robots: true,
                    sitemap: false,
                    score: 75
                }
            };

            setReport(mockReport);
        } catch (error) {
            alert('Analiz başarısız');
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        if (!reportRef.current) return;

        // Print-friendly PDF export
        const printContent = reportRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>SEO Raporu - ${report?.url}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                        h2 { color: #374151; margin-top: 30px; }
                        .score { font-size: 48px; font-weight: bold; color: #059669; }
                        .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
                        .issue { padding: 10px; margin: 5px 0; border-radius: 4px; }
                        .critical { background: #fef2f2; border-left: 4px solid #ef4444; }
                        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
                        .info { background: #eff6ff; border-left: 4px solid #3b82f6; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f3f4f6; }
                        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>🔍 SEO Analiz Raporu</h1>
                    <p><strong>URL:</strong> ${report?.url}</p>
                    <p><strong>Tarih:</strong> ${new Date(report?.analyzedAt || '').toLocaleString('tr-TR')}</p>
                    <p><strong>Genel Puan:</strong> <span class="score">${report?.overallScore}/100</span></p>
                    
                    <h2>📋 Tespit Edilen Sorunlar</h2>
                    <div class="section">
                        ${report?.issues.map(i => `
                            <div class="issue ${i.severity}">
                                <strong>${i.category}:</strong> ${i.message}<br>
                                <em>Çözüm: ${i.fix}</em>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h2>📊 Meta Etiket Analizi</h2>
                    <div class="section">
                        <table>
                            <tr><th>Etiket</th><th>Değer</th><th>Uzunluk</th><th>Puan</th></tr>
                            <tr><td>Title</td><td>${report?.meta.title.value}</td><td>${report?.meta.title.length} karakter</td><td>${report?.meta.title.score}/100</td></tr>
                            <tr><td>Description</td><td>${report?.meta.description.value}</td><td>${report?.meta.description.length} karakter</td><td>${report?.meta.description.score}/100</td></tr>
                        </table>
                    </div>
                    
                    <h2>⚡ Performans</h2>
                    <div class="section">
                        <table>
                            <tr><td>Yükleme Süresi</td><td>${report?.performance.loadTime}</td></tr>
                            <tr><td>Sayfa Boyutu</td><td>${report?.performance.pageSize}</td></tr>
                            <tr><td>HTTP İstekleri</td><td>${report?.performance.requests}</td></tr>
                            <tr><td>Performans Puanı</td><td>${report?.performance.score}/100</td></tr>
                        </table>
                    </div>
                    
                    <h2>📝 İçerik Analizi</h2>
                    <div class="section">
                        <table>
                            <tr><td>Kelime Sayısı</td><td>${report?.content.wordCount}</td></tr>
                            <tr><td>Alt Etiketli Görseller</td><td>${report?.content.images.withAlt} / ${(report?.content.images.withAlt || 0) + (report?.content.images.withoutAlt || 0)}</td></tr>
                            <tr><td>İç Linkler</td><td>${report?.content.links.internal}</td></tr>
                            <tr><td>Dış Linkler</td><td>${report?.content.links.external}</td></tr>
                        </table>
                    </div>
                    
                    <h2>🔧 Teknik SEO</h2>
                    <div class="section">
                        <table>
                            <tr><td>SSL Sertifikası</td><td>${report?.technical.ssl ? '✅ Aktif' : '❌ Eksik'}</td></tr>
                            <tr><td>Mobil Uyumluluk</td><td>${report?.technical.mobile ? '✅ Uyumlu' : '❌ Sorunlu'}</td></tr>
                            <tr><td>Robots.txt</td><td>${report?.technical.robots ? '✅ Mevcut' : '❌ Eksik'}</td></tr>
                            <tr><td>Sitemap</td><td>${report?.technical.sitemap ? '✅ Mevcut' : '❌ Eksik'}</td></tr>
                        </table>
                    </div>
                    
                    <h2>💡 Öneriler</h2>
                    <div class="section">
                        <ol>
                            ${report?.recommendations.map(r => `<li>${r}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div class="footer">
                        <p>Bu rapor BiletLink SEO Analiz Aracı tarafından oluşturulmuştur.</p>
                        <p>© 2025 BiletLink</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
            case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            default: return 'bg-blue-500/20 border-blue-500 text-blue-400';
        }
    };

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
                                <Link href="/admin/seo" className="text-white bg-slate-700 px-3 py-2 rounded-lg text-sm">🔍 SEO</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-white mb-8">🔍 SEO Analiz Aracı</h2>

                {/* URL Input */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                    <div className="flex gap-4">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/sayfa-adi"
                            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={analyzeUrl}
                            disabled={loading || !url}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Analiz Ediliyor...
                                </span>
                            ) : '🔍 Analiz Et'}
                        </button>
                    </div>
                </div>

                {/* Report */}
                {report && (
                    <div ref={reportRef}>
                        {/* Score Card */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg text-slate-400">Genel SEO Puanı</h3>
                                    <p className={`text-6xl font-bold ${getScoreColor(report.overallScore)}`}>
                                        {report.overallScore}<span className="text-2xl text-slate-500">/100</span>
                                    </p>
                                    <p className="text-slate-500 text-sm mt-2">{report.url}</p>
                                </div>
                                <button
                                    onClick={exportPDF}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    📄 PDF Olarak İndir
                                </button>
                            </div>
                        </div>

                        {/* Issues */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">⚠️ Tespit Edilen Sorunlar ({report.issues.length})</h3>
                            <div className="space-y-3">
                                {report.issues.map((issue, i) => (
                                    <div key={i} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(issue.severity)}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-xs uppercase font-semibold">{issue.category}</span>
                                                <p className="text-white mt-1">{issue.message}</p>
                                                <p className="text-slate-400 text-sm mt-1">💡 {issue.fix}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${issue.severity === 'critical' ? 'bg-red-500' :
                                                    issue.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                                } text-white`}>
                                                {issue.severity === 'critical' ? 'Kritik' : issue.severity === 'warning' ? 'Uyarı' : 'Bilgi'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Score Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <ScoreCard title="Meta Etiketler" score={report.meta.title.score} icon="🏷️" />
                            <ScoreCard title="Performans" score={report.performance.score} icon="⚡" />
                            <ScoreCard title="İçerik" score={report.content.score} icon="📝" />
                            <ScoreCard title="Teknik SEO" score={report.technical.score} icon="🔧" />
                        </div>

                        {/* Meta Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4">🏷️ Meta Etiketler</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-400 text-sm">Title ({report.meta.title.length} karakter)</label>
                                        <p className="text-white bg-slate-700 p-3 rounded mt-1">{report.meta.title.value}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm">Description ({report.meta.description.length} karakter)</label>
                                        <p className="text-white bg-slate-700 p-3 rounded mt-1">{report.meta.description.value}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-sm">Keywords</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {report.meta.keywords.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4">📝 İçerik Analizi</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Kelime Sayısı</span>
                                        <span className="text-white">{report.content.wordCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Başlık Sayısı (H1-H6)</span>
                                        <span className="text-white">{report.content.headings.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Alt Etiketli Görseller</span>
                                        <span className="text-white">{report.content.images.withAlt} / {report.content.images.withAlt + report.content.images.withoutAlt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">İç Linkler</span>
                                        <span className="text-white">{report.content.links.internal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Dış Linkler</span>
                                        <span className="text-white">{report.content.links.external}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical & Recommendations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4">🔧 Teknik SEO</h3>
                                <div className="space-y-3">
                                    <CheckItem label="SSL Sertifikası" checked={report.technical.ssl} />
                                    <CheckItem label="Mobil Uyumluluk" checked={report.technical.mobile} />
                                    <CheckItem label="Robots.txt" checked={report.technical.robots} />
                                    <CheckItem label="Sitemap.xml" checked={report.technical.sitemap} />
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-4">💡 Öneriler</h3>
                                <ul className="space-y-2">
                                    {report.recommendations.slice(0, 6).map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                            <span className="text-blue-400">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ScoreCard({ title, score, icon }: { title: string; score: number; icon: string }) {
    const getColor = (s: number) => {
        if (s >= 80) return 'from-green-500 to-green-600';
        if (s >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`text-3xl font-bold bg-gradient-to-r ${getColor(score)} bg-clip-text text-transparent`}>
                    {score}
                </span>
            </div>
            <p className="text-slate-400 text-sm">{title}</p>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${getColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-300">{label}</span>
            <span className={checked ? 'text-green-400' : 'text-red-400'}>
                {checked ? '✅ Aktif' : '❌ Eksik'}
            </span>
        </div>
    );
}
