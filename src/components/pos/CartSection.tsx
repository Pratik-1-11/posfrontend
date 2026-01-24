import React from 'react';
import { Plus, Minus, Trash2, ShoppingCart, X, CreditCard, Pause, Play, RotateCcw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartSectionProps {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    todaySales: { total: number; count: number };
    heldBillsCount: number;
    canReprint: boolean;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
    onClearCart: () => void;
    onHoldBill: () => void;
    onShowHeldBills: () => void;
    onReprintLastInvoice: () => void;
    onProcessPayment: () => void;
    isSidebarCollapsed?: boolean;
    customerSlot?: React.ReactNode;
}

export const CartSection: React.FC<CartSectionProps> = ({
    items,
    subtotal,
    tax,
    total,
    todaySales,
    heldBillsCount,
    canReprint,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onHoldBill,
    onShowHeldBills,
    onReprintLastInvoice,
    onProcessPayment,
    isSidebarCollapsed = false,
    customerSlot
}) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className={`
            ${isSidebarCollapsed ? 'lg:w-[410px] xl:w-[440px]' : 'lg:w-[360px] xl:w-[380px]'}
            w-full bg-white border-l border-slate-100 flex flex-col h-full shadow-2xl relative z-10 font-inter no-print transition-all duration-300 overflow-hidden
        `}>
            {/* Top Section */}
            <div className="flex flex-col flex-none">
                {/* Today's Sales */}
                <div className="p-3 md:p-4 bg-slate-50/50 border-b border-slate-100/50">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Sales</span>
                                <div className="text-xs font-black text-slate-800">{todaySales.count} Transactions</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-green-600">{formatCurrency(todaySales.total)}</div>
                        </div>
                    </div>
                </div>

                {/* Customer Select Slot */}
                {customerSlot && (
                    <div className="px-3 pt-3 md:px-4">
                        {customerSlot}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="px-3 py-3 md:px-4 grid grid-cols-3 gap-2.5 border-b border-slate-100">
                    <button
                        onClick={onHoldBill}
                        disabled={items.length === 0}
                        className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Hold Bill (F4)"
                    >
                        <Pause size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-tight">Hold (F4)</span>
                    </button>
                    <button
                        onClick={onShowHeldBills}
                        className="relative flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95 group"
                        title="Retrieve Bills (F5)"
                    >
                        <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-tight">Open (F5)</span>
                        {heldBillsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-4.5 px-1 text-[9px] font-black flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                                {heldBillsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={onReprintLastInvoice}
                        disabled={!canReprint}
                        className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Reprint Last Invoice"
                    >
                        <RotateCcw size={16} className="group-hover:-rotate-45 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-tight">Print</span>
                    </button>
                </div>

                {/* Active Cart Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-1.5">
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Active Cart</h2>
                    {items.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold group"
                            onClick={onClearCart}
                        >
                            <Trash2 size={16} className="mr-2 group-hover:animate-bounce" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 pointer-events-none opacity-50">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <ShoppingCart size={36} />
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest">Cart Empty</p>
                        <p className="text-[9px] font-bold mt-1">SCAN PRODUCTS TO START</p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-3">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group flex flex-col p-2.5 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all relative"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1 pr-1.5">
                                        <h4 className="font-black text-slate-800 text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
                                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                            <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{formatCurrency(item.price)}</span>
                                            <span className="text-[8px] font-bold text-slate-400">#item-{item.id.slice(-4)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        <X size={12} />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 gap-0.5 shadow-inner">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-md text-slate-500 hover:text-primary transition-colors"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus size={12} />
                                        </Button>
                                        <span className="w-6 text-center text-xs font-black text-slate-700">{item.quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-md text-slate-500 hover:text-primary transition-colors"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={12} />
                                        </Button>
                                    </div>
                                    <div className="text-right min-w-[50px]">
                                        <div className="text-sm font-black text-slate-800">{formatCurrency(item.price * item.quantity)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="flex-none p-3.5 bg-slate-50 border-t border-slate-100 rounded-t-[26px] shadow-[0_-8px_25px_rgba(0,0,0,0.04)] z-10">
                <div className="space-y-1 mb-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Subtotal ({itemCount} items)</span>
                        <span className="text-slate-600 font-black">{formatCurrency(subtotal)}</span>
                    </div>
                    {tax > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Tax</span>
                            <span className="text-slate-600 font-black">{formatCurrency(tax)}</span>
                        </div>
                    )}
                    <div className="h-px bg-slate-200/50 w-full" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                        <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
                    </div>
                </div>

                <button
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                    onClick={onProcessPayment}
                    disabled={items.length === 0}
                >
                    <div className="w-6.5 h-6.5 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard size={16} />
                    </div>
                    Process Payment (F9)
                </button>
            </div>
        </div>
    );
};
