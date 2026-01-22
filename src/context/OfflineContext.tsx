import React, { createContext, useContext, useState, useEffect } from 'react';
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

    const syncData = async () => {
        if (!navigator.onLine) return;
        setIsSyncing(true);
        try {
            await syncManager.pushOfflineSales();
            await syncManager.pullData();
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast({ title: "You are back online", description: "Syncing data now...", className: "bg-green-50 border-green-200" });
            syncData();
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({ title: "You are offline", description: "Changes will be saved locally.", className: "bg-amber-50 border-amber-200" });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync on load
        if (navigator.onLine) {
            syncData();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, syncData }}>
            {children}
            {/* Visual Indicator for Offline Mode */}
            {!isOnline && (
                <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg z-50 font-bold flex items-center gap-2">
                    🚫 Offline Mode
                </div>
            )}
            {isSyncing && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50 font-bold flex items-center gap-2 animate-pulse">
                    🔄 Syncing...
                </div>
            )}
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
