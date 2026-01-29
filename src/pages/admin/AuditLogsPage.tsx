import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToast } from '@/hooks/use-toast';
import { superAdminApi, type ActivityLog } from '@/services/api/superAdminApi';
import { FiLoader, FiShield, FiActivity, FiLayers, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await superAdminApi.getPlatformActivityLogs({ limit: 50 });
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            toast({
                title: 'Sync Error',
                description: 'Failed to synchronize platform governance logs.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadge = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('insert') || actionLower.includes('create'))
            return <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black uppercase text-[10px]">Provision</Badge>;
        if (actionLower.includes('update') || actionLower.includes('patch'))
            return <Badge variant="warning" className="bg-amber-50 text-amber-600 border-amber-100 font-black uppercase text-[10px]">Mutation</Badge>;
        if (actionLower.includes('delete') || actionLower.includes('remove'))
            return <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-100 font-black uppercase text-[10px]">Demolition</Badge>;
        return <Badge variant="secondary" className="font-black uppercase text-[10px]">{action}</Badge>;
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <FiLoader className="w-10 h-10 animate-spin mb-4" />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Scanning Platform Trace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 leading-none mb-3">Governance Logs</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest opacity-60">Platform-wide immutable action trail and auditing.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    <FiRefreshCw className={cn(loading && "animate-spin")} /> Refresh Trail
                </button>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8">Actor / Role</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8">Operation</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8">Entity Type</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8">Traceability</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] py-5 px-8">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-24 text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                                        No entries found in the governance stream.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log: ActivityLog) => (
                                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                                                    <FiShield size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 tracking-tight">System Operator</div>
                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mt-0.5">{log.actor_role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <FiLayers size={14} className="text-slate-300" />
                                                <span className="text-xs font-black uppercase tracking-tight italic">{log.entity_type}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2">
                                                <FiActivity size={14} className="text-slate-300" />
                                                <span className="text-[10px] font-mono text-slate-400 font-bold">SHA: {log.id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-300 mt-1 truncate max-w-[150px]">{log.entity_id || 'N/A'}</div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="text-xs font-black text-slate-900">
                                                {format(new Date(log.created_at), 'MMM dd')}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {format(new Date(log.created_at), 'HH:mm:ss')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};
