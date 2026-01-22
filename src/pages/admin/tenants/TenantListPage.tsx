import React, { useState } from 'react';
import {
    Search,
    Building2,
    Eye,
    Users,
    ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminTenants } from '@/hooks/admin/useAdminTenants';
import { StatusBadge } from '@/components/admin/super/AdminShared';
import { TenantModal } from '@/components/admin/TenantModal';
import { superAdminApi } from '@/services/api/superAdminApi';
import { PlatformOverview } from '@/components/admin/super/PlatformOverview';

import { useAdminPlatform } from '@/hooks/admin/useAdminPlatform';

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">Tenant Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitor and control individual business clusters.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    <Building2 className="h-4 w-4" /> Onboard New Tenant
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
                {/* Left Sidebar: Tenant List */}
                <div className="w-full lg:w-[450px] flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['all', 'active', 'trial', 'suspended'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${filterStatus === status ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />)
                        ) : filteredTenants.map(tenant => (
                            <button
                                key={tenant.id}
                                onClick={() => navigate(`/admin/tenants/${tenant.id}/overview`)}
                                className="w-full p-4 rounded-3xl border text-left transition-all hover:shadow-md group relative overflow-hidden bg-white border-slate-200 hover:border-indigo-200"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 text-indigo-600 rounded-bl-2xl">
                                    <Eye className="h-3 w-3" />
                                </div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-8">{tenant.name}</h3>
                                    <StatusBadge status={tenant.subscription_status} />
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {tenant.stats?.users || 0}</span>
                                    <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> {tenant.stats?.sales || 0}</span>
                                    <span className="flex items-center gap-1 opacity-60">ID: {tenant.id.slice(0, 8)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Platform Overview (when no tenant selected) */}
                <div className="flex-1 min-w-0 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
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
