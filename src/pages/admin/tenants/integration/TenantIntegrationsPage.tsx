import React, { useState } from 'react';
import { useTenantContext } from '../TenantContext';
import { GlassCard } from '@/components/admin/super/AdminShared';
import {
    Database,
    Download,
    Key,
    ShieldAlert,
    FileJson,
    Loader2
} from 'lucide-react';
import { superAdminApi } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';

export const TenantIntegrationsPage: React.FC = () => {
    const { tenant } = useTenantContext();
    const { toast } = useToast();
    const [exporting, setExporting] = useState(false);
    // Simulating API keys for now as we didn't fully implement the listing endpoint yet
    const [apiKeys] = useState<{ id: string, name: string, prefix: string, created: string }[]>([]);

    const handleExport = async () => {
        if (!tenant) return;
        try {
            setExporting(true);
            const blob = await superAdminApi.exportTenantData(tenant.id, 'json');

            // Create download link
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
            {/* Data Sovereignty Section */}
            <GlassCard className="p-8 border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Data Sovereignty</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-xl mt-1">
                                Export full copies of tenant data including sales, customers, inventory, and activity logs.
                                This dump is JSON-formatted and GDPR compliant.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {exporting ? 'Generating...' : 'Export Data'}
                    </button>
                </div>

                <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        <FileJson size={14} /> Export Preview Structure
                    </div>
                    <pre className="text-[10px] text-slate-600 font-mono bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto">
                        {`{
  "metadata": { ... },
  "products": [ ... ],
  "customers": [ ... ],
  "sales": [
    {
      "invoice": "INV-001",
      "items": [ ... ]
    }
  ]
}`}
                    </pre>
                </div>
            </GlassCard>

            {/* API Keys Section (Mockup for Phase 5) */}
            <GlassCard className="p-8 border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">API Access Keys</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Manage programmatic access keys for external integrations (Zapier, Custom Apps).
                            </p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 text-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                        Generate New Key
                    </button>
                </div>

                {apiKeys.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active API keys found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* List would go here */}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
