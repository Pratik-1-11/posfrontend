import React from 'react';
import { useAdminPlatform } from '@/hooks/admin/useAdminPlatform';
import { SystemConsole } from '@/components/admin/super/SystemConsole';
import { superAdminApi } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const SystemConsolePage: React.FC = () => {
    const { settings: platformSettings, loading, refresh } = useAdminPlatform();
    const { toast } = useToast();

    const handleUpdateSetting = async (key: string, value: any) => {
        try {
            await superAdminApi.updatePlatformSetting(key, value);
            toast({ title: "Setting Updated", description: `${key} has been changed.` });
            refresh();
        } catch (error) {
            toast({ title: "Update Failed", description: "Could not sync setting to server.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">System Console</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage global platform switches and gates.</p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && !platformSettings ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Synchronizing System State...</p>
                </div>
            ) : (
                <SystemConsole
                    settings={platformSettings}
                    onUpdate={handleUpdateSetting}
                />
            )}
        </div>
    );
};

export default SystemConsolePage;
