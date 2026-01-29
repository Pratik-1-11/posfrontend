import { apiClient } from './apiClient';

export interface DailySalesStat {
    sale_date: string;
    total_transactions: number;
    total_sub_total: number;
    total_discount: number;
    total_taxable: number;
    total_vat: number;
    total_revenue: number;
}

export interface CashierStat {
    cashier_name: string;
    cashier_id: string;
    total_sales_count: number;
    total_revenue_generated: number;
}

export interface StockSummary {
    id: string;
    name: string;
    stock_quantity: number;
    min_stock_level: number;
}

export interface ExpenseSummary {
    expense_date: string;
    category: string;
    status: string;
    total_entries: number;
    total_amount: number;
}

export interface PurchaseSummary {
    purchase_date: string;
    supplier_name: string;
    status: string;
    total_entries: number;
    total_quantity: number;
    total_spent: number;
}

export interface HealthOverview {
    activeCashiers: number;
    lowStockAlerts: number;
    expiringSoon: number;
    pendingCredits: number;
    failedTransactions: number;
}

export interface PerformanceAnalytics {
    topProducts: any[];
    paymentSplit: Record<string, number>;
}

export interface VatReport {
    invoice_number: string;
    created_at: string;
    customer_name: string;
    sub_total: number;
    discount_amount: number;
    taxable_amount: number;
    vat_amount: number;
    total_amount: number;
}

export interface VatReportSummary {
    totalSales: number;
    taxableAmount: number;
    vatAmount: number;
    nonTaxableAmount: number;
}

export interface PurchaseBookItem {
    date: string;
    bill_number: string;
    supplier_name: string;
    supplier_pan: string;
    taxable_amount: number;
    vat_amount: number;
    non_taxable_amount: number;
    total_amount: number;
    total_import_amount?: number;
}

export interface PurchaseBookSummary {
    taxableAmount: number;
    vatAmount: number;
    nonTaxableAmount: number;
    totalImports: number;
}

export const reportApi = {
    getDailySales: async (): Promise<DailySalesStat[]> => {
        const res = await apiClient.request<{ status: string; data: { stats: DailySalesStat[] } }>('/api/reports/daily');
        return res.data.stats;
    },

    getHealthOverview: async (): Promise<HealthOverview> => {
        const res = await apiClient.request<{ status: string; data: HealthOverview }>('/api/reports/health');
        return res.data;
    },

    getPerformanceAnalytics: async (): Promise<PerformanceAnalytics> => {
        const res = await apiClient.request<{ status: string; data: PerformanceAnalytics }>('/api/reports/performance');
        return res.data;
    },

    getCashierStats: async (): Promise<CashierStat[]> => {
        const res = await apiClient.request<{ status: string; data: { stats: CashierStat[] } }>('/api/reports/cashier');
        return res.data.stats;
    },

    getStockSummary: async (): Promise<StockSummary[]> => {
        const res = await apiClient.request<{ status: string; data: { products: StockSummary[] } }>('/api/reports/stock');
        return res.data.products;
    },

    getExpenseSummary: async (): Promise<ExpenseSummary[]> => {
        const res = await apiClient.request<{ status: string; data: { stats: ExpenseSummary[] } }>('/api/reports/expenses');
        return res.data.stats;
    },

    getPurchaseSummary: async (): Promise<PurchaseSummary[]> => {
        const res = await apiClient.request<{ status: string; data: { stats: PurchaseSummary[] } }>('/api/reports/purchases');
        return res.data.stats;
    },

    getProfitAnalysis: async (params?: { startDate?: string, endDate?: string, branchId?: string }) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        const response = await apiClient.get<any>(`/api/reports/profit${query}`); // Assuming ApiResponse<{ report: any[], summary: any }> is not defined or needs to be imported, using 'any' for simplicity based on the instruction's snippet.
        return response.data;
    },

    getVatReport: async (year: number, month: number): Promise<{ report: VatReport[], summary: VatReportSummary }> => {
        const res = await apiClient.request<{ status: string; data: { report: VatReport[], summary: VatReportSummary } }>(`/api/reports/vat?year=${year}&month=${month}`);
        return res.data;
    },

    getPurchaseBook: async (year: number, month: number): Promise<{ report: PurchaseBookItem[], summary: PurchaseBookSummary }> => {
        const res = await apiClient.request<{ status: string; data: { report: PurchaseBookItem[], summary: PurchaseBookSummary } }>(`/api/reports/purchase-book?year=${year}&month=${month}`);
        return res.data;
    },

    getSummary: async (): Promise<{
        dailySales: DailySalesStat[];
        health: HealthOverview;
        performance: PerformanceAnalytics
    }> => {
        const res = await apiClient.request<{ status: string; data: any }>('/api/reports/summary');
        return res.data;
    }
};
