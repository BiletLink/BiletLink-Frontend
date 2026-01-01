'use client';

import { useState, useEffect } from 'react';

interface ShareButtonProps {
    eventName: string;
    eventUrl: string;
    className?: string;
}

export default function ShareButton({ eventName, eventUrl, className = '' }: ShareButtonProps) {
    const [showToast, setShowToast] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const shareText = `${eventName} etkinliğine katılmak ister misin? 🎫`;
    const fullUrl = `https://www.biletlink.co${eventUrl}`;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const shareOptions = [
        {
            name: 'X',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            url: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
            bgColor: 'bg-black hover:bg-gray-800',
        },
        {
            name: 'WhatsApp',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\n' + fullUrl)}`,
            bgColor: 'bg-[#25D366] hover:bg-[#1DA851]',
        },
        {
            name: 'Facebook',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareText)}`,
            bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
        },
        {
            name: 'E-posta',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            url: `mailto:?subject=${encodeURIComponent(eventName)}&body=${encodeURIComponent(shareText + '\n\n' + fullUrl)}`,
            bgColor: 'bg-gray-500 hover:bg-gray-400',
        },
    ];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <>
            {/* Share Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all backdrop-blur-sm border border-white/20 ${className}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Paylaş</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Modal Content - White Theme */}
                    <div
                        className={`relative bg-white rounded-2xl shadow-2xl ${isMobile ? 'w-full mx-4 max-w-sm' : 'w-[420px]'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Paylaş</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Share Options */}
                        <div className="px-6 py-5">
                            <div className={`flex justify-center gap-4 ${isMobile ? 'flex-wrap' : ''}`}>
                                {shareOptions.map((option) => (
                                    <a
                                        key={option.name}
                                        href={option.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsOpen(false)}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`p-4 rounded-full ${option.bgColor} text-white transition-all transform group-hover:scale-110 shadow-md`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                                            {option.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Copy Link Section */}
                        <div className="px-6 pb-6">
                            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl border border-gray-200">
                                <input
                                    type="text"
                                    readOnly
                                    value={fullUrl}
                                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
                                />
                                <button
                                    onClick={copyLink}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                >
                                    Kopyala
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg z-[60] animate-in fade-in slide-in-from-bottom-4 duration-200">
                    ✅ Link kopyalandı!
                </div>
            )}
        </>
    );
}
