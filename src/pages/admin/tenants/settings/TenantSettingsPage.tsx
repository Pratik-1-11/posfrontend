import React, { useState } from 'react';
import { useTenantContext } from '../TenantContext';
import { useToast } from '@/hooks/use-toast';
import { superAdminApi } from '@/services/api/superAdminApi';
import {
    Cpu,
    Users,
    ShoppingCart,
    Database,
    Save,
    Globe,
    Server,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { FeatureToggle } from '@/components/admin/super/AdminShared';

const LimitInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; icon: React.ReactNode }> = ({ label, value, onChange, icon }) => (
    <div>
        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 px-1">{label}</label>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-500">{icon}</div>
            <input
                type="number"
                value={value}
                onChange={e => onChange(parseInt(e.target.value) || 0)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-800"
            />
        </div>
    </div>
);

const DataAction: React.FC<{ icon: React.ReactNode; label: string; desc: string }> = ({ icon, label, desc }) => (
    <button className="w-full text-left p-4 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all flex items-start gap-4 group">
        <div className="p-3 bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 rounded-2xl transition-all shadow-inner">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-5 w-5' }) : icon}
        </div>
        <div>
            <div className="text-sm font-bold text-slate-800">{label}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">{desc}</div>
        </div>
    </button>
);

const TenantSettingsPage: React.FC = () => {
    const { tenant, refresh } = useTenantContext();
    const { toast } = useToast();
    const [limits, setLimits] = useState(tenant?.resource_limits || { max_users: 5, max_products: 100, storage_gb: 1, features: [] as string[] });

    // Update state when tenant changes (e.g. reload)
    React.useEffect(() => {
        if (tenant?.resource_limits) {
            setLimits(tenant.resource_limits);
        }
    }, [tenant]);

    if (!tenant) return null;

    const handleSaveLimits = async () => {
        try {
            await superAdminApi.updateTenantLimits(tenant.id, limits);
            toast({ title: "Quotas Updated", description: "Resource limits have been synchronized." });
            refresh();
        } catch (error) {
            toast({ title: "Failed", description: "Could not update resource quotas.", variant: "destructive" });
        }
    };

    const handleUpdateStatus = async (tenantId: string, currentStatus: string) => {
        try {
            if (currentStatus === 'active') {
                await superAdminApi.suspendTenant(tenantId);
                toast({ title: "Suspended", description: "Tenant access has been revoked" });
            } else {
                await superAdminApi.activateTenant(tenantId);
                toast({ title: "Activated", description: "Tenant access has been restored" });
            }
            refresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-indigo-500">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-indigo-500" /> Resource Quota Editor
                    </h3>

                    <div className="space-y-5">
                        <LimitInput label="Max Platform Users" value={limits.max_users} onChange={v => setLimits({ ...limits, max_users: v })} icon={<Users className="h-4 w-4" />} />
                        <LimitInput label="Inventory Threshold" value={limits.max_products} onChange={v => setLimits({ ...limits, max_products: v })} icon={<ShoppingCart className="h-4 w-4" />} />
                        <LimitInput label="Storage Volume (GB)" value={limits.storage_gb} onChange={v => setLimits({ ...limits, storage_gb: v })} icon={<Database className="h-4 w-4" />} />

                        <div className="pt-4">
                            <button
                                onClick={handleSaveLimits}
                                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                            >
                                <Save className="h-4 w-4" /> Commit Quota Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" /> Feature Gates
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {(['inventory', 'analytics', 'crm', 'branches'] as const).map(feature => (
                            <FeatureToggle
                                key={feature}
                                label={feature.replace(/^\w/, c => c.toUpperCase()) + (feature === 'inventory' ? ' Pro' : '')}
                                enabled={limits.features.includes(feature)}
                                onToggle={() => {
                                    const newFeatures = limits.features.includes(feature)
                                        ? limits.features.filter(f => f !== feature)
                                        : [...limits.features, feature];
                                    setLimits({ ...limits, features: newFeatures });
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Server className="h-4 w-4 text-rose-500" /> Administrative Actions
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <div className="text-sm font-bold text-slate-800">Account Access</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase">Lifecycle Group</div>
                            </div>
                            <button
                                onClick={() => handleUpdateStatus(tenant.id, tenant.subscription_status)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${tenant.is_active
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                    }`}
                            >
                                {tenant.is_active ? 'Suspend Node' : 'Initialize Node'}
                            </button>
                        </div>

                        <DataAction icon={<RefreshCw />} label="Force Global Sync" desc="Invalidate all tenant cache" />
                        <DataAction icon={<Database />} label="Snapshot Data" desc="Generate multi-table SQL export" />
                    </div>
                </div>

                <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-inner">
                    <div className="flex items-center gap-2 text-rose-600 font-bold mb-3">
                        <AlertCircle className="h-4 w-4" /> Node Decommissioning
                    </div>
                    <p className="text-[10px] text-rose-500 font-medium mb-4 italic">Permanently removes this tenant cluster from the platform. Action is logged and non-reversible.</p>
                    <button className="w-full py-3 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
                        Destroy Tenant Node
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TenantSettingsPage;
