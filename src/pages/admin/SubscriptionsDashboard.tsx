import React from 'react';
import { useAdminBilling } from '@/hooks/admin/useAdminBilling';
import {
    ReceiptText,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Search,
    CreditCard,
    Download
} from 'lucide-react';
import { GlassCard } from '@/components/admin/super/AdminShared';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const SubscriptionsDashboard: React.FC = () => {
    const { invoices, loading, recordManualPayment, runMaintenance } = useAdminBilling();
    const [filter, setFilter] = React.useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');

    const filteredInvoices = invoices.filter(inv =>
        filter === 'all' ? true : inv.status === filter
    );

    const stats = {
        totalPending: invoices.filter(i => i.status === 'unpaid').reduce((a, b) => a + b.amount, 0),
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
        revenueThisMonth: invoices.filter(i => i.status === 'paid' && new Date(i.paid_at || '').getMonth() === new Date().getMonth()).reduce((a, b) => a + b.amount, 0)
    };

    if (loading) {
        return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-slate-400">Loading Billing Ledger...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Billing & Revenue</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase opacity-60">Manage platform monetization and subscription lifecycle.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={runMaintenance}
                        className="h-12 px-6 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-rose-100"
                    >
                        <Clock size={14} /> Run Suspension Sweep
                    </button>
                    <button className="h-12 px-6 bg-slate-900 text-white hover:bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                        <ArrowUpRight size={14} /> Global Pricing Config
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Receivables', val: `NPR ${stats.totalPending.toLocaleString()}`, icon: <ReceiptText />, color: 'indigo' },
                    { label: 'Monthly Revenue', val: `NPR ${stats.revenueThisMonth.toLocaleString()}`, icon: <ArrowUpRight />, color: 'emerald' },
                    { label: 'Overdue Nodes', val: stats.overdueCount, icon: <AlertCircle />, color: 'rose' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 border-slate-100 relative overflow-hidden group">
                        <div className={cn(
                            "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700",
                            stat.color === 'indigo' ? 'bg-indigo-600' : stat.color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'
                        )} />
                        <div className="flex items-center gap-4 mb-4">
                            <div className={cn(
                                "p-3 rounded-2xl",
                                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            )}>
                                {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 20 })}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
                    </GlassCard>
                ))}
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                            placeholder="Search invoice or cluster name..."
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {['all', 'unpaid', 'paid', 'overdue'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t as any)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-left">Invoice No</th>
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-left">Cluster / Node</th>
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-left">Period</th>
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-left">Amount</th>
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-left">Status</th>
                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ReceiptText size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 tracking-tight">{inv.invoice_number}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added {format(new Date(inv.created_at), 'MMM dd')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-700">{inv.tenant?.name}</div>
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">{inv.tenant?.slug}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-slate-600">
                                            {format(new Date(inv.billing_period_start), 'MMM dd')} - {format(new Date(inv.billing_period_end), 'MMM dd')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-900 tracking-tighter">{inv.currency} {inv.amount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            inv.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                inv.status === 'overdue' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            <div className={cn("h-1.5 w-1.5 rounded-full",
                                                inv.status === 'paid' ? "bg-emerald-500" :
                                                    inv.status === 'overdue' ? "bg-rose-500" : "bg-amber-500"
                                            )} />
                                            {inv.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {inv.status !== 'paid' && (
                                                <button
                                                    onClick={() => recordManualPayment(inv.id, 'manual')}
                                                    className="h-9 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                                                >
                                                    <CreditCard size={12} /> Mark Paid
                                                </button>
                                            )}
                                            <button className="h-9 w-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all hover:text-slate-600">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
