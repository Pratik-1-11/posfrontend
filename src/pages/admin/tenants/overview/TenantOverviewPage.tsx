import React, { useState } from 'react';
import {
    Users,
    ShoppingCart,
    Database,
    TrendingUp,
    Activity,
    AlertCircle,
    Edit2,
    Shield,
    ShieldCheck,
} from 'lucide-react';
import {
    MiniMetric,
    UsageBar,
} from '@/components/admin/super/AdminShared';
import { useTenantContext } from '../TenantContext';
import { TenantModal } from '@/components/admin/TenantModal';
import { superAdminApi } from '@/services/api/superAdminApi';

const PLAN_FEATURES: Record<string, { name: string; features: string[]; color: string }> = {
    basic: {
        name: 'Standard Node',
        color: 'text-slate-600 bg-slate-100',
        features: ['Retail POS', 'Inventory v1', 'Basic Reports', 'Single Branch']
    },
    pro: {
        name: 'Enterprise Pro',
        color: 'text-indigo-600 bg-indigo-50',
        features: ['Advanced Analytics', 'CRM Engine', 'Multi-Branch Support', 'Priority API']
    },
    enterprise: {
        name: 'Global Scale',
        color: 'text-purple-600 bg-purple-50',
        features: ['White-labeling', 'Dedicated Cluster', '24/7 SRE Support', 'Custom Integrations']
    }
};

const InfoSection: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
    </div>
);

const TenantOverviewPage: React.FC = () => {
    const { tenant, refresh } = useTenantContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!tenant) return null;

    const plan = PLAN_FEATURES[tenant.subscription_tier] || PLAN_FEATURES.basic;

    const handleVerifyTenant = async () => {
        try {
            await superAdminApi.verifyTenant(tenant.id);
            refresh();
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MiniMetric icon={<Users />} label="Users" value={tenant.stats?.users || 0} color="indigo" />
                <MiniMetric icon={<ShoppingCart />} label="Orders" value={tenant.stats?.sales || 0} color="emerald" />
                <MiniMetric icon={<Database />} label="Products" value={tenant.stats?.products || 0} color="purple" />
                <MiniMetric icon={<TrendingUp />} label="Revenue" value={`NPR ${(tenant.stats?.revenue || 0).toLocaleString()}`} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" /> Resource Consumption</span>
                            <div className="flex gap-2">
                                {!tenant.verified && (
                                    <button
                                        onClick={handleVerifyTenant}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <ShieldCheck className="h-3 w-3" /> Verify Tenant
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Edit2 className="h-3 w-3" /> Edit Profile
                                </button>
                            </div>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <UsageBar
                                label="User Quota"
                                used={tenant.stats?.users || 0}
                                limit={tenant.resource_limits?.max_users || 5}
                                unit="Seats"
                            />
                            <UsageBar
                                label="Stored Products"
                                used={tenant.stats?.products || 0}
                                limit={tenant.resource_limits?.max_products || 100}
                                unit="SKUs"
                            />
                            <UsageBar
                                label="Store Branches"
                                used={tenant.current_stores_count || 0}
                                limit={tenant.max_stores || 1}
                                unit="Locations"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold text-sm">
                                <AlertCircle className="h-4 w-4" /> Active Subscription Plan
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-2">{plan.name}</h4>
                                    <p className="text-slate-500 text-sm font-medium">Provisioned on the platform's high-speed nodes.</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border ${plan.color}`}>
                                        {tenant.subscription_tier} Tier
                                    </div>
                                    {tenant.verified ? (
                                        <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                            <ShieldCheck className="h-3 w-3" /> Verified Business
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                                            <Shield className="h-3 w-3" /> Unverified
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {plan.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Deployment Infrastructure</h3>
                        <div className="space-y-4">
                            <InfoSection label="Instance ID" value={tenant.id.slice(0, 18) + '...'} />
                            <InfoSection label="Slug / Namespace" value={tenant.slug} />
                            <InfoSection label="Operational Status" value={tenant.is_active ? 'Healthy / Active' : 'Offline / Suspended'} />
                            <InfoSection label="Plan Interval" value={tenant.plan_interval === 'yearly' ? 'Yearly Billing' : 'Monthly Billing'} />
                            <InfoSection label="Expiry Date" value={tenant.subscription_end_date ? new Date(tenant.subscription_end_date).toLocaleDateString() : 'No expiry set'} />
                            <InfoSection label="Onboarded Since" value={new Date(tenant.created_at).toLocaleDateString()} />
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
                        <h4 className="font-black uppercase tracking-widest text-[10px] opacity-60 mb-3">Service Level</h4>
                        <p className="text-sm font-bold mb-4">99.9% Uptime SLA Guaranteed for this node.</p>
                        <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            View Uptime Logs
                        </button>
                    </div>
                </div>
            </div>
            <TenantModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={tenant}
                onSubmit={async (data: any) => {
                    await superAdminApi.updateTenant(tenant.id, data);
                    await refresh();
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
};

export default TenantOverviewPage;
