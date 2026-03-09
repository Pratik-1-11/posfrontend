import React from 'react';
import {
    Link,
    RefreshCcw,
    Plus,
    ArrowRight,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationApi } from '@/services/api/integrationApi';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export const IntegrationsScreen: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: integrationApi.getIntegrations
    });

    const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
        queryKey: ['webhooks'],
        queryFn: integrationApi.getWebhooks
    });

    const { data: syncJobs = [], isLoading: jobsLoading } = useQuery({
        queryKey: ['sync-jobs'],
        queryFn: integrationApi.getSyncJobs,
        refetchInterval: 10000 // Refresh every 10s to see progress
    });

    const syncMutation = useMutation({
        mutationFn: integrationApi.triggerSync,
        onSuccess: () => {
            toast({ title: "Sync Started", description: "Your data is being synchronized with the external system." });
            queryClient.invalidateQueries({ queryKey: ['sync-jobs'] });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Sync Failed", description: error.message });
        }
    });

    const handleSync = (integrationId: string, entityType: string) => {
        syncMutation.mutate({ integration_id: integrationId, entity_type: entityType });
    };

    if (integrationsLoading || webhooksLoading || jobsLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        Integrations Hub
                    </h1>
                    <p className="text-muted-foreground font-medium">Connect your POS to external accounting, CRM, and SMS services.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-primary text-white font-black px-6 rounded-2xl shadow-lg shadow-primary/20 flex gap-2">
                        <Plus className="h-5 w-5" /> New Connection
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="integrations" className="space-y-8">
                <TabsList className="bg-white/50 p-1 rounded-2xl border shadow-sm w-fit">
                    <TabsTrigger value="integrations" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">System Connections</TabsTrigger>
                    <TabsTrigger value="webhooks" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Webhooks</TabsTrigger>
                    <TabsTrigger value="sync" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Exchange</TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrations.map(integration => (
                            <Card key={integration.integration_id} className="border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group overflow-hidden">
                                <CardHeader className="pb-4 relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge
                                            variant={integration.status === 'active' ? 'success' : 'destructive'}
                                            className="font-black text-[10px] uppercase tracking-widest px-2"
                                        >
                                            {integration.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                            <ExternalLink className="h-6 w-6 text-slate-600 group-hover:text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black">{integration.name}</CardTitle>
                                            <CardDescription className="text-xs font-bold uppercase text-slate-400 tracking-tighter">
                                                {integration.provider} • {integration.integration_type.replace('_', ' ')}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Health Score</p>
                                            <p className="font-black text-emerald-600">{100 - integration.failure_rate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Last Sync</p>
                                            <p className="font-bold text-slate-600 text-[11px]">
                                                {integration.last_sync_at ? format(parseISO(integration.last_sync_at), 'MMM dd, HH:mm') : 'Never'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleSync(integration.integration_id, 'sales')}
                                            variant="outline"
                                            size="sm"
                                            className="w-full flex gap-2 font-bold text-xs"
                                        >
                                            <RefreshCcw className="h-3 w-3" /> Sync Sales
                                        </Button>
                                        <Button variant="ghost" size="sm" className="w-full font-bold text-xs">Configure</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card className="border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center p-8 h-full hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group">
                            <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform mb-4">
                                <Plus className="h-8 w-8 text-slate-400 group-hover:text-primary" />
                            </div>
                            <h3 className="font-black text-slate-600 group-hover:text-primary">Connect New System</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Stripe, QuickBooks, Salesforce, etc.</p>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black">Outbound Webhooks</CardTitle>
                            <CardDescription className="text-sm font-medium">Broadcast POS events to external endpoints in real-time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100">
                                {webhooks.map(webhook => (
                                    <div key={webhook.subscription_id} className="py-6 flex items-start justify-between group">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-black text-slate-800">{webhook.name}</h3>
                                                <Badge variant={webhook.active ? 'success' : 'outline'} className="text-[9px] font-black">{webhook.active ? 'ACTIVE' : 'DISABLED'}</Badge>
                                            </div>
                                            <p className="text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg w-fit flex items-center gap-2">
                                                <Link className="h-3 w-3" /> {webhook.target_url}
                                            </p>
                                            <div className="flex gap-2 flex-wrap">
                                                {webhook.events.map(event => (
                                                    <Badge key={event} className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase">
                                                        {event}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="flex gap-6 items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Success Rate</p>
                                                    <p className="font-black text-slate-800">{webhook.success_rate || 100}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Deliveries</p>
                                                    <p className="font-black text-slate-800">{webhook.success_count + webhook.failure_count}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="group-hover:text-primary"><Activity className="h-5 w-5" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!webhooks.length && (
                                    <div className="text-center py-12 text-slate-400 font-bold">No webhooks configured yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sync" className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">Operation ID</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">System</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">Resource</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">Direction</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">Result</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500">Status</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {syncJobs.map(job => (
                                        <tr key={job.job_id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="p-4 font-mono text-[10px] text-slate-400">#{job.job_id.slice(0, 8)}</td>
                                            <td className="p-4">
                                                <div className="text-xs font-black text-slate-800">{job.integration_name}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border-blue-100">
                                                    {job.entity_type}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600">
                                                    {job.job_type === 'export' ? <ArrowRight className="h-3 w-3 text-emerald-500" /> : <RefreshCcw className="h-3 w-3 text-blue-500" />}
                                                    {job.job_type}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 font-black text-xs">
                                                    <span className="text-emerald-600">{job.records_success}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span className="text-red-500">{job.records_failed}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {job.status === 'completed' ? (
                                                        <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-xs font-bold text-emerald-700">Success</span></>
                                                    ) : job.status === 'failed' ? (
                                                        <><XCircle className="h-4 w-4 text-red-500" /> <span className="text-xs font-bold text-red-700">Failed</span></>
                                                    ) : (
                                                        <><RefreshCcw className="h-4 w-4 text-blue-500 animate-spin" /> <span className="text-xs font-bold text-blue-700">Syncing...</span></>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-xs font-bold text-slate-500">{format(parseISO(job.created_at), 'MMM dd, HH:mm')}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!syncJobs.length && (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">No sync operations recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default IntegrationsScreen;
