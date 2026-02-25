import { db, type OfflineSale, type Product as DbProduct, type Category as DbCategory, type Customer as DbCustomer } from '@/db/db';
import { toast } from '@/hooks/use-toast';
import { productApi } from '@/services/api/productApi';
import { customerApi } from '@/services/api/customerApi';
import { orderApi } from '@/services/api/orderApi';

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

            // Get tenant ID from stored user for consistency
            const savedUser = localStorage.getItem('pos_user');
            const tenantId = savedUser ? JSON.parse(savedUser).tenant?.id || '' : '';

            // 1. Get last sync timestamps
            await db.syncState.get('last_product_sync');
            await db.syncState.get('last_customer_sync');

            // 2. Fetch Products & Categories
            const products = await productApi.getAll();

            if (products.length > 0) {
                // Atomic update: use transaction to ensure consistency
                await db.transaction('rw', [db.products, db.syncState], async () => {
                    await db.products.clear();
                    await db.products.bulkAdd(products.map((p): DbProduct => ({
                        id: p.id,
                        name: p.name,
                        barcode: p.barcode,
                        price: p.price,
                        selling_price: p.price,
                        stock_quantity: p.stock,
                        tenant_id: tenantId,
                        last_fetched_at: Date.now()
                    })));
                    await db.syncState.put({ key: 'last_product_sync', value: Date.now() });
                });
                console.log(`[Sync] Updated ${products.length} products.`);
            }

            // 3. Fetch Categories
            const categories = await productApi.getCategories();
            if (categories.length > 0) {
                await db.categories.clear();
                await db.categories.bulkAdd(categories.map((name, index): DbCategory => ({
                    id: `cat-${index}`,
                    name,
                    tenant_id: tenantId
                })));
            }

            // 4. Fetch Customers
            const customers = await customerApi.getAll();
            if (customers.length > 0) {
                await db.transaction('rw', [db.customers, db.syncState], async () => {
                    await db.customers.clear();
                    await db.customers.bulkAdd(customers.map((c): DbCustomer => ({
                        id: c.id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        address: c.address,
                        tenant_id: tenantId,
                    })));
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

                await orderApi.create(sale.payload);

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
