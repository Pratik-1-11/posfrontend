import React, { useEffect, useState } from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    Activity,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { superAdminApi, type PlatformStats } from '@/services/api/superAdminApi';
import { GlassCard } from '@/components/admin/super/AdminShared';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export const PlatformConsoleOverview: React.FC = () => {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await superAdminApi.getPlatformStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch platform stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-6" />
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Aggregating Platform Intelligence...</p>
            </div>
        );
    }

    const tierData = stats?.tierDistribution ? Object.entries(stats.tierDistribution).map(([name, value]) => ({
        name: name.toUpperCase(),
        value
    })) : [];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* HUD Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Command Center</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <Activity size={12} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Platform Healthy</span>
                        </div>
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{stats?.systemUptime.toFixed(3)}% System Stability</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="px-6 py-4 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-200">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Global Users</div>
                        <div className="text-2xl font-black tracking-tighter">{(stats?.totalUsers || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Clusters', val: stats?.activeTenants, change: '+12%', up: true, icon: Building2, color: 'indigo' },
                    { label: 'Monthly Revenue', val: `NPR ${stats?.totalRevenue.toLocaleString()}`, change: '+24%', up: true, icon: TrendingUp, color: 'emerald' },
                    { label: 'ARPU (Monthly)', val: `NPR ${((stats as any)?.arpu || 0).toLocaleString()}`, change: '-2%', up: false, icon: Zap, color: 'amber' },
                    { label: 'Active Sessions', val: '412', change: '+88', up: true, icon: Users, color: 'rose' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 border-slate-100 group hover:scale-[1.02] transition-all duration-500">
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                                "p-3 rounded-2xl",
                                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                            )}>
                                <stat.icon size={24} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-black uppercase",
                                stat.up ? 'text-emerald-500' : 'text-rose-500'
                            )}>
                                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth */}
                <GlassCard className="lg:col-span-2 p-8 border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Growth Velocity</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 6 Months Trajectory</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.growthData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '900' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Tier Distribution */}
                <GlassCard className="p-8 border-slate-100">
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Tier Saturation</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active nodes by subscription plan</p>
                    </div>
                    <div className="h-[250px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tierData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                    width={100}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                    {tierData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        {tierData.map((tier, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{tier.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900">{tier.value} Nodes</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
