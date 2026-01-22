import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Customer, CustomerTransaction, CustomerHistory } from '@/types/customer';
import { customerApi } from '@/services/api/customerApi';
import { orderApi } from '@/services/api/orderApi';
import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

interface CustomerLedgerProps {
    customer: Customer;
    onClose: () => void;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({ customer, onClose }) => {
    const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
    const [history, setHistory] = useState<CustomerHistory[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ledger' | 'purchases' | 'history'>('ledger');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDesc, setPaymentDesc] = useState('');

    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tData, hData, pData] = await Promise.all([
                customerApi.getTransactions(customer.id),
                customerApi.getHistory(customer.id),
                orderApi.getAll({ customerId: customer.id })
            ]);
            setTransactions(tData);
            setHistory(hData);
            setPurchases(pData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [customer.id]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount) return;

        try {
            await customerApi.addTransaction(
                customer.id,
                'payment',
                parseFloat(paymentAmount),
                paymentDesc || 'Manual Payment'
            );
            toast({ title: "Success", description: "Payment recorded successfully" });
            setPaymentAmount('');
            setPaymentDesc('');
            setShowPaymentForm(false);
            fetchData(); // refresh
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed" });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{customer.name}</h2>
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">Phone: {customer.phone || 'N/A'}</span>
                            <span className="flex items-center gap-1">ID: #{customer.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance (Debt)</p>
                        <div className={`text-3xl font-black ${customer.currentBalance > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                            {formatCurrency(customer.currentBalance)}
                        </div>
                        {customer.creditLimit > 0 && (
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                                Limit: {formatCurrency(customer.creditLimit)} • Available: <span className="text-green-600">{formatCurrency(customer.creditLimit - customer.currentBalance)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Transactions List */}
                    <div className="flex-1 bg-white flex flex-col overflow-hidden border-r border-slate-100">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-600 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('ledger')}
                                    className={`pb-2 border-b-2 transition-all ${activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                                >
                                    Debt Ledger
                                </button>
                                <button
                                    onClick={() => setActiveTab('purchases')}
                                    className={`pb-2 border-b-2 transition-all ${activeTab === 'purchases' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                                >
                                    Purchase History
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`pb-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                                >
                                    Profile Changes
                                </button>
                            </div>
                            <Button size="sm" variant="outline" onClick={fetchData} className="text-xs h-8">Refresh</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="text-center p-10 text-slate-400">Loading...</div>
                            ) : activeTab === 'ledger' ? (
                                transactions.length === 0 ? (
                                    <div className="text-center p-10 text-slate-400">No debt transactions found.</div>
                                ) : (
                                    transactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${t.type === 'sale' ? 'bg-orange-100 text-orange-600' :
                                                        t.type === 'payment' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>{t.type}</span>
                                                    <span className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="font-medium text-slate-700 mt-1">{t.description}</p>
                                            </div>
                                            <div className={`font-bold ${['payment', 'return'].includes(t.type) ? 'text-green-600' : 'text-orange-600'
                                                }`}>
                                                {['payment', 'return'].includes(t.type) ? '-' : '+'}{formatCurrency(t.amount)}
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : activeTab === 'purchases' ? (
                                purchases.length === 0 ? (
                                    <div className="text-center p-10 text-slate-400">No purchases found.</div>
                                ) : (
                                    purchases.map(p => (
                                        <div key={p.id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-black text-slate-800">#{p.invoice_number}</p>
                                                    <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-primary">{formatCurrency(p.total_amount)}</p>
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{p.payment_method}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {p.sale_items?.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-xs text-slate-500">
                                                        <span>{item.quantity}x {item.product_name}</span>
                                                        <span>{formatCurrency(item.total_price)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                history.length === 0 ? (
                                    <div className="text-center p-10 text-slate-400">No profile changes found.</div>
                                ) : (
                                    history.map(h => (
                                        <div key={h.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-black text-primary uppercase">{h.fieldName} Changed</span>
                                                <span className="text-[10px] text-slate-400">{new Date(h.changedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-400 line-through decoration-red-300">{h.oldValue || 'Empty'}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className="text-green-600 font-bold">{h.newValue || 'Empty'}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">Actions</h4>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 mb-3"
                                onClick={() => setShowPaymentForm(!showPaymentForm)}
                            >
                                Accept Payment
                            </Button>
                            <Button variant="outline" className="w-full" onClick={onClose}>Close Ledger</Button>
                        </div>

                        {showPaymentForm && (
                            <div className="bg-white p-4 rounded-xl shadow-lg border border-green-100 animate-in slide-in-from-right duration-300">
                                <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                    <Check size={16} /> Record Payment
                                </h4>
                                <form onSubmit={handlePayment} className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Amount Received</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full p-2 border border-slate-200 rounded-lg"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Description / Note</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded-lg"
                                            placeholder="e.g. Cash payment"
                                            value={paymentDesc}
                                            onChange={e => setPaymentDesc(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        Confirm Payment
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
