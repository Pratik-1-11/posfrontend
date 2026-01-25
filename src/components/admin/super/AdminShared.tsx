import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn(
        "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] transition-all duration-300",
        className
    )}>
        {children}
    </div>
);

export const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-black", className)}>
        {children}
    </span>
);

export const KPICard: React.FC<{
    title: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    color: 'indigo' | 'purple' | 'emerald' | 'blue';
}> = ({ title, value, subValue, trend, trendUp, icon, color }) => {
    const bgColors = {
        indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
        purple: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        blue: 'bg-blue-500/10 text-blue-600 border-blue-200/50'
    };

    return (
        <GlassCard className="p-6 group hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.98]">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl border transition-transform group-hover:scale-110 duration-500", bgColors[color])}>
                    {icon}
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                        trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
                {subValue && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{subValue}</span>}
            </div>
        </GlassCard>
    );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        trial: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
        suspended: 'bg-rose-500/10 text-rose-600 border-rose-200/50',
        cancelled: 'bg-slate-200/50 text-slate-500 border-slate-300'
    };
    return (
        <span className={cn(
            "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105",
            styles[status.toLowerCase()] || styles.cancelled
        )}>
            {status}
        </span>
    );
};

export const MiniMetric: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => {
    const colorStyles: Record<string, string> = {
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100'
    };
    return (
        <GlassCard className="p-4 group hover:bg-white transition-colors border-slate-100">
            <div className={cn("p-2.5 rounded-2xl w-fit mb-3 border transition-transform group-hover:rotate-12", colorStyles[color])}>{icon}</div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-1 tracking-tighter">{value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
        </GlassCard>
    );
};

export const UsageBar: React.FC<{ label: string; used: number; limit: number; unit: string }> = ({ label, used, limit, unit }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    return (
        <div className="space-y-2.5">
            <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
                    <span className="text-xs font-bold text-slate-900">{used} <span className="text-[10px] text-slate-400 font-medium">/ {limit} {unit}</span></span>
                </div>
                <span className={cn("text-[10px] font-black", percentage > 90 ? 'text-rose-600' : 'text-indigo-600')}>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100/50 rounded-full overflow-hidden border border-slate-200/30 p-0.5">
                <div
                    className={cn(
                        "h-full transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]",
                        percentage > 90 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : percentage > 70 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export const HUDSectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg ring-4 ring-slate-100">
            {icon}
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em]">{children}</h3>
    </div>
);
