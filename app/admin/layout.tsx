'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Sidebar Context
interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({ isCollapsed: false, setIsCollapsed: () => { } });

export function useSidebar() {
    return useContext(SidebarContext);
}

// Navigation Items
const navItems = [
    {
        group: 'Genel',
        items: [
            { href: '/admin', label: 'Dashboard', icon: '📊' },
            { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
        ]
    },
    {
        group: 'İçerik',
        items: [
            { href: '/admin/events', label: 'Etkinlikler', icon: '🎫' },
            { href: '/admin/artists', label: 'Sanatçılar', icon: '🎤' },
            { href: '/admin/venues', label: 'Mekanlar', icon: '🏛️' },
        ]
    },
    {
        group: 'Araçlar',
        items: [
            { href: '/admin/scrapers', label: 'Scrapers', icon: '🔄' },
            { href: '/admin/review', label: 'İnceleme', icon: '👀' },
            { href: '/admin/report', label: 'Rapor', icon: '📋' },
        ]
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Don't apply layout to login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Sidebar */}
                <aside
                    className={`fixed left-0 top-0 h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
                        }`}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50">
                        {!isCollapsed && (
                            <Link href="/admin" className="flex items-center gap-2">
                                <span className="text-2xl">🎫</span>
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    BiletLink
                                </span>
                            </Link>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            {isCollapsed ? '→' : '←'}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-8rem)]">
                        {navItems.map((group) => (
                            <div key={group.group}>
                                {!isCollapsed && (
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                                        {group.group}
                                    </p>
                                )}
                                <ul className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                        }`}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    <span className={`text-lg ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                                                        {item.icon}
                                                    </span>
                                                    {!isCollapsed && (
                                                        <span className="font-medium">{item.label}</span>
                                                    )}
                                                    {isActive && !isCollapsed && (
                                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* User Section */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 bg-slate-900/50">
                        <button
                            onClick={() => {
                                localStorage.removeItem('adminToken');
                                localStorage.removeItem('adminUser');
                                window.location.href = '/admin/login';
                            }}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span>🚪</span>
                            {!isCollapsed && <span className="text-sm">Çıkış Yap</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                    {/* Top Header */}
                    <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-sm">
                                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                                    Admin
                                </Link>
                                {pathname !== '/admin' && (
                                    <>
                                        <span className="text-slate-600">/</span>
                                        <span className="text-white capitalize">
                                            {pathname.split('/').pop()?.replace('-', ' ')}
                                        </span>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ara... (Ctrl+K)"
                                    className="w-64 px-4 py-2 pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                <span className="text-lg">🔔</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}
