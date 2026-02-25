import { apiClient } from './apiClient';

export interface VoidSaleParams {
    reason: string;
    authCode?: string; // Manager PIN if needed
    managerId?: string; // ID of authorizing manager
}

export interface VoidSaleResult {
    success: boolean;
    sale_id: string;
    invoice_number: string;
    status: string;
    message: string;
}

export interface AuditLogEntry {
    id: string;
    sale_id: string;
    invoice_number: string;
    modification_type: 'void' | 'refund' | 'edit_attempt' | 'unlock' | 'reprint';
    reason: string;
    modification_date: string;
    modified_by_name: string;
    modifier_role: string;
    authorized_by_name?: string;
    old_status?: string;
    new_status?: string;
    amount?: number;
}

export const invoiceApi = {
    /**
     * Void a sale (Manager only)
     */
    voidSale: async (id: string, params: VoidSaleParams): Promise<VoidSaleResult> => {
        const response = await apiClient.post<any>(`/api/invoices/${id}/void`, params);
        return response.data.result;
    },

    /**
     * Track invoice print/reprint
     */
    trackPrint: async (id: string): Promise<{ printCount: number; isReprint: boolean }> => {
        const response = await apiClient.post<any>(`/api/invoices/${id}/track-print`);
        return response.data;
    },

    /**
     * Get audit trail for a specific invoice
     */
    getAuditTrail: async (id: string): Promise<AuditLogEntry[]> => {
        const response = await apiClient.get<any>(`/api/invoices/${id}/audit-trail`);
        return response.data.trail;
    },

    /**
     * Get global audit trail
     */
    getGlobalAuditTrail: async (page = 1, limit = 20): Promise<{ trail: AuditLogEntry[]; total: number }> => {
        const response = await apiClient.get<any>(`/api/invoices/audit-trail?page=${page}&limit=${limit}`);
        return response.data;
    },

    /**
     * Get voided sales report
     */
    getVoidedSales: async (startDate?: string, endDate?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiClient.get<any>(`/api/invoices/voided?${params.toString()}`);
        return response.data;
    }
};
