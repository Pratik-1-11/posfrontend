import { useState, useEffect, useCallback } from 'react';
import { superAdminApi } from '@/services/api/superAdminApi';
import type { Invoice } from '@/services/api/superAdminApi';
import { toast } from '@/hooks/use-toast';

export const useAdminBilling = (params?: { tenantId?: string; status?: string }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await superAdminApi.getAllInvoices(params);
            setInvoices(data);
        } catch (err: any) {
            toast({
                title: 'Billing Sync Error',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices, refreshTrigger]);

    const recordManualPayment = async (invoiceId: string, method: string) => {
        try {
            await superAdminApi.recordPayment({
                invoice_id: invoiceId,
                payment_method: method
            });
            toast({
                title: 'Success',
                description: 'Payment recorded and subscription updated'
            });
            setRefreshTrigger(prev => prev + 1);
            return true;
        } catch (err: any) {
            toast({
                title: 'Payment Error',
                description: err.message,
                variant: 'destructive'
            });
            return false;
        }
    };

    const runMaintenance = async () => {
        try {
            const result = await superAdminApi.runBillingMaintenance();
            toast({
                title: 'Maintenance Task',
                description: result.message
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            toast({
                title: 'Task Failed',
                description: err.message,
                variant: 'destructive'
            });
        }
    };

    return {
        invoices,
        loading,
        recordManualPayment,
        runMaintenance,
        refresh: () => setRefreshTrigger(prev => prev + 1)
    };
};
