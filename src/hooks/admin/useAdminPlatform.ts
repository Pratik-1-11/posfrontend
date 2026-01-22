import { useState, useEffect, useCallback } from 'react';
import { superAdminApi, type PlatformStats } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';

export const useAdminPlatform = () => {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Toast is used for updates, not necessarily for fetching here to avoid spam if it fails silently
    const { toast } = useToast();

    const loadPlatformData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsData, settingsData] = await Promise.all([
                superAdminApi.getPlatformStats(),
                superAdminApi.getPlatformSettings()
            ]);
            setStats(statsData);
            setSettings(settingsData);
        } catch (error) {
            console.error('Error loading platform data:', error);
            toast({
                title: "Warning",
                description: "Partially failed to sync platform data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadPlatformData();
    }, [loadPlatformData, refreshKey]);

    const refresh = () => setRefreshKey(prev => prev + 1);

    return {
        stats,
        settings,
        loading,
        refresh
    };
};
