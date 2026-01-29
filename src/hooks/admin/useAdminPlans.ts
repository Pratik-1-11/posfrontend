import { useState, useEffect, useCallback } from 'react';
import { superAdminApi } from '@/services/api/superAdminApi';
import type { Plan } from '@/services/api/superAdminApi';
import { toast } from '@/hooks/use-toast';

export const useAdminPlans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const data = await superAdminApi.getPlans();
            setPlans(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching plans:', err);
            setError(err.message || 'Failed to fetch subscription plans');
            toast({
                title: 'Error',
                description: 'Failed to load plans',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return {
        plans,
        loading,
        error,
        refresh: fetchPlans
    };
};
