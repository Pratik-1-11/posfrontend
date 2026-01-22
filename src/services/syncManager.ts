import { apiClient } from '@/services/api/apiClient';
import { db } from '@/db/db';
import { toast } from '@/hooks/use-toast';

export const syncManager = {
    // 1. Pull latest data from server to local DB
    pullData: async () => {
        try {
            console.log('[Sync] Pulling data...');

            // Fetch Products
            const productRes = await apiClient.request<{ status: string, data: { products: any[] } }>('/api/products');
            if (productRes.data?.products) {
                await db.products.clear();
                await db.products.bulkAdd(productRes.data.products);
                console.log(`[Sync] Synced ${productRes.data.products.length} products.`);
            }

            // Fetch Customers
            const customerRes = await apiClient.request<{ status: string, data: { customers: any[] } }>('/api/customers');
            if (customerRes.data?.customers) {
                await db.customers.clear();
                await db.customers.bulkAdd(customerRes.data.customers);

                // LEGACY COMPATIBILITY: Update localStorage for CustomerContext
                // We need to map/ensure the shape is correct if Context expects specific fields
                // But generally saving the raw array is better than nothing.
                try {
                    localStorage.setItem('customers', JSON.stringify(customerRes.data.customers));
                } catch (e) { console.error('LocalStorage quota exceeded', e); }

                console.log(`[Sync] Synced ${customerRes.data.customers.length} customers.`);
            }

            return true;
        } catch (error) {
            console.error('[Sync] Pull failed:', error);
            return false;
        }
    },

    // 2. Push offline sales to server
    pushOfflineSales: async () => {
        const pendingSales = await db.offlineSales.toArray();
        if (pendingSales.length === 0) return;

        console.log(`[Sync] Found ${pendingSales.length} offline sales to push.`);
        let successCount = 0;

        for (const sale of pendingSales) {
            try {
                await apiClient.request('/api/orders', {
                    method: 'POST',
                    json: sale.data
                });
                // If success, delete from local DB
                if (sale.id) await db.offlineSales.delete(sale.id);
                successCount++;
            } catch (error) {
                console.error(`[Sync] Failed to push sale ${sale.id}:`, error);
                // Optionally increase retry count or delete if fatal error
            }
        }

        if (successCount > 0) {
            toast({
                title: "Sync Complete",
                description: `Successfully uploaded ${successCount} offline sales.`,
            });
        }
    }
};
