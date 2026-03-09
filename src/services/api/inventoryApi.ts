import { apiClient } from "./apiClient";

export type InventoryItem = {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    stock: number;
    minStock?: number;
    price: number;
    costPrice?: number;
    branchId?: string;
    branchName?: string;
    lastRestocked?: string;
};

export type StockAdjustment = {
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
    branchId: string;
};

export const inventoryApi = {
    /**
     * Fetch all inventory items (delegates to the products endpoint which includes stock data)
     */
    getAll: async (branchId?: string): Promise<InventoryItem[]> => {
        const params = branchId ? `?branchId=${branchId}` : '';
        const res = await apiClient.request<{ status: string; data: { products: any[] } }>(
            `/api/products${params}`,
            { method: "GET" }
        );
        return (res.data.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || '',
            barcode: p.barcode,
            category: p.category,
            stock: p.stock ?? 0,
            minStock: p.min_stock,
            price: p.price,
            costPrice: p.cost_price,
            branchId: p.branch_id,
            branchName: p.branch_name,
            lastRestocked: p.last_restocked,
        }));
    },

    /**
     * Adjust stock for a specific product
     */
    updateStock: async (productId: string, data: StockAdjustment): Promise<boolean> => {
        await apiClient.request(
            `/api/products/${productId}/adjust-stock`,
            {
                method: "POST",
                json: data,
            }
        );
        return true;
    },

    /**
     * Get low-stock items (items where stock <= minStock)
     */
    getLowStock: async (branchId?: string): Promise<InventoryItem[]> => {
        const all = await inventoryApi.getAll(branchId);
        return all.filter(item => item.minStock != null && item.stock <= item.minStock);
    },

    /**
     * Get stock summary report
     */
    getStockSummary: async (): Promise<any> => {
        const res = await apiClient.request<{ status: string; data: any }>(
            `/api/reports/stock`,
            { method: "GET" }
        );
        return res.data;
    },
};
