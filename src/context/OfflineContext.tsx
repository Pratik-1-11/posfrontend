import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { syncManager } from '@/services/syncManager';
import { toast } from '@/hooks/use-toast';

interface OfflineContextType {
    isOnline: boolean;
    isSyncing: boolean;
    syncData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const syncInProgress = useRef(false);

    const syncData = async () => {
        if (!navigator.onLine || syncInProgress.current) return;

        syncInProgress.current = true;
        setIsSyncing(true);
        try {
            console.log('[Sync] Started background synchronization...');
            // Step 1: Push pending sales (Revenue)
            await syncManager.pushOfflineSales();

            // Step 2: Pull latest catalog (Data)
            await syncManager.pullData();
        } catch (err) {
            console.error('[Sync] Background sync encountered an error:', err);
        } finally {
            setIsSyncing(false);
            syncInProgress.current = false;
        }
    };

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast({
                title: "Connection Restored",
                description: "Synchronizing your offline records...",
                className: "bg-green-50 border-green-200"
            });
            syncData();
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "Working Offline",
                description: "Your changes are safe and stored locally.",
                className: "bg-amber-50 border-amber-200"
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial background pulse
        const syncInterval = setInterval(() => {
            if (navigator.onLine) {
                syncData();
            }
        }, 30000); // Pulse every 30 seconds

        // Immediate sync on load
        if (navigator.onLine) {
            syncData();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(syncInterval);
        };
    }, []);

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, syncData }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
