import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Customer, CreditSale, CreditPayment } from '@/types/customer';

interface CustomerContextType {
    customers: Customer[];
    creditSales: CreditSale[];
    creditPayments: CreditPayment[];
    addCustomer: (customer: Omit<Customer, 'id' | 'createdDate' | 'currentBalance' | 'totalPurchases'>) => void;
    updateCustomer: (id: string, customer: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;
    getCustomer: (id: string) => Customer | undefined;
    addCreditSale: (sale: Omit<CreditSale, 'id'>) => string;
    addCreditPayment: (payment: Omit<CreditPayment, 'id'>) => void;
    getCustomerBalance: (customerId: string) => number;
    getCustomerCreditSales: (customerId: string) => CreditSale[];
    getCustomerPayments: (customerId: string) => CreditPayment[];
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>(() => {
        const saved = localStorage.getItem('customers');
        return saved ? JSON.parse(saved) : [];
    });

    const [creditSales, setCreditSales] = useState<CreditSale[]>(() => {
        const saved = localStorage.getItem('credit_sales');
        return saved ? JSON.parse(saved) : [];
    });

    const [creditPayments, setCreditPayments] = useState<CreditPayment[]>(() => {
        const saved = localStorage.getItem('credit_payments');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('credit_sales', JSON.stringify(creditSales));
    }, [creditSales]);

    useEffect(() => {
        localStorage.setItem('credit_payments', JSON.stringify(creditPayments));
    }, [creditPayments]);

    const addCustomer = (customerData: Omit<Customer, 'id' | 'createdDate' | 'currentBalance' | 'totalPurchases'>) => {
        const newCustomer: Customer = {
            ...customerData,
            id: `CUST-${Date.now()}`,
            currentBalance: 0,
            totalPurchases: 0,
            createdDate: new Date(),
        };
        setCustomers(prev => [...prev, newCustomer]);
    };

    const updateCustomer = (id: string, customerData: Partial<Customer>) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    };

    const deleteCustomer = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    const getCustomer = (id: string) => {
        return customers.find(c => c.id === id);
    };

    const addCreditSale = (saleData: Omit<CreditSale, 'id'>): string => {
        const id = `CS-${Date.now()}`;
        const newSale: CreditSale = {
            ...saleData,
            id,
        };

        setCreditSales(prev => [...prev, newSale]);

        // Update customer balance and total purchases
        const customer = customers.find(c => c.id === saleData.customerId);
        if (customer) {
            updateCustomer(saleData.customerId, {
                currentBalance: customer.currentBalance + saleData.remainingAmount,
                totalPurchases: customer.totalPurchases + saleData.amount,
                lastPurchaseDate: new Date(),
            });
        }

        return id;
    };

    const addCreditPayment = (paymentData: Omit<CreditPayment, 'id'>) => {
        const newPayment: CreditPayment = {
            ...paymentData,
            id: `CP-${Date.now()}`,
        };

        setCreditPayments(prev => [...prev, newPayment]);

        // Update credit sale
        const sale = creditSales.find(s => s.id === paymentData.creditSaleId);
        if (sale) {
            const updatedPaidAmount = sale.paidAmount + paymentData.amount;
            const updatedRemainingAmount = sale.amount - updatedPaidAmount;
            const updatedStatus = updatedRemainingAmount === 0 ? 'paid' : updatedPaidAmount > 0 ? 'partial' : 'pending';

            setCreditSales(prev => prev.map(s =>
                s.id === paymentData.creditSaleId
                    ? {
                        ...s,
                        paidAmount: updatedPaidAmount,
                        remainingAmount: updatedRemainingAmount,
                        status: updatedStatus as CreditSale['status']
                    }
                    : s
            ));

            // Update customer balance
            const customer = customers.find(c => c.id === paymentData.customerId);
            if (customer) {
                updateCustomer(paymentData.customerId, {
                    currentBalance: customer.currentBalance - paymentData.amount,
                });
            }
        }
    };

    const getCustomerBalance = (customerId: string): number => {
        const customer = customers.find(c => c.id === customerId);
        return customer?.currentBalance ?? 0;
    };

    const getCustomerCreditSales = (customerId: string): CreditSale[] => {
        return creditSales.filter(s => s.customerId === customerId);
    };

    const getCustomerPayments = (customerId: string): CreditPayment[] => {
        return creditPayments.filter(p => p.customerId === customerId);
    };

    return (
        <CustomerContext.Provider value={{
            customers,
            creditSales,
            creditPayments,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            getCustomer,
            addCreditSale,
            addCreditPayment,
            getCustomerBalance,
            getCustomerCreditSales,
            getCustomerPayments,
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
