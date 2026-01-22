import React, { useState, useEffect } from 'react';
import { useTenantContext } from '../TenantContext';
import { superAdminApi, type ActivityLog } from '@/services/api/superAdminApi';
import { ArrowUpRight, Activity } from 'lucide-react';

const TenantActivityPage: React.FC = () => {
    const { tenant } = useTenantContext();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenant) return;

        const fetchLogs = async () => {
            try {
                const data = await superAdminApi.getTenantActivityLogs(tenant.id);
                setLogs(data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [tenant?.id]);

    if (!tenant) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 ml-1">Stream Logs</h3>
                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">Last 50 Events</span>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400 font-medium">Querying platform audit pipeline...</div>
            ) : logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex gap-4 hover:border-indigo-200 transition-all">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shadow-inner">
                        {log.action.includes('create') ? <ArrowUpRight className="h-6 w-6 text-emerald-500" /> : <Activity className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-slate-800 truncate">{log.action} <span className="text-indigo-400 font-mono text-[10px] font-black uppercase ml-2 bg-indigo-50 px-1.5 rounded">#{log.entity_type}</span></h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500">Subject: <span className="text-indigo-600 font-bold">Admin Cluster</span> • Hash: <span className="font-mono text-[10px]">{log.id.slice(0, 12)}...</span></p>
                    </div>
                </div>
            )) : (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                    <Activity className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry Empty</p>
                </div>
            )}
        </div>
    );
};

export default TenantActivityPage;
