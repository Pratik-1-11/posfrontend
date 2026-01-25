import React, { useState } from 'react';
import {
    Search,
    Building2,
    Users,
    ShoppingCart,
    Filter,
    ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminTenants } from '@/hooks/admin/useAdminTenants';
import { StatusBadge, GlassCard, GradientText } from '@/components/admin/super/AdminShared';
import { TenantModal } from '@/components/admin/TenantModal';
import { superAdminApi } from '@/services/api/superAdminApi';
import { PlatformOverview } from '@/components/admin/super/PlatformOverview';
import { useAdminPlatform } from '@/hooks/admin/useAdminPlatform';
import { cn } from '@/lib/utils';

const TenantListPage: React.FC = () => {
    const { tenants, loading, refresh } = useAdminTenants();
    const { stats } = useAdminPlatform();
    const navigate = useNavigate();

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || tenant.subscription_status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 p-2 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic">
                        Node <GradientText>Orchestration</GradientText>
                    </h1>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Management & Performance Monitoring</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 active:scale-95 group"
                >
                    <Building2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    Onboard New Node
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-14rem)]">
                {/* Left Console: Tenant Selection */}
                <div className="w-full lg:w-[480px] flex flex-col gap-6">
                    <GlassCard className="p-6 border-slate-200/50 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Filter className="h-3 w-3 text-indigo-500" /> Control Filters
                            </h3>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search clusters by name or namespace..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-300"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['all', 'active', 'trial', 'suspended'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                        filterStatus === status
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />)
                        ) : filteredTenants.map(tenant => (
                            <button
                                key={tenant.id}
                                onClick={() => navigate(`/admin/tenants/${tenant.id}/overview`)}
                                className="w-full group relative overflow-hidden active:scale-[0.98] transition-all"
                            >
                                <GlassCard className="p-6 text-left border-slate-100 group-hover:border-indigo-200 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/20">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-lg leading-none">
                                                {tenant.name}
                                            </h3>
                                            <p className="text-[10px] font-mono text-slate-400 font-medium">/{tenant.slug}</p>
                                        </div>
                                        <StatusBadge status={tenant.subscription_status} />
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 group/stat">
                                            <div className="p-2 bg-slate-50 rounded-lg group-hover/stat:bg-white group-hover/stat:shadow-sm transition-all">
                                                <Users className="h-3.5 w-3.5 text-slate-400 group-hover/stat:text-indigo-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-900 leading-none">{tenant.stats?.users || 0}</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Seats</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 group/stat">
                                            <div className="p-2 bg-slate-50 rounded-lg group-hover/stat:bg-white group-hover/stat:shadow-sm transition-all">
                                                <ShoppingCart className="h-3.5 w-3.5 text-slate-400 group-hover/stat:text-indigo-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-900 leading-none">{tenant.stats?.sales || 0}</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Orders</div>
                                            </div>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <ArrowRight className="h-4 w-4 text-indigo-500" />
                                        </div>
                                    </div>
                                </GlassCard>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel HUD: Platform Intelligence */}
                <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
                    <PlatformOverview tenants={tenants} stats={stats} />
                </div>
            </div>

            <TenantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode="create"
                onSubmit={async (data) => {
                    await superAdminApi.createTenant(data);
                    refresh();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
};

export default TenantListPage;

