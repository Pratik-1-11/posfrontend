import React, { useState } from 'react';
import { useAdminSupport } from '@/hooks/admin/useAdminSupport';
import {
    Megaphone,
    Radio,
    Send,
    AlertTriangle,
    Info,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { GlassCard } from '@/components/admin/super/AdminShared';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const SupportCenterPage: React.FC = () => {
    const { announcements, loading, createAnnouncement } = useAdminSupport();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'critical' | 'success'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await createAnnouncement({ title, message, type });
        if (success) {
            setTitle('');
            setMessage('');
            setType('info');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Broadcast & Ops</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase opacity-60">Global announcements and operational support tools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Broadcast Studio */}
                <GlassCard className="lg:col-span-1 p-8 border-slate-100 flex flex-col h-full bg-slate-900 text-white shadow-2xl shadow-indigo-900/20">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                                <Radio size={20} className="animate-pulse" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight">Broadcast Studio</h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send system-wide alerts to all tenant dashboards instantly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block mb-2">Headline</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Scheduled Maintenance"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block mb-2">Message Body</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Details about the update..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block mb-2">Alert Level</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['info', 'success', 'warning', 'critical'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={cn(
                                            "h-10 rounded-xl flex items-center justify-center transition-all border",
                                            type === t ?
                                                t === 'info' ? "bg-indigo-500 border-indigo-400 text-white" :
                                                    t === 'success' ? "bg-emerald-500 border-emerald-400 text-white" :
                                                        t === 'warning' ? "bg-amber-500 border-amber-400 text-white" :
                                                            "bg-rose-500 border-rose-400 text-white"
                                                : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                                        )}
                                    >
                                        {t === 'info' && <Info size={16} />}
                                        {t === 'success' && <CheckCircle2 size={16} />}
                                        {t === 'warning' && <AlertTriangle size={16} />}
                                        {t === 'critical' && <XCircle size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !title || !message}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                        >
                            {isSubmitting ? <span className="animate-pulse">Broadcasting...</span> : <><Send size={14} /> Send Broadcast</>}
                        </button>
                    </form>
                </GlassCard>

                {/* Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Megaphone size={18} className="text-slate-400" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Transmissions</h3>
                    </div>

                    <div className="space-y-4">
                        {loading && <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Scanning Frequencies...</div>}

                        {!loading && announcements.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active broadcasts</p>
                            </div>
                        )}

                        {announcements.map((ann) => (
                            <GlassCard key={ann.id} className="p-6 border-slate-100 flex gap-4 group hover:shadow-lg transition-all">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center",
                                    ann.type === 'info' ? "bg-indigo-50 text-indigo-600" :
                                        ann.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                                            ann.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {ann.type === 'info' && <Info size={24} />}
                                    {ann.type === 'success' && <CheckCircle2 size={24} />}
                                    {ann.type === 'warning' && <AlertTriangle size={24} />}
                                    {ann.type === 'critical' && <XCircle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-slate-900 text-lg">{ann.title}</h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(ann.created_at), 'MMM dd, HH:mm')}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{ann.message}</p>
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            {ann.target_plan_id ? 'Targeted' : 'Global Broadcast'}
                                        </div>
                                        {ann.is_active ?
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wide"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span> :
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Archived</span>
                                        }
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
