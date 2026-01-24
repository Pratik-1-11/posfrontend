import React, { useState } from 'react';
import {
    Search,
    RefreshCw,
    Package,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/services/api/orderApi';
import { returnApi } from '@/services/api/returnApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const ReturnsScreen: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchInvoice, setSearchInvoice] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [returnReason, setReturnReason] = useState('');
    const [itemsToReturn, setItemsToReturn] = useState<Record<string, { quantity: number; refund_amount: number }>>({});
    const [viewMode, setViewMode] = useState<'create' | 'list'>('list');

    // Queries
    const { data: returns = [], isLoading: returnsLoading } = useQuery({
        queryKey: ['returns-list'],
        queryFn: () => returnApi.getAll(),
        enabled: viewMode === 'list'
    });

    const { data: orderDetails, isLoading: orderLoading, error: orderError } = useQuery({
        queryKey: ['order-details', selectedOrderId],
        queryFn: () => orderApi.getOne(selectedOrderId!),
        enabled: !!selectedOrderId
    });

    // Mutations
    const processReturnMutation = useMutation({
        mutationFn: (data: any) => returnApi.create(data),
        onSuccess: () => {
            toast({
                title: "Return Processed Successfully",
                description: "The product has been restocked and refund recorded.",
            });
            queryClient.invalidateQueries({ queryKey: ['returns-list'] });
            queryClient.invalidateQueries({ queryKey: ['report-sales'] });
            setViewMode('list');
            setSelectedOrderId(null);
            setItemsToReturn({});
            setReturnReason('');
        },
        onError: (error: any) => {
            toast({
                title: "Return Failed",
                description: error.message || "Could not process return",
                variant: "destructive"
            });
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInvoice.trim()) return;
        setSelectedOrderId(searchInvoice);
    };

    const toggleItem = (item: any) => {
        const itemId = item.product_id;
        if (itemsToReturn[itemId]) {
            const newItems = { ...itemsToReturn };
            delete newItems[itemId];
            setItemsToReturn(newItems);
        } else {
            setItemsToReturn({
                ...itemsToReturn,
                [itemId]: {
                    quantity: 1,
                    refund_amount: Number(item.unit_price)
                }
            });
        }
    };

    const updateReturnQuantity = (item: any, qty: number) => {
        if (qty < 1 || qty > item.quantity) return;
        setItemsToReturn({
            ...itemsToReturn,
            [item.product_id]: {
                quantity: qty,
                refund_amount: Number(item.unit_price) * qty
            }
        });
    };

    const calculateTotalRefund = () => {
        return Object.values(itemsToReturn).reduce((sum, item) => sum + item.refund_amount, 0);
    };

    const handleSubmitReturn = () => {
        if (Object.keys(itemsToReturn).length === 0) {
            toast({ title: "Validation Error", description: "Select at least one item to return", variant: "destructive" });
            return;
        }

        const payload = {
            saleId: selectedOrderId!,
            reason: returnReason,
            items: Object.entries(itemsToReturn).map(([productId, data]) => ({
                product_id: productId,
                quantity: data.quantity,
                refund_amount: data.refund_amount
            }))
        };

        processReturnMutation.mutate(payload);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Product Returns</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide">Manage customer returns and inventory restocks.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        onClick={() => setViewMode('list')}
                        className="font-bold uppercase tracking-wider text-xs"
                    >
                        Past Returns
                    </Button>
                    <Button
                        variant={viewMode === 'create' ? 'default' : 'outline'}
                        onClick={() => {
                            setViewMode('create');
                            setSelectedOrderId(null);
                        }}
                        className="font-bold uppercase tracking-wider text-xs"
                    >
                        Process New Return
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <RefreshCw className="text-primary" size={24} />
                            Recent Returns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {returnsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : returns.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Date</th>
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Original Invoice</th>
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Customer</th>
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Reason</th>
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Refund Amount</th>
                                            <th className="p-4 text-xs font-black uppercase text-slate-500 tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returns.map((ret: any) => (
                                            <tr key={ret.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                                                <td className="p-4 font-bold text-sm">{format(new Date(ret.created_at), 'PPP')}</td>
                                                <td className="p-4 font-black text-xs text-primary">{ret.sales?.invoice_number || 'N/A'}</td>
                                                <td className="p-4 font-bold text-sm text-slate-600">{ret.sales?.customer_name || 'Walk-in'}</td>
                                                <td className="p-4 font-medium text-xs text-slate-500">
                                                    <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200 uppercase tracking-tighter font-black text-[10px]">
                                                        {ret.reason || 'No Reason'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-black text-sm text-right text-emerald-600">Rs.{Number(ret.total_refund_amount).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase">Details</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                <RefreshCw className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest italic">No return history found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Search & Selection */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <div className="h-2 bg-primary w-full" />
                            <CardHeader>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Find Transaction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enter Order ID / Invoice</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                placeholder="e.g. 550e8400-e29b-..."
                                                value={searchInvoice}
                                                onChange={(e) => setSearchInvoice(e.target.value)}
                                                className="pl-10 font-bold border-slate-200 focus:ring-primary h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={orderLoading} className="w-full h-12 font-black uppercase tracking-widest shadow-lg shadow-black/5 hover:scale-[1.02] transition-transform">
                                        {orderLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Fetch Details'}
                                    </Button>
                                </form>

                                {orderError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                                        <AlertCircle size={20} />
                                        <p className="text-xs font-bold">Transaction not found. Please verify the ID.</p>
                                    </div>
                                )}

                                {orderDetails && (
                                    <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order Status</span>
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                                                {orderDetails.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm"><User size={16} className="text-slate-400" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Customer</p>
                                                    <p className="text-sm font-black">{orderDetails.customer_name || 'Walk-in'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm"><Calendar size={16} className="text-slate-400" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Date</p>
                                                    <p className="text-sm font-black">{format(new Date(orderDetails.created_at), 'PPP')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="p-2 bg-white rounded-lg shadow-sm"><Package size={16} className="text-slate-400" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Purchase</p>
                                                    <p className="text-lg font-black text-primary">Rs.{Number(orderDetails.total_amount).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl bg-white min-h-[400px]">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Select Items to Return</CardTitle>
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                    {orderDetails?.sale_items?.length || 0} Items Total
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!orderDetails ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                        <Package size={64} className="mb-4 opacity-20" />
                                        <p className="text-sm font-black uppercase tracking-widest italic opacity-50">Select a transaction to see items.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orderDetails.sale_items.map((item: any) => {
                                            const isSelected = !!itemsToReturn[item.product_id];
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "group p-4 rounded-2xl border-2 transition-all duration-300",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-slate-100 hover:border-slate-200 bg-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            onClick={() => toggleItem(item)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                                                                isSelected ? "bg-primary border-primary" : "border-slate-300 hover:border-slate-400"
                                                            )}
                                                        >
                                                            {isSelected && <CheckCircle2 size={16} className="text-white" />}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h4 className="font-black text-slate-800 uppercase tracking-tight">{item.product_name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Qty: {item.quantity}</span>
                                                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">Rs.{Number(item.unit_price).toLocaleString()} / unit</span>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-primary/20 shadow-inner animate-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={() => updateReturnQuantity(item, itemsToReturn[item.product_id].quantity - 1)}
                                                                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-black transition-colors"
                                                                >-</button>
                                                                <span className="text-sm font-black w-8 text-center">{itemsToReturn[item.product_id].quantity}</span>
                                                                <button
                                                                    onClick={() => updateReturnQuantity(item, itemsToReturn[item.product_id].quantity + 1)}
                                                                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-900 font-black transition-colors"
                                                                >+</button>
                                                            </div>
                                                        )}

                                                        <div className="text-right ml-4">
                                                            <p className="text-[10px] font-black uppercase text-slate-400">Refund</p>
                                                            <p className={cn("text-base font-black", isSelected ? "text-primary" : "text-slate-300")}>
                                                                Rs.{(isSelected ? itemsToReturn[item.product_id].refund_amount : Number(item.unit_price)).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white shadow-2xl shadow-primary/20 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-white/50 tracking-widest">Reason for Return</label>
                                                <Input
                                                    placeholder="Damaged, Wrong item, etc."
                                                    value={returnReason}
                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-12 focus:ring-primary font-bold"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Total Refund Due</p>
                                                    <h2 className="text-3xl font-black text-emerald-400">Rs.{calculateTotalRefund().toLocaleString()}</h2>
                                                </div>
                                                <Button
                                                    onClick={handleSubmitReturn}
                                                    disabled={processReturnMutation.isPending || calculateTotalRefund() === 0}
                                                    className="bg-primary hover:bg-primary-dark h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 border-b-4 border-black/20"
                                                >
                                                    {processReturnMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirm Return'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnsScreen;
