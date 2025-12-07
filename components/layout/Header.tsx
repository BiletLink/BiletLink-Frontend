import Link from 'next/link';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 glass shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-xl">🎫</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">BiletLink</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <input
                            type="search"
                            placeholder="Etkinlik, sanatçı veya mekan ara..."
                            className="w-full px-6 py-2.5 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link href="/etkinlikler" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                            Etkinlikler
                        </Link>
                        <Link href="/kategoriler" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                            Kategoriler
                        </Link>
                        <Link href="/mekanlar" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                            Mekanlar
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <div className="flex items-center space-x-4">
                        <button className="hidden sm:block px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
                            Kayıt Ol
                        </button>
                        <button className="sm:hidden p-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
