import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/types/customer';
import { customerApi } from '@/services/api/customerApi';
import { db } from '@/db/db';

interface CustomerContextType {
    customers: Customer[];
    loading: boolean;
    refresh: () => void;
    addCustomer: (customer: Omit<Customer, 'id' | 'createdDate' | 'currentBalance' | 'totalPurchases'>) => Promise<any>;
    getCustomer: (id: string) => Customer | undefined;
    getCustomerBalance: (customerId: string) => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    // 1. Load from Cache/API
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const data = await customerApi.getAll();
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    // 2. Background Sync to Dexie
    useEffect(() => {
        if (customers.length > 0) {
            const sync = async () => {
                const savedUser = localStorage.getItem('pos_user');
                const tenantId = savedUser ? JSON.parse(savedUser).tenant?.id || '' : '';

                await db.customers.bulkPut(customers.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    address: c.address,
                    pan_number: c.panNumber,
                    tenant_id: tenantId
                })));
            };
            sync();
        }
    }, [customers]);

    const addCustomerMutation = useMutation({
        mutationFn: customerApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    const getCustomer = (id: string) => {
        return customers.find(c => c.id === id);
    };

    const getCustomerBalance = (customerId: string): number => {
        const customer = customers.find(c => c.id === customerId);
        return customer?.currentBalance ?? 0;
    };

    return (
        <CustomerContext.Provider value={{
            customers,
            loading: isLoading,
            refresh: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
            addCustomer: addCustomerMutation.mutateAsync,
            getCustomer,
            getCustomerBalance,
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomer must be used within a CustomerProvider');
    }
    return context;
};
