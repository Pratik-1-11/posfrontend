import { apiClient, ApiResponse } from './apiClient';

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
        const response = await apiClient.get<ApiResponse<{ batches: ProductBatch[] }>>(url);
        return response.data;
    },

    create: async (data: Partial<ProductBatch>) => {
        const response = await apiClient.post<ApiResponse<{ batch: ProductBatch }>>('/api/batches', data);
        return response.data;
    },

    getExpiringSoon: async (days: number = 30) => {
        const response = await apiClient.get<ApiResponse<{ batches: any[] }>>(`/api/batches/expiring?days=${days}`);
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await apiClient.patch<ApiResponse<{ batch: ProductBatch }>>(`/api/batches/${id}/status`, { status });
        return response.data;
    }
};
