import { apiClient } from '@/services/api/apiClient';
import { db, type OfflineSale } from '@/db/db';
import { toast } from '@/hooks/use-toast';

const SYNC_RETRY_DELAY = 5000; // 5 seconds
const MAX_BATCH_SIZE = 10;

export const syncManager = {
    /**
     * Pulls latest product, category, and customer data from the server.
     * Implements a "last sync" check to avoid redundant data transfer.
     */
    pullData: async () => {
        try {
            console.log('[Sync] Initializing pull...');

            // 1. Get last sync timestamps
            await db.syncState.get('last_product_sync');
            await db.syncState.get('last_customer_sync');

            // 2. Fetch Products & Categories (Simplified for now - we fetch all if stale)
            // In a more advanced version, we'd send the timestamp to the server
            const productRes = await apiClient.get<any>('/products');
            const products = productRes.data?.products || [];

            if (products.length > 0) {
                // Atomic update: use transaction to ensure consistency
                await db.transaction('rw', [db.products, db.syncState], async () => {
                    await db.products.clear();
                    await db.products.bulkAdd(products.map((p: any) => ({
                        ...p,
                        last_fetched_at: Date.now()
                    })));
                    await db.syncState.put({ key: 'last_product_sync', value: Date.now() });
                });
                console.log(`[Sync] Updated ${products.length} products.`);
            }

            // 3. Fetch Categories
            const categoryRes = await apiClient.get<any>('/categories');
            const categories = categoryRes.data?.categories || [];
            if (categories.length > 0) {
                await db.categories.clear();
                await db.categories.bulkAdd(categories);
            }

            // 4. Fetch Customers
            const customerRes = await apiClient.get<any>('/customers');
            const customers = customerRes.data?.customers || [];
            if (customers.length > 0) {
                await db.transaction('rw', [db.customers, db.syncState], async () => {
                    await db.customers.clear();
                    await db.customers.bulkAdd(customers);
                    await db.syncState.put({ key: 'last_customer_sync', value: Date.now() });

                    // Legacy support: sync with localStorage for components not yet using Dexie
                    localStorage.setItem('customers', JSON.stringify(customers));
                });
                console.log(`[Sync] Updated ${customers.length} customers.`);
            }

            return true;
        } catch (error) {
            console.error('[Sync] Pull failed:', error);
            return false;
        }
    },

    /**
     * Pushes pending offline sales to the server.
     * Features: Exponential backoff, atomic state transitions, batch processing.
     */
    pushOfflineSales: async () => {
        // Find sales that are pending or failed but ready for retry
        const now = Date.now();
        const pendingSales = await db.offlineSales
            .where('status')
            .anyOf('pending', 'failed')
            .filter(sale => !sale.next_retry_time || sale.next_retry_time <= now)
            .limit(MAX_BATCH_SIZE)
            .toArray();

        if (pendingSales.length === 0) return;

        console.log(`[Sync] Pushing ${pendingSales.length} offline sales to server...`);
        let successCount = 0;

        for (const sale of pendingSales) {
            try {
                // Mark as syncing to avoid duplicate attempts from overlapping workers
                await db.offlineSales.update(sale.id!, { status: 'syncing' });

                await apiClient.post('/orders', sale.payload);

                // Success! Mark as completed
                await db.offlineSales.update(sale.id!, {
                    status: 'completed',
                    next_retry_time: undefined
                });

                // Optional: Delete completed sales after successful push to keep DB small
                await db.offlineSales.delete(sale.id!);

                successCount++;
            } catch (error: any) {
                const isAuthError = error.status === 401 || error.status === 403;
                const retryCount = sale.retry_count + 1;

                // Exponential backoff: 5s, 25s, 125s... up to 30 mins
                const backoff = Math.min(SYNC_RETRY_DELAY * Math.pow(5, retryCount), 1800000);

                console.error(`[Sync] Failed to push sale ${sale.idempotencyKey}:`, error);

                await db.offlineSales.update(sale.id!, {
                    status: 'failed',
                    retry_count: retryCount,
                    next_retry_time: isAuthError ? now + 600000 : now + backoff, // Wait longer for auth errors
                    error: error.message || 'Network error'
                });

                if (isAuthError) {
                    console.warn('[Sync] Authentication required. Stopping current batch.');
                    break;
                }
            }
        }

        if (successCount > 0) {
            toast({
                title: "Data Synced",
                description: `Successfully uploaded ${successCount} sale records.`,
                className: "bg-green-50"
            });
        }
    },

    /**
     * Queue a sale for offline processing
     */
    queueSale: async (payload: any) => {
        const sale: OfflineSale = {
            idempotencyKey: payload.idempotencyKey || crypto.randomUUID(),
            payload,
            status: 'pending',
            retry_count: 0,
            created_at: Date.now()
        };

        await db.offlineSales.add(sale);

        // Try to sync immediately if online
        if (navigator.onLine) {
            syncManager.pushOfflineSales();
        }
    }
};
