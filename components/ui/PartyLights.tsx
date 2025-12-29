'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PartyLightsProps {
    children: React.ReactNode;
    className?: string;
}

export default function PartyLights({ children, className = '' }: PartyLightsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseInfluence, setMouseInfluence] = useState({ x: 50, y: 50 });
    const [time, setTime] = useState(0);
    const [splashes, setSplashes] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

    // Smooth animation loop
    useEffect(() => {
        let animationId: number;
        const animate = () => {
            setTime(t => t + 0.008);
            animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, []);

    // Handle mouse movement with smoothing
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let targetX = 50;
        let targetY = 50;
        let currentX = 50;
        let currentY = 50;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            targetX = ((e.clientX - rect.left) / rect.width) * 100;
            targetY = ((e.clientY - rect.top) / rect.height) * 100;
        };

        // Smooth interpolation
        const smoothUpdate = () => {
            currentX += (targetX - currentX) * 0.02;
            currentY += (targetY - currentY) * 0.02;
            setMouseInfluence({ x: currentX, y: currentY });
        };

        container.addEventListener('mousemove', handleMouseMove);
        const smoothInterval = setInterval(smoothUpdate, 16);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            clearInterval(smoothInterval);
        };
    }, []);

    // Handle clicks - color splash
    const handleClick = useCallback((e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const colors = ['#5EB0EF', '#A78BFA', '#F472B6', '#22D3EE', '#10B981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const id = Date.now();

        setSplashes(prev => [...prev, { id, x, y, color }]);

        setTimeout(() => {
            setSplashes(prev => prev.filter(s => s.id !== id));
        }, 1500);
    }, []);

    // Calculate smooth floating positions
    const orb1X = 20 + Math.sin(time * 0.7) * 15 + (mouseInfluence.x - 50) * 0.3;
    const orb1Y = 25 + Math.cos(time * 0.5) * 20 + (mouseInfluence.y - 50) * 0.2;
    const orb2X = 75 + Math.sin(time * 0.5 + 2) * 18 + (mouseInfluence.x - 50) * 0.2;
    const orb2Y = 30 + Math.cos(time * 0.6 + 1) * 15 + (mouseInfluence.y - 50) * 0.25;
    const orb3X = 50 + Math.sin(time * 0.4 + 4) * 25 + (mouseInfluence.x - 50) * 0.15;
    const orb3Y = 70 + Math.cos(time * 0.7 + 3) * 12 + (mouseInfluence.y - 50) * 0.2;
    const orb4X = 85 + Math.sin(time * 0.6 + 1) * 10 + (mouseInfluence.x - 50) * 0.25;
    const orb4Y = 65 + Math.cos(time * 0.4 + 2) * 18 + (mouseInfluence.y - 50) * 0.15;

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className={`relative overflow-hidden ${className}`}
            style={{
                background: 'linear-gradient(135deg, #0A0F1C 0%, #12182B 50%, #0F172A 100%)'
            }}
        >
            {/* Floating Light Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Main Blue Orb */}
                <div
                    className="absolute w-[500px] h-[400px] rounded-full blur-[100px] transition-all duration-1000"
                    style={{
                        left: `${orb1X}%`,
                        top: `${orb1Y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(94, 176, 239, 0.25) 0%, transparent 70%)',
                    }}
                />

                {/* Purple Orb */}
                <div
                    className="absolute w-[450px] h-[350px] rounded-full blur-[90px] transition-all duration-1000"
                    style={{
                        left: `${orb2X}%`,
                        top: `${orb2Y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
                    }}
                />

                {/* Pink Orb */}
                <div
                    className="absolute w-[400px] h-[300px] rounded-full blur-[80px] transition-all duration-1000"
                    style={{
                        left: `${orb3X}%`,
                        top: `${orb3Y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(244, 114, 182, 0.15) 0%, transparent 70%)',
                    }}
                />

                {/* Cyan Orb */}
                <div
                    className="absolute w-[350px] h-[280px] rounded-full blur-[70px] transition-all duration-1000"
                    style={{
                        left: `${orb4X}%`,
                        top: `${orb4Y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* Click Splash Effects */}
            {splashes.map(splash => (
                <div
                    key={splash.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${splash.x}%`,
                        top: `${splash.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div
                        className="w-4 h-4 rounded-full animate-splash-ring"
                        style={{
                            boxShadow: `0 0 60px 30px ${splash.color}40, 0 0 100px 60px ${splash.color}20`,
                            background: `radial-gradient(circle, ${splash.color}60 0%, transparent 70%)`
                        }}
                    />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            <style jsx>{`
                @keyframes splash-ring {
                    0% {
                        transform: scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(15);
                        opacity: 0;
                    }
                }
                .animate-splash-ring {
                    animation: splash-ring 1.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
