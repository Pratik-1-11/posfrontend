import React from 'react';
import {
    GlassCard,
    GradientText,
    HUDSectionTitle
} from '@/components/admin/super/AdminShared';
import {
    Users,
    Package,
    Store,
    Check,
    Zap,
    Globe,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminTenants } from '@/hooks/admin/useAdminTenants';

const PLAN_DETAILS = [
    {
        tier: 'basic',
        name: 'Starter Cluster',
        price: '₹999',
        interval: '/mo',
        description: 'Perfect for local single-unit retail businesses.',
        color: 'indigo',
        icon: <Zap className="h-6 w-6" />,
        limits: {
            users: 5,
            products: 500,
            stores: 1
        },
        features: [
            'Single Branch POS',
            'Core Inventory v2',
            'Daily Email Reports',
            'Standard API Rate-limit',
            'Community Support'
        ]
    },
    {
        tier: 'pro',
        name: 'Business Pro',
        price: '₹2,999',
        interval: '/mo',
        description: 'Advanced features for growing multi-store networks.',
        color: 'purple',
        icon: <Globe className="h-6 w-6" />,
        limits: {
            users: 25,
            products: '5,000',
            stores: 5
        },
        features: [
            'Up to 5 Branches',
            'Advanced Multi-store Sync',
            'CRM & Loyalty Engine',
            'Priority API Access',
            'Direct Slack Support'
        ],
        popular: true
    },
    {
        tier: 'enterprise',
        name: 'Enterprise Hub',
        price: 'Custom',
        interval: '',
        description: 'Unlimited scale for high-volume retail enterprises.',
        color: 'slate',
        icon: <ShieldCheck className="h-6 w-6" />,
        limits: {
            users: '∞',
            products: '∞',
            stores: '∞'
        },
        features: [
            'Unlimited Branches',
            'Dedicated Database Cluster',
            'White-label Reporting',
            'Custom Integrations',
            '24/7 SRE Response'
        ]
    }
];

export const SubscriptionPlansPage: React.FC = () => {
    const { tenants } = useAdminTenants();

    // Calculate tenant distribution
    const distribution = tenants.reduce((acc, tenant) => {
        acc[tenant.subscription_tier] = (acc[tenant.subscription_tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-10 p-2 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic">
                        Subscription <GradientText>Architecture</GradientText>
                    </h1>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Tier Definitions & Feature Matrix</p>
                </div>

                <GlassCard className="px-6 py-3 flex items-center gap-6 border-slate-100">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Billing: <span className="text-slate-900 italic">Production</span></span>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLAN_DETAILS.map((plan) => (
                    <GlassCard
                        key={plan.tier}
                        className={cn(
                            "relative flex flex-col p-8 transition-all duration-500 group overflow-hidden",
                            plan.popular ? "border-indigo-200 ring-4 ring-indigo-500/5 shadow-2xl shadow-indigo-500/10" : "border-slate-100"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-indigo-200">
                                    Highly Adopted
                                </span>
                            </div>
                        )}

                        <div className={cn(
                            "h-16 w-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:rotate-6 duration-500",
                            plan.tier === 'basic' ? "bg-indigo-50 text-indigo-600 shadow-indigo-100" :
                                plan.tier === 'pro' ? "bg-purple-50 text-purple-600 shadow-purple-100" :
                                    "bg-slate-900 text-white shadow-slate-200"
                        )}>
                            {plan.icon}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">{plan.name}</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                            <span className="text-sm font-bold text-slate-300 uppercase">{plan.interval}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {[
                                { label: 'Users', val: plan.limits.users, icon: <Users size={12} /> },
                                { label: 'Products', val: plan.limits.products, icon: <Package size={12} /> },
                                { label: 'Stores', val: plan.limits.stores, icon: <Store size={12} /> }
                            ].map(limit => (
                                <div key={limit.label} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors text-center">
                                    <div className="text-slate-300 mb-1 flex justify-center">{limit.icon}</div>
                                    <div className="text-[10px] font-black text-slate-900 mb-0.5">{limit.val}</div>
                                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{limit.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 space-y-4 mb-10">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Included Capabilities</h4>
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 leading-snug">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Deployments</div>
                                <div className="text-xl font-black text-slate-900">{distribution[plan.tier] || 0}</div>
                            </div>
                            <button className="h-12 px-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                                Configure Tier
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <GlassCard className="p-8 border-slate-100 bg-gradient-to-br from-white to-slate-50/50">
                <HUDSectionTitle icon={<Zap size={18} />}>Dynamic Limit Policies</HUDSectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: 'Overage Tolerance', val: '15%', desc: 'Buffer allowed before hard suspension.' },
                        { title: 'Grace Period', val: '72h', desc: 'Delay between expiry and node cut-off.' },
                        { title: 'Legacy Support', val: 'Active', desc: 'Older versions compatibility window.' },
                        { title: 'Global Tax Engine', val: 'v1.4', desc: 'Centralized compliance engine version.' }
                    ].map(policy => (
                        <div key={policy.title} className="space-y-1">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{policy.title}</h5>
                            <p className="text-xl font-black text-slate-900">{policy.val}</p>
                            <p className="text-xs text-slate-400 font-medium italic">{policy.desc}</p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};
