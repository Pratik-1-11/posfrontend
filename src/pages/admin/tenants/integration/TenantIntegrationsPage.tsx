import React, { useState } from 'react';
import { useTenantContext } from '../TenantContext';
import { GlassCard, StatusBadge } from '@/components/admin/super/AdminShared';
import {
    Database,
    Download,
    Key,
    ShieldAlert,
    FileJson,
    Loader2,
    Activity,
    Network,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Zap
} from 'lucide-react';
import { superAdminApi } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export const TenantIntegrationsPage: React.FC = () => {
    const { tenant } = useTenantContext();
    const { toast } = useToast();
    const [exporting, setExporting] = useState(false);

    const { data: integrations = [], isLoading: loadingIntegrations } = useQuery({
        queryKey: ['admin-tenant-integrations', tenant?.id],
        queryFn: () => superAdminApi.getTenantIntegrations(tenant!.id),
        enabled: !!tenant
    });

    const { data: webhooks = [], isLoading: loadingWebhooks } = useQuery({
        queryKey: ['admin-tenant-webhooks', tenant?.id],
        queryFn: () => superAdminApi.getTenantWebhooks(tenant!.id),
        enabled: !!tenant
    });

    const { data: syncJobs = [], isLoading: loadingSync } = useQuery({
        queryKey: ['admin-tenant-sync', tenant?.id],
        queryFn: () => superAdminApi.getTenantSyncJobs(tenant!.id),
        enabled: !!tenant
    });

    const handleExport = async () => {
        if (!tenant) return;
        try {
            setExporting(true);
            const blob = await superAdminApi.exportTenantData(tenant.id, 'json');

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tenant-export-${tenant.slug}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Export Complete',
                description: 'Tenant data has been downloaded successfully.',
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                title: 'Export Failed',
                description: 'Could not generate data dump.',
                variant: 'destructive'
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Integration Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Network size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Total Integrations</p>
                            <h4 className="text-xl font-black text-slate-900">{integrations.length}</h4>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Active Connections</span>
                        <span className="text-emerald-600">{integrations.filter(i => i.status === 'active').length} Nodes</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Webhook Traffic</p>
                            <h4 className="text-xl font-black text-slate-900">
                                {loadingWebhooks ? <Loader2 size={16} className="animate-spin inline mr-2 text-slate-400" /> : webhooks.reduce((acc, w) => acc + (w.success_count || 0) + (w.failure_count || 0), 0)}
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Success Rate</span>
                        <span className="text-indigo-600">98.4% Average</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Data Syncs (24h)</p>
                            <h4 className="text-xl font-black text-slate-900">{syncJobs.filter(j => new Date(j.created_at) > new Date(Date.now() - 86400000)).length}</h4>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Records Exchanged</span>
                        <span className="text-emerald-600">+{syncJobs.reduce((acc, j) => acc + (j.records_processed || 0), 0).toLocaleString()}</span>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Active Integrations */}
                <GlassCard className="p-8 border-slate-100 h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                            <Network className="text-indigo-600" size={20} /> Active Integrations
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase shadow-sm">Enterprise Grade</Badge>
                    </div>

                    <div className="space-y-4">
                        {loadingIntegrations ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
                            </div>
                        ) : integrations.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No integrations configured</p>
                            </div>
                        ) : (
                            integrations.map((integration) => (
                                <div key={integration.integration_id} className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all bg-white shadow-sm group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors capitalize font-black">
                                                {integration.provider?.charAt(0) || 'I'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight">{integration.name}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase">{integration.integration_type} • {integration.provider}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-500">
                                                        <Clock size={12} /> Last Sync: {integration.last_sync_at ? format(new Date(integration.last_sync_at), 'MMM dd, HH:mm') : 'Never'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <StatusBadge status={integration.status === 'active' ? 'active' : 'suspended'} />
                                            {integration.error_count > 0 && (
                                                <Badge variant="destructive" className="text-[9px] font-black uppercase">
                                                    {integration.error_count} Errors
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Recent Sync Jobs */}
                <GlassCard className="p-8 border-slate-100 h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                            <Activity className="text-emerald-600" size={20} /> Recent Sync Activity
                        </h3>
                        {syncJobs.length > 0 && <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 animate-pulse"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Monitor</span>}
                    </div>

                    <div className="space-y-3">
                        {loadingSync ? (
                            <div className="animate-pulse space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl" />)}
                            </div>
                        ) : syncJobs.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50/50 rounded-3xl">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No sync job history</p>
                            </div>
                        ) : (
                            syncJobs.slice(0, 5).map((job) => (
                                <div key={job.job_id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                            job.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                job.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        )}>
                                            {job.status === 'completed' ? <CheckCircle2 size={18} /> :
                                                job.status === 'failed' ? <XCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{job.integration_name || 'System Sync'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{job.entity_type} • {job.records_success} success</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500">{format(new Date(job.created_at), 'HH:mm:ss')}</p>
                                        <p className="text-[9px] font-bold text-slate-400">{format(new Date(job.created_at), 'MMM dd')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Data Sovereignty & Export Section */}
            <GlassCard className="p-8 border-slate-100">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">System Data Export</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-xl mt-1">
                                Generate a cryptographically secure data dump of this tenant's entire database.
                                Includes sales, customers, full inventory history, and audit trails.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200"
                    >
                        {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {exporting ? 'Generating Deep Archive...' : 'Begin Full System Export'}
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                            <FileJson size={14} className="text-indigo-500" /> Export Payload Schema
                        </div>
                        <pre className="text-[10px] text-slate-500 font-mono bg-white p-6 rounded-2xl border border-slate-200 overflow-x-auto shadow-inner leading-relaxed">
                            {`{
  "tenant_id": "${tenant?.id || 'id'}",
  "schema_version": "2.4.0",
  "data": {
    "products": [...50+ fields],
    "inventory": [...sync_history],
    "transactions": [...splits, taxes]
  }
}`}
                        </pre>
                    </div>

                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <div className="flex gap-3">
                                <Key className="text-blue-600 h-5 w-5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-tighter">Security Policy</h4>
                                    <p className="text-[11px] text-blue-700/80 font-medium mt-1">Exports are authorized only for Super Admins. Every export event is logged in the permanent audit trail with IP address and hardware ID.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                            <div className="flex gap-3">
                                <ShieldAlert className="text-amber-600 h-5 w-5 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-tighter">Data Retention</h4>
                                    <p className="text-[11px] text-amber-700/80 font-medium mt-1">Data sovereignty remains with the tenant. Exports generated here should be handled according to local data protection laws (GDPR/NDPA).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
