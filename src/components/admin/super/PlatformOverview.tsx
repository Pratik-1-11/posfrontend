import React from 'react';
import {
    Shield,
    Activity,
    TrendingUp,
    Zap,
    Users,
    Globe
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { type TenantWithStats, type PlatformStats } from '@/services/api/superAdminApi';
import { GlassCard, HUDSectionTitle } from './AdminShared';

export const PlatformOverview: React.FC<{ tenants: TenantWithStats[], stats?: PlatformStats | null }> = ({ tenants, stats }) => {
    // Growth data (now dynamic from backend if available)
    const growthData = stats?.growthData && stats.growthData.length > 0
        ? stats.growthData
        : [
            { name: 'W1', tenants: Math.max(1, tenants.length - 4), revenue: 12000 },
            { name: 'W2', tenants: Math.max(2, tenants.length - 2), revenue: 25000 },
            { name: 'W3', tenants: Math.max(3, tenants.length - 1), revenue: 19000 },
            { name: 'W4', tenants: tenants.length, revenue: 38000 },
            { name: 'W5', tenants: tenants.length, revenue: 45000 },
        ];

    const totalRevenue = stats?.totalRevenue || tenants.reduce((sum, t) => sum + (t.stats?.revenue || 0), 0);
    const activeTenants = stats?.activeTenants || tenants.filter(t => t.subscription_status === 'active' || t.subscription_status === 'trial').length;
    const healthPercentage = stats?.systemUptime || (tenants.length > 0 ? (activeTenants / tenants.length) * 100 : 100);

    return (
        <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar p-2">
            {/* Header HUD */}
            <GlassCard className="p-8 border-none bg-slate-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 h-24 w-24 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform group-hover:rotate-6 transition-transform duration-700">
                        <Shield className="h-12 w-12 text-white" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Platform HUD</h2>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Online</span>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium max-w-lg mb-6">Centralized orchestration and deep-intelligence for branch clusters.</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Gross Volume</span>
                                <span className="text-xl font-black text-white">NPR {totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Node Count</span>
                                <span className="text-xl font-black text-white">{tenants.length} <span className="text-xs text-indigo-400">Nodes</span></span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Global Uptime</span>
                                <span className="text-xl font-black text-emerald-400">{healthPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Regions</span>
                                <span className="text-xl font-black text-purple-400">Multi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Velocity */}
                <GlassCard className="p-8">
                    <HUDSectionTitle icon={<TrendingUp size={18} />}>Revenue Velocity</HUDSectionTitle>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(8px)'
                                    }}
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

                {/* Growth Stats */}
                <div className="space-y-6">
                    <HUDSectionTitle icon={<Zap size={18} />}>Flash Intelligence</HUDSectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <GlassCard className="p-6 bg-gradient-to-br from-white to-indigo-50/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                    <Users size={20} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500">+12%</span>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</h4>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">4,812</p>
                        </GlassCard>

                        <GlassCard className="p-6 bg-gradient-to-br from-white to-purple-50/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
                                    <Globe size={20} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500">Stable</span>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">API Clusters</h4>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">03</p>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-6 bg-slate-50 border-slate-200/50">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Activity Stack</h4>
                            <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/50 shadow-sm">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Activity size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800">Node Cluster {i} provisioned</p>
                                        <p className="text-[9px] text-slate-400 font-medium">2 hours ago • Primary Region</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

