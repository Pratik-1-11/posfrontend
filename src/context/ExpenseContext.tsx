import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/services/api/expenseApi';
import type { Expense } from '@/types/expense';

type ExpenseContextType = {
    expenses: Expense[];
    loading: boolean;
    refresh: () => void;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
    updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
    deleteExpense: (id: string) => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const EXPENSES_QUERY_KEY = ['expenses'];

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: EXPENSES_QUERY_KEY,
        queryFn: expenseApi.getAll,
    });

    const addExpenseMutation = useMutation({
        mutationFn: expenseApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
        },
    });

    const updateExpenseMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Expense> }) =>
            expenseApi.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: expenseApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
        },
    });

    const value = {
        expenses,
        loading: isLoading,
        refresh: () => queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY }),
        addExpense: addExpenseMutation.mutateAsync,
        updateExpense: (id: string, updates: Partial<Expense>) =>
            updateExpenseMutation.mutateAsync({ id, updates }),
        deleteExpense: async (id: string) => {
            await deleteExpenseMutation.mutateAsync(id);
        },
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenseContext = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenseContext must be used within an ExpenseProvider');
    }
    return context;
};
