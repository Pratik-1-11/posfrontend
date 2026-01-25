import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import type { Product } from '@/types/product';
import { apiClient } from '@/services/api/apiClient';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
    isOpen,
    onClose,
    product,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [adjustment, setAdjustment] = useState({
        quantity: 0,
        type: 'adjustment',
        reason: ''
    });

    const handleAction = async () => {
        if (!product) return;
        if (adjustment.quantity === 0) {
            alert("Quantity cannot be zero");
            return;
        }

        try {
            setLoading(true);
            const branchId = localStorage.getItem('pos_current_branch_id');
            if (!branchId) {
                alert("No branch selected. Please select a branch from the header.");
                return;
            }

            const res = await apiClient.post(`/api/products/${product.id}/adjust-stock`, {
                quantity: adjustment.quantity,
                type: adjustment.type,
                reason: adjustment.reason,
                branchId: branchId
            });

            if (res) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Adjustment failed", error);
            alert("Adjustment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Stock Adjustment: <span className="text-primary truncate max-w-[200px]">{product?.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <FiAlertCircle className="text-blue-500 mt-1" size={18} />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Current Stock: {product?.stock}</p>
                            <p className="text-xs text-blue-700">Adjustments will be logged in the history ledger.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Quantity Change</Label>
                            <Input
                                type="number"
                                placeholder="e.g. -5 or 10"
                                value={adjustment.quantity}
                                onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                                className="font-bold text-lg"
                            />
                            <p className="text-[10px] italic text-slate-500">Positive to add, Negative to remove</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Adjustment Type</Label>
                            <Select value={adjustment.type} onValueChange={(v) => setAdjustment(prev => ({ ...prev, type: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="adjustment">General Adjustment</SelectItem>
                                    <SelectItem value="damage">Damaged Goods</SelectItem>
                                    <SelectItem value="expired">Expired Stock</SelectItem>
                                    <SelectItem value="return">Customer Return</SelectItem>
                                    <SelectItem value="purchase">Manual Purchase In</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">Reason / Notes</Label>
                        <Input
                            placeholder="e.g. Monthly stock take discrepancy"
                            value={adjustment.reason}
                            onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                        />
                    </div>

                    <div className="pt-2">
                        <p className="text-sm font-black text-center p-3 bg-slate-900 text-white rounded-xl">
                            New Projected Stock: {(product?.stock || 0) + adjustment.quantity}
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleAction}
                        className="min-w-[120px]"
                        disabled={loading || adjustment.quantity === 0}
                    >
                        {loading ? <FiLoader className="animate-spin mr-2" /> : "Confirm Adjustment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
