import type { Expense } from '@/types/expense';
import { apiClient } from './apiClient';

type ListExpensesResponse = {
    status: 'success';
    data: {
        expenses: Expense[];
    };
};

type ExpenseResponse = {
    status: 'success';
    data: {
        expense: Expense;
    };
};

const mapExpense = (e: any): Expense => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    category: e.category,
    date: e.date,
    status: e.status,
    paymentMethod: e.payment_method,
    receiptUrl: e.receipt_url,
});

export const expenseApi = {
    getAll: async (): Promise<Expense[]> => {
        const res = await apiClient.request<ListExpensesResponse>('/api/expenses', { method: 'GET' });
        return res.data.expenses.map(mapExpense);
    },

    create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
        const payload = {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            status: expense.status || 'pending',
            paymentMethod: expense.paymentMethod,
            receiptUrl: expense.receiptUrl,
        };

        const res = await apiClient.request<ExpenseResponse>('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mapExpense(res.data.expense);
    },

    update: async (id: string, updates: Partial<Expense>): Promise<Expense> => {
        const payload: any = {};
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.amount !== undefined) payload.amount = updates.amount;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.date !== undefined) payload.date = updates.date;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.paymentMethod !== undefined) payload.paymentMethod = updates.paymentMethod;
        if (updates.receiptUrl !== undefined) payload.receiptUrl = updates.receiptUrl;

        const res = await apiClient.request<ExpenseResponse>(`/api/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return mapExpense(res.data.expense);
    },

    delete: async (id: string): Promise<boolean> => {
        await apiClient.request(`/api/expenses/${id}`, { method: 'DELETE' });
        return true;
    },
};
