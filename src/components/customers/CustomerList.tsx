import React from 'react';
import { Search, Plus, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/currency';

interface CustomerListProps {
    customers: Customer[];
    onSelect: (customer: Customer) => void;
    onAdd: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
    customers,
    onSelect,
    onAdd,
    searchQuery,
    onSearchChange
}) => {
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button onClick={onAdd} className="bg-primary text-white rounded-xl px-4 font-bold flex items-center gap-2 shadow-lg shadow-primary/25">
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Customer</span>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {customers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <p>No customers found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {customers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => onSelect(customer)}
                                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{customer.name}</h3>
                                    {customer.currentBalance > 0 && (
                                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold">
                                            Due: {formatCurrency(customer.currentBalance)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    {customer.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone size={14} />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            <span>{customer.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
