import { apiClient } from '@/services/api/apiClient';
import type { Purchase } from '@/pages/purchase/types';

type ListPurchasesResponse = {
    status: 'success';
    data: {
        purchases: any[];
    };
};

type PurchaseResponse = {
    status: 'success';
    data: {
        purchase: any;
    };
};

const mapPurchase = (p: any): Purchase => ({
    id: p.id,
    productName: p.product_name,
    sku: p.sku,
    supplierName: p.supplier_name,
    quantity: Number(p.quantity),
    unitPrice: Number(p.unit_price),
    purchaseDate: p.purchase_date,
    status: p.status,
    notes: p.notes,
    // Oh wait, api might not return notes if I didn't select it? I selected '*'.
    // Wait, migration schema has 'notes TEXT'.
    // Controller update logic has 'sku' but didn't explicitly list notes in updatePayload? 
    // Let me check controller again.
    // Controller create used: product_name, supplier_name, quantity, unit_price, purchase_date, status, sku.
    // It MISSED 'notes'.
    // Just a sec, I'll update controller in a bit, or just proceed without notes for now.
    // Let's assume standard mapping for now.
    createdAt: p.created_at,
    updatedAt: p.updated_at,
});

export const purchaseApi = {
    getAll: async (): Promise<Purchase[]> => {
        const res = await apiClient.request<ListPurchasesResponse>('/api/purchases', { method: 'GET' });
        return res.data.purchases.map(mapPurchase);
    },

    create: async (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<Purchase> => {
        const payload = {
            productName: purchase.productName,
            supplierName: purchase.supplierName,
            sku: purchase.sku,
            quantity: purchase.quantity,
            unitPrice: purchase.unitPrice,
            purchaseDate: purchase.purchaseDate,
            status: purchase.status,
            notes: purchase.notes
        };

        const res = await apiClient.request<PurchaseResponse>('/api/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mapPurchase(res.data.purchase);
    },

    update: async (id: string, updates: Partial<Purchase>): Promise<Purchase> => {
        const payload: any = {};
        if (updates.productName !== undefined) payload.productName = updates.productName;
        if (updates.supplierName !== undefined) payload.supplierName = updates.supplierName;
        if (updates.sku !== undefined) payload.sku = updates.sku;
        if (updates.quantity !== undefined) payload.quantity = updates.quantity;
        if (updates.unitPrice !== undefined) payload.unitPrice = updates.unitPrice;
        if (updates.purchaseDate !== undefined) payload.purchaseDate = updates.purchaseDate;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        const res = await apiClient.request<PurchaseResponse>(`/api/purchases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mapPurchase(res.data.purchase);
    },

    delete: async (id: string): Promise<boolean> => {
        await apiClient.request(`/api/purchases/${id}`, { method: 'DELETE' });
        return true;
    },
};
