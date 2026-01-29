import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/use-toast';
import {
    Package,
    Plus,
    Calendar,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { batchApi } from '@/services/api/batchApi';
import type { ProductBatch } from '@/services/api/batchApi';
import type { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface BatchManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess?: () => void;
}

export const BatchManagementModal: React.FC<BatchManagementModalProps> = ({
    isOpen,
    onClose,
    product,
    onSuccess
}) => {
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        batch_number: '',
        cost_price: 0,
        selling_price: 0,
        quantity_received: 0,
        manufacture_date: '',
        expiry_date: '',
    });

    const fetchBatches = async () => {
        if (!product) return;
        setIsLoading(true);
        try {
            const response = await batchApi.list(product.id);
            if (response.status === 'success') {
                setBatches(response.data.batches);
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && product) {
            fetchBatches();
            setFormData({
                batch_number: `BN - ${Date.now().toString().slice(-6)} `,
                cost_price: product.costPrice || 0,
                selling_price: product.price || 0,
                quantity_received: 0,
                manufacture_date: '',
                expiry_date: '',
            });
            setIsAddingMode(false);
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        try {
            setIsLoading(true);
            const response = await batchApi.create({
                ...formData,
                product_id: product.id,
            });

            if (response.status === 'success') {
                toast({
                    title: "Batch Created",
                    description: `Successfully added batch ${formData.batch_number} `,
                });
                setIsAddingMode(false);
                fetchBatches();
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create batch",
                variant: "destructive",
            }); 
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (batch: ProductBatch) => {
        const isExpired = batch.expiry_date && new Date(batch.expiry_date) < new Date();

        if (isExpired || batch.status === 'expired') {
            return <Badge variant="destructive" className="font-bold">EXPIRED</Badge>;
        }
        if (batch.quantity_remaining <= 0 || batch.status === 'depleted') {
            return <Badge variant="outline" className="text-slate-400">DEPLETED</Badge>;
        }
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600 font-bold">ACTIVE</Badge>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white rounded-3xl overflow-hidden border-none shadow-2xl p-0">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Package size={24} className="text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black uppercase italic tracking-tight">
                                Batch Management
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-bold text-sm">
                                {product?.name}
                            </DialogDescription>
                        </div>
                    </div>
                    {!isAddingMode && (
                        <Button
                            onClick={() => setIsAddingMode(true)}
                            className="bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest h-9 rounded-xl"
                        >
                            <Plus size={16} className="mr-1" /> New Batch
                        </Button>
                    )}
                </div>

                <div className="p-6">
                    {isAddingMode ? (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Batch Number</Label>
                                    <Input
                                        required
                                        value={formData.batch_number}
                                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                        placeholder="e.g. B-001"
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Qty Received</Label>
                                    <Input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.quantity_received}
                                        onChange={(e) => setFormData({ ...formData, quantity_received: parseInt(e.target.value) })}
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Cost Price (per unit)</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Selling Price (optional)</Label>
                                    <Input
                                        type="number"
                                        value={formData.selling_price}
                                        onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                                        className="rounded-xl border-slate-200"
                                        placeholder="Leave for default"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Mfg Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.manufacture_date}
                                        onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-slate-500">Expiry Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddingMode(false)}
                                    className="flex-1 rounded-xl font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 font-black uppercase tracking-widest"
                                >
                                    {isLoading ? 'Creating...' : 'Register Batch'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {batches.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <Package size={24} />
                                    </div>
                                    <p className="text-slate-400 font-bold">No batches found for this product.</p>
                                    <p className="text-slate-300 text-xs">Register your first batch to start tracking shipments.</p>
                                </div>
                            ) : (
                                batches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-900">#{batch.batch_number}</span>
                                                    {getStatusBadge(batch)}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase gap-1">
                                                        <Plus size={10} /> Recv: {batch.quantity_received}
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase gap-1">
                                                        <Clock size={10} /> Left: {batch.quantity_remaining}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-primary">Rs. {batch.cost_price} / unit</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Cost Price</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                <span className="text-xs font-bold text-slate-500">
                                                    Exp: <span className={cn(
                                                        "font-black",
                                                        batch.expiry_date && new Date(batch.expiry_date) < new Date() ? "text-red-500" : "text-slate-700"
                                                    )}>
                                                        {batch.expiry_date ? format(new Date(batch.expiry_date), 'MMM dd, yyyy') : 'No Date'}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg">
                                                    <AlertTriangle size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
