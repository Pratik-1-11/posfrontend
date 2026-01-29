import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CloudOff, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { db } from '@/db/db';
import { useOffline } from '@/context/OfflineContext';

export const SyncIndicator: React.FC = () => {
    const { isOnline, isSyncing } = useOffline();

    // Efficiently count pending/failed sales using Dexie
    const pendingSales = useLiveQuery(
        () => db.offlineSales.where('status').anyOf('pending', 'failed').count(),
        []
    );

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 no-print" title="System is offline. Sales are being saved locally.">
                <CloudOff size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                    Offline {pendingSales ? `(${pendingSales} records)` : ''}
                </span>
            </div>
        );
    }

    if (isSyncing || (pendingSales && pendingSales > 0)) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 no-print" title="Syncing ledger with cloud server...">
                <RefreshCcw size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                    Syncing {pendingSales ? `(${pendingSales} left)` : ''}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 no-print" title="All data is synchronized and backed up.">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                Cloud Synced
            </span>
        </div>
    );
};
