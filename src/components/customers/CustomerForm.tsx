import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { customerApi } from '@/services/api/customerApi';
import type { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';

interface CustomerFormProps {
    customer?: Customer;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        isActive: true,
        creditLimit: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                isActive: customer.isActive,
                creditLimit: customer.creditLimit || 0
            });
        }
    }, [customer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let result;
            if (customer) {
                result = await customerApi.update(customer.id, formData);
                toast({ title: "Updated", description: "Customer detail updated" });
            } else {
                result = await customerApi.create({ ...formData, currentBalance: 0, totalPurchases: 0, createdDate: new Date() });
                toast({ title: "Created", description: "New customer added" });
            }
            onSuccess(result);
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to save", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">{customer ? 'Edit Customer' : 'New Customer'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                        <input
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            placeholder="Required for marketing"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Credit Limit (Rs.)</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            placeholder="Max credit allowed (0 = No Credit)"
                            value={formData.creditLimit}
                            onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none h-24"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white">
                            {isSubmitting && <Loader2 className="animate-spin mr-2" size={16} />}
                            Save Customer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
