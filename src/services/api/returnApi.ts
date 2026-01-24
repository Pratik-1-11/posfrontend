import { apiClient } from './apiClient';

export interface ReturnItem {
    product_id: string;
    quantity: number;
    refund_amount: number;
}

export interface CreateReturnRequest {
    saleId: string;
    items: ReturnItem[];
    reason?: string;
    cashierId?: string;
}

interface ApiResponse<T> {
    status: string;
    data: T;
}

export const returnApi = {
    create: async (data: CreateReturnRequest) => {
        const response = await apiClient.post<ApiResponse<{ return: any }>>('/api/returns', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 50) => {
        const response = await apiClient.get<ApiResponse<{ returns: any[] }>>(`/api/returns`, {
            params: { page, limit }
        });
        return response.data.returns;
    },

    getOne: async (id: string) => {
        const response = await apiClient.get<ApiResponse<{ return: any }>>(`/api/returns/${id}`);
        return response.data.return;
    },
};
