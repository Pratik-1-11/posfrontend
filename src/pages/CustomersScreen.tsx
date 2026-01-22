import React, { useState, useEffect } from 'react';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerLedger } from '@/components/customers/CustomerLedger';
import { customerApi } from '@/services/api/customerApi';
import type { Customer } from '@/types/customer';

export const CustomersScreen: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

    const fetchCustomers = async () => {
        try {
            const data = await customerApi.getAll(searchQuery);
            setCustomers(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        // Debounce search
        const t = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleCreateSuccess = () => {
        setIsFormOpen(false);
        setEditingCustomer(undefined);
        fetchCustomers();
    };

    return (
        <div className="h-screen bg-slate-50 p-6 flex flex-col overflow-hidden font-inter">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Customers</h1>
                    <p className="text-slate-500 font-medium">Manage customer profiles and credit ledgers</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <CustomerList
                    customers={customers}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelect={setSelectedCustomer}
                    onAdd={() => {
                        setEditingCustomer(undefined);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            {isFormOpen && (
                <CustomerForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleCreateSuccess}
                    customer={editingCustomer}
                />
            )}

            {selectedCustomer && (
                <CustomerLedger
                    customer={selectedCustomer}
                    onClose={() => {
                        setSelectedCustomer(null);
                        fetchCustomers(); // Refresh to see updated balance if changed
                    }}
                />
            )}
        </div>
    );
};
