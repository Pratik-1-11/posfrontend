import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/services/api/purchaseApi';
import type { Purchase } from '@/pages/purchase/types';

type PurchaseContextType = {
    purchases: Purchase[];
    loading: boolean;
    refresh: () => void;
    addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Purchase>;
    updatePurchase: (id: string, updates: Partial<Purchase>) => Promise<Purchase>;
    deletePurchase: (id: string) => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

const PURCHASES_QUERY_KEY = ['purchases'];

export const PurchaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    const { data: purchases = [], isLoading } = useQuery({
        queryKey: PURCHASES_QUERY_KEY,
        queryFn: purchaseApi.getAll,
    });

    const addPurchaseMutation = useMutation({
        mutationFn: purchaseApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
        },
    });

    const updatePurchaseMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Purchase> }) =>
            purchaseApi.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
        },
    });

    const deletePurchaseMutation = useMutation({
        mutationFn: purchaseApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY });
        },
    });

    const value = {
        purchases,
        loading: isLoading,
        refresh: () => queryClient.invalidateQueries({ queryKey: PURCHASES_QUERY_KEY }),
        addPurchase: addPurchaseMutation.mutateAsync,
        updatePurchase: (id: string, updates: Partial<Purchase>) =>
            updatePurchaseMutation.mutateAsync({ id, updates }),
        deletePurchase: async (id: string) => {
            await deletePurchaseMutation.mutateAsync(id);
        },
    };

    return (
        <PurchaseContext.Provider value={value}>
            {children}
        </PurchaseContext.Provider>
    );
};

export const usePurchaseContext = () => {
    const context = useContext(PurchaseContext);
    if (context === undefined) {
        throw new Error('usePurchaseContext must be used within a PurchaseProvider');
    }
    return context;
};
