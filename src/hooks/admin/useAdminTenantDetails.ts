import { useState, useEffect, useCallback } from 'react';
import { superAdminApi, type TenantWithStats } from '@/services/api/superAdminApi';
import { useToast } from '@/hooks/use-toast';

export const useAdminTenantDetails = (tenantId: string | undefined) => {
    const [tenant, setTenant] = useState<TenantWithStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { toast } = useToast();

    const fetchTenant = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const data = await superAdminApi.getTenant(tenantId);
            setTenant(data);
        } catch (error) {
            console.error('Error fetching tenant details:', error);
            toast({
                title: "Error",
                description: "Failed to load tenant details",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [tenantId, toast]);

    useEffect(() => {
        fetchTenant();
    }, [fetchTenant, refreshKey]);

    const refresh = () => setRefreshKey(prev => prev + 1);

    return { tenant, loading, refresh };
};
