import { useState, useEffect, useCallback } from 'react';
import { superAdminApi, type TenantWithStats } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';

export const useAdminTenants = () => {
    const [tenants, setTenants] = useState<TenantWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const { toast } = useToast();

    const loadTenants = useCallback(async () => {
        try {
            setLoading(true);
            const data = await superAdminApi.getAllTenants();
            setTenants(data);
        } catch (error) {
            console.error('Error loading tenants:', error);
            toast({
                title: "Error",
                description: "Failed to load tenants list",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadTenants();
    }, [loadTenants, refreshKey]);

    const refresh = () => setRefreshKey(prev => prev + 1);

    return {
        tenants,
        loading,
        refresh
    };
};
