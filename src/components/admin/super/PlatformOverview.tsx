import React from 'react';
import {
    Shield
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { type TenantWithStats, type PlatformStats } from '@/services/api/superAdminApi';

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
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="max-w-md mx-auto">
                    <div className="bg-indigo-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Platform Master Console</h2>
                    <p className="text-slate-500 font-medium mb-8">Access platform analytics and cross-tenant controls from this command center.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Total Revenue</span>
                        <span className="text-sm font-bold text-slate-800 truncate">Rs. {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Total Nodes</span>
                        <span className="text-sm font-bold text-slate-800">{tenants.length} Active</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-indigo-600">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Node Health</span>
                        <span className="text-sm font-bold">{healthPercentage.toFixed(1)}% Stable</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
                        Onboarding Velocity
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-black">L30D</span>
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="tenants" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
