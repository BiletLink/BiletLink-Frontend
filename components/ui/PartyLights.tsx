'use client';

import { useEffect, useRef, useState } from 'react';

interface PartyLightsProps {
    children: React.ReactNode;
    className?: string;
}

export default function PartyLights({ children, className = '' }: PartyLightsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePosition({ x, y });
        };

        const handleClick = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const id = Date.now();

            setClickEffects(prev => [...prev, { id, x, y }]);

            // Remove effect after animation
            setTimeout(() => {
                setClickEffects(prev => prev.filter(effect => effect.id !== id));
            }, 1000);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('click', handleClick);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                background: 'linear-gradient(135deg, #0A0F1C 0%, #1A1F3C 50%, #0F172A 100%)'
            }}
        >
            {/* Interactive Light Orbs - Follow Mouse */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-300 ease-out"
                style={{
                    background: `
                        radial-gradient(ellipse 600px 400px at ${mousePosition.x}% ${mousePosition.y}%, rgba(94, 176, 239, 0.2) 0%, transparent 70%),
                        radial-gradient(ellipse 500px 350px at ${100 - mousePosition.x}% ${mousePosition.y * 0.5}%, rgba(167, 139, 250, 0.15) 0%, transparent 60%),
                        radial-gradient(ellipse 400px 300px at ${mousePosition.x * 0.7}% ${100 - mousePosition.y}%, rgba(244, 114, 182, 0.12) 0%, transparent 55%),
                        radial-gradient(ellipse 350px 250px at ${100 - mousePosition.x * 0.5}% ${100 - mousePosition.y * 0.7}%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)
                    `
                }}
            />

            {/* Ambient Animation Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
                    style={{
                        top: '10%',
                        left: '20%',
                        background: 'radial-gradient(circle, rgba(94, 176, 239, 0.15) 0%, transparent 70%)',
                        animationDuration: '4s'
                    }}
                />
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
                    style={{
                        top: '50%',
                        right: '10%',
                        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)',
                        animationDuration: '5s',
                        animationDelay: '1s'
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
                    style={{
                        bottom: '20%',
                        left: '40%',
                        background: 'radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, transparent 70%)',
                        animationDuration: '6s',
                        animationDelay: '2s'
                    }}
                />
            </div>

            {/* Click Effects */}
            {clickEffects.map(effect => (
                <div
                    key={effect.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${effect.x}%`,
                        top: `${effect.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="relative">
                        {/* Ripple 1 */}
                        <div
                            className="absolute w-4 h-4 rounded-full bg-white/30 animate-ping"
                            style={{ animationDuration: '0.8s' }}
                        />
                        {/* Ripple 2 */}
                        <div
                            className="absolute w-8 h-8 -top-2 -left-2 rounded-full border-2 border-white/20"
                            style={{
                                animation: 'clickRipple 0.8s ease-out forwards'
                            }}
                        />
                        {/* Burst particles */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                                style={{
                                    animation: `particle${i % 3} 0.6s ease-out forwards`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            <style jsx>{`
                @keyframes clickRipple {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(8);
                        opacity: 0;
                    }
                }
                @keyframes particle0 {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(30px, -40px) scale(0); opacity: 0; }
                }
                @keyframes particle1 {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(-35px, -25px) scale(0); opacity: 0; }
                }
                @keyframes particle2 {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(40px, 20px) scale(0); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
