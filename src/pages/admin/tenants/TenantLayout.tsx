import React from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Activity,
    Settings,
    LayoutDashboard,
    Users,
    ChevronLeft,
    Maximize2,
    Trash2,
    Network
} from 'lucide-react';
import { useAdminTenantDetails } from '@/hooks/admin/useAdminTenantDetails';
import { TenantProvider } from './TenantContext';
import { StatusBadge } from '@/components/admin/super/AdminShared';
import { superAdminApi } from '@/services/api/superAdminApi';

const TenantLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { tenant, loading, refresh } = useAdminTenantDetails(id);

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE this tenant and all associated data (sales, products, users)? This cannot be undone.')) {
            try {
                await superAdminApi.deleteTenant(id);
                navigate('/admin/tenants');
            } catch (error) {
                console.error('Deletion failed:', error);
                alert('Failed to delete tenant. Please check server logs.');
            }
        }
    };

    // If loading for the first time
    if (loading && !tenant) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!tenant && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <h2 className="text-xl font-bold mb-2">Tenant Not Found</h2>
                <button onClick={() => navigate('/admin/tenants')} className="text-indigo-600 font-bold hover:underline">
                    Return to List
                </button>
            </div>
        );
    }

    // safe because of check above
    const currentTenant = tenant!;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'integrations', label: 'Integrations', icon: Network },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const currentTab = location.pathname.split('/').pop() || 'overview';

    return (
        <TenantProvider tenant={currentTenant} refresh={refresh} loading={loading}>
            <div className="flex flex-col h-full space-y-6">
                {/* Header Area */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative">
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-50 rounded-full text-slate-300 hover:text-red-500 transition-all"
                            title="Delete Tenant"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => navigate('/admin/tenants')}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm overflow-hidden font-black text-3xl">
                            {currentTenant.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-slate-900">{currentTenant.name}</h2>
                                <StatusBadge status={currentTenant.subscription_status} />
                            </div>
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Maximize2 className="h-3 w-3" /> Instance: {currentTenant.slug}.multi-pos.io
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 mt-8 overflow-x-auto pb-1 no-scrollbar">
                        {tabs.map(tab => {
                            const isActive = currentTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(`/admin/tenants/${currentTenant.id}/${tab.id}`)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}
                                    `}
                                >
                                    <tab.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    <Outlet />
                </div>
            </div>
        </TenantProvider>
    );
};

export default TenantLayout;
