import { apiClient } from './apiClient';

export interface JournalEntryLine {
    id: string;
    account_id: string;
    debit: number;
    credit: number;
    accounts: {
        code: string;
        name: string;
        type: string;
        system_code: string;
    };
}

export interface JournalEntry {
    id: string;
    reference_id: string;
    reference_type: string;
    description: string;
    entry_date: string;
    created_at: string;
    journal_entry_lines: JournalEntryLine[];
}

export interface AccountBalance {
    account: string;
    type: string;
    debit: number;
    credit: number;
}

export const accountingApi = {
    getJournalEntries: async (filters?: { startDate?: string; endDate?: string; accountId?: string }) => {
        let url = '/api/accounting/journals';
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.accountId) params.append('accountId', filters.accountId);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const { data } = await apiClient.request<{ data: { entries: JournalEntry[] } }>(url);
        return data.entries;
    },

    getTrialBalance: async () => {
        const { data } = await apiClient.request<{ data: { balances: AccountBalance[], totalDebit: number, totalCredit: number } }>('/api/accounting/trial-balance');
        return data;
    },

    getProfitAndLoss: async (filters?: { startDate?: string; endDate?: string }) => {
        let url = '/api/accounting/profit-loss';
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const { data } = await apiClient.request<{
            data: {
                totalRevenue: number;
                salesDiscount: number;
                totalCOGS: number;
                grossProfit: number;
                totalExpenses: number;
                netIncome: number;
            }
        }>(url);
        return data;
    }
};
