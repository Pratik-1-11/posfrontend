import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, X, Loader2, User, Phone, Sparkles } from 'lucide-react';
import { customerApi } from '@/services/api/customerApi';
import type { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

interface CustomerSelectProps {
    onSelectCustomer: (customer: Customer | null) => void;
    selectedCustomer: Customer | null;
}

// Helper to check if input looks like a phone number
const isPhoneNumber = (input: string): boolean => {
    // Matches inputs that are primarily digits (with optional + or -)
    const cleaned = input.replace(/[\s\-\(\)]/g, '');
    return /^\+?\d{7,}$/.test(cleaned) || /^\d{3,}$/.test(cleaned);
};

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
    onSelectCustomer,
    selectedCustomer
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Customer Form State
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', creditLimit: 0 });
    const [isCreating, setIsCreating] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowAddForm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchCustomers = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const data = await customerApi.getAll(query);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (isOpen) searchCustomers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query, isOpen]);

    // Auto-focus name input when add form opens
    useEffect(() => {
        if (showAddForm && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [showAddForm]);

    const handleQuickAdd = () => {
        // Pre-fill phone if query looks like a phone number
        const phoneValue = isPhoneNumber(query) ? query : '';
        setNewCustomer({ name: '', phone: phoneValue, address: '', creditLimit: 0 });
        setShowAddForm(true);
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.phone) {
            toast({ title: "Error", description: "Phone number is required for marketing", variant: "destructive" });
            return;
        }
        if (!newCustomer.name.trim()) {
            toast({ title: "Error", description: "Customer name is required", variant: "destructive" });
            return;
        }
        setIsCreating(true);
        try {
            const created = await customerApi.create(newCustomer);
            onSelectCustomer(created);
            setShowAddForm(false);
            setQuery('');
            setNewCustomer({ name: '', phone: '', address: '', creditLimit: 0 });
            setIsOpen(false);
            toast({
                title: "✓ Customer Added",
                description: `${created.name} (${created.phone}) saved for marketing`
            });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to create customer", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    if (selectedCustomer) {
        return (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                        <User size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{selectedCustomer.name}</h4>
                            {selectedCustomer.totalCredit > 0 && (
                                <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                                    Due: Rs.{selectedCustomer.totalCredit}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone size={10} />
                            <span>{selectedCustomer.phone || 'No phone'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onSelectCustomer(null)}
                    className="p-2 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Search Input - Phone Number First */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="📱 Enter phone number or name..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all text-sm"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setShowAddForm(false);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-400">
                            <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                            <p className="text-xs">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <ul className="max-h-48 overflow-y-auto">
                                {results.map(customer => (
                                    <li
                                        key={customer.id}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none flex items-center justify-between group transition-colors"
                                        onClick={() => {
                                            onSelectCustomer(customer);
                                            setIsOpen(false);
                                            setQuery('');
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{customer.name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Phone size={10} />
                                                    {customer.phone || 'No phone'}
                                                </p>
                                            </div>
                                        </div>
                                        {customer.totalCredit > 0 && (
                                            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                                Due: Rs.{customer.totalCredit}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {/* Option to add new even when results exist */}
                            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={handleQuickAdd}
                                    className="text-xs flex items-center justify-center gap-2 w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                                >
                                    <UserPlus size={14} />
                                    Add as new customer instead
                                </button>
                            </div>
                        </>
                    ) : query.trim() ? (
                        <div className="p-4 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                                <UserPlus size={24} className="text-blue-500" />
                            </div>
                            <p className="text-sm text-slate-600 mb-1 font-medium">No customer found</p>
                            <p className="text-xs text-slate-400 mb-4">
                                {isPhoneNumber(query)
                                    ? `Add "${query}" as a new customer`
                                    : 'Create a new customer record'
                                }
                            </p>
                            <button
                                onClick={handleQuickAdd}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 font-bold text-sm transition-all shadow-md hover:shadow-lg"
                            >
                                <Sparkles size={16} />
                                Quick Add Customer
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-slate-400">
                            <Phone size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Enter phone number to search or add customer</p>
                        </div>
                    )}

                    {/* Quick Add Form */}
                    {showAddForm && (
                        <div className="p-4 border-t border-slate-100 bg-gradient-to-b from-blue-50/50 to-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                    <UserPlus size={12} className="text-white" />
                                </div>
                                <h4 className="font-bold text-sm text-slate-700">New Customer</h4>
                                <span className="ml-auto text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">For Marketing</span>
                            </div>
                            <form onSubmit={handleCreateCustomer} className="space-y-3">
                                {/* Phone First - Pre-filled */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                                        Phone Number *
                                    </label>
                                    <input
                                        className="w-full p-2.5 text-sm border border-blue-200 rounded-lg bg-blue-50/50 focus:ring-2 focus:ring-blue-400/30 focus:outline-none"
                                        placeholder="98XXXXXXXX"
                                        required
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                                {/* Name */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                                        Customer Name *
                                    </label>
                                    <input
                                        ref={nameInputRef}
                                        className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:outline-none"
                                        placeholder="Enter customer name"
                                        required
                                        value={newCustomer.name}
                                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    />
                                </div>
                                {/* Credit Limit */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                                        Credit Limit (Rs.)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:outline-none"
                                        placeholder="0 = No Credit"
                                        value={newCustomer.creditLimit}
                                        onChange={e => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                                    />
                                </div>
                                {/* Address - Optional */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                                        Address <span className="text-slate-400">(Optional)</span>
                                    </label>
                                    <input
                                        className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400/30 focus:outline-none"
                                        placeholder="Area, City"
                                        value={newCustomer.address}
                                        onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewCustomer({ name: '', phone: '', address: '', creditLimit: 0 });
                                        }}
                                        className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg disabled:opacity-50 hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
                                    >
                                        {isCreating ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={14} />
                                                Saving...
                                            </span>
                                        ) : (
                                            'Save & Select'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
