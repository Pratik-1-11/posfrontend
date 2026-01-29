import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
}

export interface ProductBatch {
    id: string;
    product_id: string;
    batch_number: string;
    cost_price: number;
    selling_price?: number;
    quantity_received: number;
    quantity_remaining: number;
    manufacture_date?: string;
    expiry_date?: string;
    status: 'active' | 'expired' | 'recalled' | 'depleted';
    created_at: string;
    updated_at: string;
}

export const batchApi = {
    list: async (productId?: string) => {
        const url = productId ? `/api/batches?productId=${productId}` : '/api/batches';
        return await apiClient.get<ApiResponse<{ batches: ProductBatch[] }>>(url);
    },

    create: async (data: Partial<ProductBatch>) => {
        return await apiClient.post<ApiResponse<{ batch: ProductBatch }>>('/api/batches', data);
    },

    getExpiringSoon: async (days: number = 30) => {
        return await apiClient.get<ApiResponse<{ batches: any[] }>>(`/api/batches/expiring?days=${days}`);
    },

    updateStatus: async (id: string, status: string) => {
        return await apiClient.patch<ApiResponse<{ batch: ProductBatch }>>(`/api/batches/${id}/status`, { status });
    }
};
