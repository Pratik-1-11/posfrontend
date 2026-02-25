import { apiClient } from './apiClient';

export interface Shift {
    id: string;
    tenant_id: string;
    cashier_id: string;
    start_time: string;
    end_time: string | null;
    start_cash: number;
    expected_end_cash: number | null;
    actual_end_cash: number | null;
    difference: number | null;
    status: 'open' | 'closed' | 'cancelled';
    notes: string | null;
}

export interface ShiftSummary {
    shift: Shift & { cashier: { full_name: string } };
    summary: {
        totalSales: number;
        totalTax: number;
        totalDiscount: number;
        byMethod: Record<string, number>;
    };
}

interface ApiResponse<T> {
    status: string;
    data: T;
    message?: string;
}

export const shiftApi = {
    getCurrent: async () => {
        const response = await apiClient.get<ApiResponse<Shift | null>>('/api/shifts/current');
        return response.data;
    },

    open: async (payload: { startCash: number; notes?: string }) => {
        const response = await apiClient.post<ApiResponse<Shift>>('/api/shifts/open', payload);
        return response.data;
    },

    close: async (id: string, payload: { actualCash: number; notes?: string }) => {
        const response = await apiClient.post<ApiResponse<any>>(`/api/shifts/${id}/close`, payload);
        return response.data;
    },

    getSummary: async (id: string) => {
        const response = await apiClient.get<ApiResponse<ShiftSummary>>(`/api/shifts/${id}/summary`);
        return response.data;
    }
};
