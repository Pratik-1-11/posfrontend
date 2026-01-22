import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    X
} from 'lucide-react';

export const KPICard: React.FC<{
    title: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    color: 'indigo' | 'purple' | 'emerald' | 'blue';
}> = ({ title, value, subValue, trend, trendUp, icon, color }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {trend}
                    </div>
                )}
            </div>
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{value}</span>
                {subValue && <span className="text-[10px] text-slate-400 font-bold">{subValue}</span>}
            </div>
        </div>
    );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        trial: 'bg-blue-50 text-blue-700 border-blue-100',
        suspended: 'bg-rose-50 text-rose-700 border-rose-100',
        cancelled: 'bg-slate-50 text-slate-700 border-slate-100'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles.cancelled}`}>
            {status}
        </span>
    );
};

export const MiniMetric: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => {
    const colors: Record<string, string> = {
        indigo: 'text-indigo-600 bg-indigo-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        purple: 'text-purple-600 bg-purple-50',
        blue: 'text-blue-600 bg-blue-50'
    };
    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm transition-all hover:translate-y-[-2px]">
            <div className={`p-2.5 rounded-2xl w-fit mb-3 ${colors[color]}`}>{icon}</div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
        </div>
    );
};

export const UsageBar: React.FC<{ label: string; used: number; limit: number; unit: string }> = ({ label, used, limit, unit }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    return (
        <div>
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{label}</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase">{used} / {limit} {unit}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div className={`h-full transition-all duration-1000 rounded-full ${percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const FeatureToggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void }> = ({ label, enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${enabled ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
    >
        <span className="text-[10px] font-black uppercase tracking-tighter truncate">{label}</span>
        {enabled ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </button>
);

export const Switch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 transition-all ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
        <div className={`h-4 w-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
);
