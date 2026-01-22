import { apiClient } from "./apiClient";
import type { Customer, CustomerTransaction, TransactionType, CustomerHistory } from "@/types/customer";
import { db } from "@/db/db";

type ListCustomersResponse = {
    status: "success";
    data: {
        customers: Customer[];
    };
    total?: number;
};

type CustomerResponse = {
    status: "success";
    data: {
        customer: Customer;
    };
};

type TransactionsResponse = {
    status: "success";
    data: {
        transactions: CustomerTransaction[];
    };
};

type HistoryResponse = {
    status: "success";
    data: {
        history: CustomerHistory[];
    };
};

// Mapper to convert snake_case DB fields to camelCase
const mapCustomer = (c: any): Customer => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    totalCredit: Number(c.total_credit || 0),
    currentBalance: Number(c.total_credit || 0),
    totalPurchases: Number(c.total_purchases || 0),
    creditLimit: Number(c.credit_limit || 0),
    isActive: c.is_active,
    createdDate: new Date(c.created_at || Date.now())
});


const mapTransaction = (t: any): CustomerTransaction => ({
    id: t.id,
    customerId: t.customer_id,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    referenceId: t.reference_id,
    createdAt: t.created_at,
    performedBy: t.performed_by
});

const mapHistory = (h: any): CustomerHistory => ({
    id: h.id,
    customerId: h.customer_id,
    fieldName: h.field_name,
    oldValue: h.old_value,
    newValue: h.new_value,
    changedBy: h.changed_by,
    changedAt: h.changed_at
});

export const customerApi = {
    getAll: async (search?: string): Promise<Customer[]> => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const res = await apiClient.request<ListCustomersResponse>(`/api/customers?${params.toString()}`, { method: "GET" });
            return res.data.customers.map(mapCustomer);
        } catch (error: any) {
            if (!navigator.onLine || error.message === 'Failed to fetch' || error.name === 'TypeError') {
                console.warn('[CustomerApi] Network error. Fetching from local DB.');
                let cached = await db.customers.toArray();

                // Manual filtering for offline search
                if (search) {
                    const q = search.toLowerCase();
                    cached = cached.filter(c =>
                        c.name.toLowerCase().includes(q) ||
                        c.phone.includes(q)
                    );
                }

                // Ensure shape matches (Dexie stores a subset of fields defined in db.ts)
                // We need to map them to the full Customer type expected by the UI.
                // The DB interface has optional fields, Customer type might have required ones.
                return cached.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email || '',
                    address: c.address || '',
                    totalCredit: 0,
                    currentBalance: 0,
                    totalPurchases: 0,
                    creditLimit: 0,
                    isActive: true,
                    createdDate: new Date()
                }));
            }
            throw error;
        }
    },

    getById: async (id: string): Promise<Customer | undefined> => {
        try {
            const res = await apiClient.request<CustomerResponse>(`/api/customers/${id}`, { method: "GET" });
            return mapCustomer(res.data.customer);
        } catch {
            return undefined;
        }
    },

    create: async (data: Partial<Customer>): Promise<Customer> => {
        const res = await apiClient.request<CustomerResponse>("/api/customers", {
            method: "POST",
            json: data,
        });
        return mapCustomer(res.data.customer);
    },

    update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
        const res = await apiClient.request<CustomerResponse>(`/api/customers/${id}`, {
            method: "PUT",
            json: data,
        });
        return mapCustomer(res.data.customer);
    },

    getTransactions: async (id: string): Promise<CustomerTransaction[]> => {
        const res = await apiClient.request<TransactionsResponse>(`/api/customers/${id}/transactions`, { method: "GET" });
        return res.data.transactions.map(mapTransaction);
    },

    addTransaction: async (id: string, type: TransactionType, amount: number, description?: string): Promise<void> => {
        await apiClient.request(`/api/customers/${id}/transactions`, {
            method: "POST",
            json: { type, amount, description },
        });
    },

    getHistory: async (id: string): Promise<CustomerHistory[]> => {
        const res = await apiClient.request<HistoryResponse>(`/api/customers/${id}/history`, { method: "GET" });
        return res.data.history.map(mapHistory);
    },

    getAgingReport: async (): Promise<any[]> => {
        const res = await apiClient.request<{ status: string, data: { report: any[] } }>('/api/customers/aging', { method: "GET" });
        return res.data.report;
    }
};

