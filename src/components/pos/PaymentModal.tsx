import React, { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react';
import type { PaymentMethod } from '@/types/payment';
import { formatCurrency } from '@/utils/currency';
import type { Customer } from '@/types/customer';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: PaymentMethod, amountReceived: number, paymentDetails?: Record<string, number>) => void;
    total: number;
    selectedPayment: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    customer: Customer | null;
}

const paymentMethods: { method: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { method: 'cash', label: 'Cash', icon: <Banknote size={20} />, color: 'bg-emerald-500' },
    { method: 'credit_card', label: 'Card', icon: <CreditCard size={20} />, color: 'bg-blue-500' },
    { method: 'fonepay', label: 'FonePay', icon: <Smartphone size={20} />, color: 'bg-purple-500' },
    { method: 'esewa', label: 'eSewa', icon: <Wallet size={20} />, color: 'bg-green-500' },
    { method: 'credit', label: 'Credit', icon: <DollarSign size={20} />, color: 'bg-orange-500' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    total,
    selectedPayment,
    onPaymentMethodChange,
    customer,
}) => {
    const hasCustomer = !!customer;
    const [amountReceived, setAmountReceived] = useState<string>(total.toString());
    const [isSplitWithCredit, setIsSplitWithCredit] = useState(false);
    const [applyChangeToDebt, setApplyChangeToDebt] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const numericAmount = parseFloat(amountReceived) || 0;
    const isCredit = selectedPayment === 'credit';
    const change = numericAmount - total;

    // Validation logic
    const isValidPayment = isCredit
        ? hasCustomer
        : isSplitWithCredit
            ? (numericAmount < total && numericAmount >= 0 && hasCustomer)
            : (numericAmount >= total);

    const amountToCredit = isSplitWithCredit ? (total - numericAmount) : (isCredit ? total : 0);
    const previousDue = customer?.currentBalance || 0;
    const totalOutstanding = previousDue + amountToCredit;

    const handleConfirm = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            let finalMethod = selectedPayment;
            let details: Record<string, number> = {};

            if (isSplitWithCredit) {
                finalMethod = 'mixed';
                details[selectedPayment] = numericAmount;
                details['credit'] = amountToCredit;
            } else if (isCredit) {
                details['credit'] = total;
            } else {
                details[selectedPayment] = total;
                if (applyChangeToDebt && change > 0 && previousDue > 0) {
                    const debtPayment = Math.min(change, previousDue);
                    details['debt_payment'] = debtPayment;
                }
            }

            await onConfirm(finalMethod, numericAmount, details);
            onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickAmount = (amount: number) => {
        setAmountReceived(amount.toString());
    };

    const quickAmounts = [100, 500, 1000, 2000, 5000];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Process Payment</h3>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-sm text-slate-500">Current Bill: {formatCurrency(total)}</p>
                            {previousDue > 0 && (
                                <p className="text-xs font-bold text-orange-600">Previous Due: {formatCurrency(previousDue)}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {/* Payment Methods */}
                    <div className="p-4 md:p-6 border-b border-slate-100">
                        <label className="block text-sm font-medium text-slate-600 mb-3">Payment Method</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {paymentMethods.map(({ method, label, icon, color }) => {
                                const isDisabled = method === 'credit' && !hasCustomer;
                                return (
                                    <button
                                        key={method}
                                        onClick={() => {
                                            if (!isDisabled) {
                                                onPaymentMethodChange(method);
                                                setApplyChangeToDebt(false);
                                                if (method === 'credit') {
                                                    setIsSplitWithCredit(false);
                                                    setAmountReceived("0");
                                                } else if (method === 'cash') {
                                                    // Default to total outstanding (Bill + Debt) if customer has debt
                                                    const totalDue = total + previousDue;
                                                    setAmountReceived(totalDue.toString());
                                                    if (previousDue > 0) setApplyChangeToDebt(true);
                                                } else {
                                                    setAmountReceived(total.toString());
                                                }
                                            }
                                        }}
                                        disabled={isDisabled}
                                        className={`
                                        flex flex-col items-center justify-center p-3 rounded-xl transition-all
                                        ${selectedPayment === method
                                                ? `${color} text-white shadow-lg scale-105`
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                        title={isDisabled ? 'Select a customer to use credit' : label}
                                    >
                                        {icon}
                                        <span className="text-xs font-medium mt-1">{label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Split Payment Toggle & Previous Credit Display */}
                        {hasCustomer && (
                            <div className="mt-4 space-y-2">
                                {customer.currentBalance > 0 && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={16} className="text-red-500" />
                                            <span className="text-xs font-bold text-red-700 uppercase tracking-tight">Previous Due</span>
                                        </div>
                                        <span className="text-sm font-black text-red-600">{formatCurrency(customer.currentBalance)}</span>
                                    </div>
                                )}

                                {selectedPayment !== 'credit' && (
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={18} className="text-orange-600" />
                                            <div>
                                                <p className="text-xs font-black text-orange-800 uppercase">Split with Credit?</p>
                                                <p className="text-[10px] text-orange-600 font-medium">Pay partial now, rest on credit</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsSplitWithCredit(!isSplitWithCredit)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${isSplitWithCredit ? 'bg-orange-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSplitWithCredit ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedPayment === 'credit' && !hasCustomer && (
                            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                <span>⚠️</span> Please select a customer to use credit payment
                            </p>
                        )}
                    </div>

                    {/* Amount Section - Only for Cash or Split */}
                    {(selectedPayment === 'cash' || isSplitWithCredit) && (
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    {isSplitWithCredit ? 'Amount Paying Now' : 'Amount Received'}
                                </label>
                                <input
                                    type="number"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                                    placeholder="0.00"
                                    min={0}
                                />
                            </div>

                            {/* Quick Amounts */}
                            <div className="flex flex-wrap gap-2">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => handleQuickAmount(amount)}
                                        className="flex-1 min-w-[60px] py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
                                    >
                                        {amount}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        handleQuickAmount(total);
                                        setApplyChangeToDebt(false);
                                    }}
                                    className="flex-1 min-w-[60px] py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition-colors border border-emerald-100"
                                    title="Pay only the current bill"
                                >
                                    Bill Only
                                </button>
                                {previousDue > 0 && amountReceived !== (total + previousDue).toString() && (
                                    <button
                                        onClick={() => {
                                            handleQuickAmount(total + previousDue);
                                            setApplyChangeToDebt(true);
                                        }}
                                        className="flex-1 min-w-[120px] py-2 px-3 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-sm transition-all border border-orange-200"
                                    >
                                        Exact Total
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Card - Always visible */}
                    <div className="p-6 pt-0">
                        <div className={`p-4 rounded-xl ${isValidPayment ? 'bg-slate-50' : 'bg-red-50'}`}>
                            <div className="space-y-2">
                                {isSplitWithCredit ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-slate-600">Paying via {selectedPayment}:</span>
                                            <span className="text-sm font-bold text-slate-800">{formatCurrency(numericAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-orange-600 border-b border-orange-100 pb-2 mb-2">
                                            <span className="text-sm font-black uppercase">Adding to Credit:</span>
                                            <span className="text-xl font-black">{formatCurrency(amountToCredit)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-orange-800 font-bold">
                                            <span className="text-xs uppercase tracking-tight">New Total Balance:</span>
                                            <span className="text-sm">{formatCurrency(totalOutstanding)}</span>
                                        </div>
                                        <p className="text-[10px] text-orange-500 text-right mt-1">
                                            (Prev. {formatCurrency(previousDue)} + New {formatCurrency(amountToCredit)})
                                        </p>
                                    </>
                                ) : selectedPayment === 'cash' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            {change === 0 ? (
                                                <>
                                                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-tight">Full Cash Payment</span>
                                                    <span className="text-xl font-black text-emerald-600">{formatCurrency(total)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={`text-sm font-medium ${change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                        {change >= 0 ? (applyChangeToDebt && previousDue > 0 ? 'Change Left' : 'Change to Return') : 'Amount Due'}
                                                    </span>
                                                    <span className={`text-xl font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {formatCurrency(Math.max(0, applyChangeToDebt ? Math.max(0, change - previousDue) : change))}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {change > 0 && previousDue > 0 && (
                                            <div className="pt-3 border-t border-slate-200">
                                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <Wallet size={16} className="text-blue-600" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-blue-800 uppercase">Apply to Debt?</p>
                                                            <p className="text-[9px] text-blue-600">Use change to pay off {formatCurrency(Math.min(change, previousDue))} debt</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setApplyChangeToDebt(!applyChangeToDebt)}
                                                        className={`w-10 h-5 rounded-full transition-colors relative ${applyChangeToDebt ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${applyChangeToDebt ? 'left-[22px]' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3">
                                        <p className="text-slate-600 text-sm">
                                            {isCredit ? 'Full amount will be added to customer credit' : `Full payment via ${selectedPayment}`}
                                        </p>
                                        {hasCustomer && totalOutstanding > 0 && (
                                            <div className="pt-2 border-t border-slate-200">
                                                <div className="flex justify-between items-center text-orange-700 font-bold">
                                                    <span className="text-xs uppercase tracking-tight">New Total Balance</span>
                                                    <span className="text-lg">{formatCurrency(totalOutstanding)}</span>
                                                </div>
                                                <p className="text-[10px] text-orange-500 text-right mt-1 italic">
                                                    (Previous Rs.{previousDue} + Current Rs.{amountToCredit})
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                    <button
                        className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`
                            flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95
                            ${isValidPayment && (!isCredit || hasCustomer)
                                ? 'bg-primary hover:bg-primary/90 shadow-primary/25 cursor-pointer'
                                : 'bg-slate-300 cursor-not-allowed'
                            }
                        `}
                        onClick={handleConfirm}
                        disabled={!isValidPayment || (isCredit && !hasCustomer)}
                    >
                        Complete Payment
                    </button>
                </div>
            </div>
        </div>
    );
};
