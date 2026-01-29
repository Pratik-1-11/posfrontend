import { useState, useEffect, useCallback } from 'react';
import { superAdminApi, type Announcement } from '@/services/api/superAdminApi';
import { toast } from '@/hooks/use-toast';

export const useAdminSupport = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const data = await superAdminApi.getAnnouncements();
            setAnnouncements(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const createAnnouncement = async (data: Partial<Announcement>) => {
        try {
            await superAdminApi.createAnnouncement(data);
            toast({
                title: 'Announcement Published',
                description: 'The broadcast has been sent to targeted tenants.'
            });
            fetchAnnouncements();
            return true;
        } catch (err: any) {
            toast({
                title: 'Publication Error',
                description: err.message,
                variant: 'destructive'
            });
            return false;
        }
    };

    const checkTenantHealth = async (tenantId: string) => {
        try {
            const res = await superAdminApi.getTenantHealth(tenantId);
            return res.health_score;
        } catch (err) {
            return 0;
        }
    };

    return {
        announcements,
        loading,
        createAnnouncement,
        checkTenantHealth,
        refresh: fetchAnnouncements
    };
};
