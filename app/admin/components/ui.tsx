// UI Component Library for Admin Panel

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

// ============ BUTTON ============
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-500 shadow-lg shadow-blue-500/25',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-500 border border-slate-700',
        danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-red-500 shadow-lg shadow-red-500/25',
        ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-slate-500',
        success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin">⏳</span>
            ) : icon}
            {children}
        </button>
    );
}

// ============ CARD ============
interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

export function Card({ children, className = '', hover = false, gradient = false }: CardProps) {
    return (
        <div className={`
            bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 
            ${hover ? 'hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300' : ''}
            ${gradient ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/50' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-slate-800/50 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

// ============ INPUT ============
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </span>
                )}
                <input
                    className={`
                        w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700/50'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}

// ============ SELECT ============
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <select
                className={`
                    w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all
                    ${className}
                `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-800">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ============ BADGE ============
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
    const variants = {
        default: 'bg-slate-700 text-slate-300',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
}

// ============ STAT CARD ============
interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: { value: number; isPositive: boolean };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
    const colors = {
        blue: 'from-blue-600 to-blue-400',
        green: 'from-emerald-600 to-emerald-400',
        purple: 'from-purple-600 to-purple-400',
        orange: 'from-orange-600 to-orange-400',
        red: 'from-red-600 to-red-400',
    };

    return (
        <Card hover className="relative overflow-hidden">
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-white">{value.toLocaleString('tr-TR')}</p>
                        {trend && (
                            <p className={`text-sm mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>%{Math.abs(trend.value)}</span>
                                <span className="text-slate-500 text-xs ml-1">geçen haftaya göre</span>
                            </p>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl shadow-lg`}>
                        {icon}
                    </div>
                </div>
                {/* Decorative gradient */}
                <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full blur-2xl`}></div>
            </CardContent>
        </Card>
    );
}

// ============ LOADING SKELETON ============
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-slate-800 rounded ${className}`}></div>
    );
}

// ============ TABLE ============
interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'Veri bulunamadı',
    onRowClick
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <span className="text-4xl block mb-3">📭</span>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-800/50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            className={`hover:bg-slate-800/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={`px-4 py-4 ${col.className || ''}`}>
                                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============ PAGINATION ============
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                ← Önceki
            </Button>
            <span className="text-slate-400 px-4 text-sm">
                {currentPage} / {totalPages}
            </span>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                Sonraki →
            </Button>
        </div>
    );
}

// ============ PAGE HEADER ============
interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
                {icon && <span className="text-4xl">{icon}</span>}
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    {description && <p className="text-slate-400 mt-1">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
}
