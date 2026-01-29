import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Tag } from 'lucide-react';
import { managerApi } from '@/services/api/managerApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PriceOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    originalPrice: number;
    onConfirm: (newPrice: number, reason: string, managerId: string) => void;
}

export const PriceOverrideModal: React.FC<PriceOverrideModalProps> = ({
    isOpen,
    onClose,
    itemName,
    originalPrice,
    onConfirm
}) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [newPrice, setNewPrice] = useState<string>(originalPrice.toString());
    const [reason, setReason] = useState('');
    const [pin, setPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isManager = user && ['VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(user.role);

    const handleConfirm = async () => {
        const priceNum = parseFloat(newPrice);

        if (isNaN(priceNum) || priceNum < 0) {
            toast({ title: "Invalid Price", variant: "destructive" });
            return;
        }

        if (!reason || reason.trim().length < 5) {
            toast({ title: "Reason Required", description: "Please provide a reason (min 5 chars)", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);

            let managerId = user?.id || '';

            // If not a manager, require manager PIN
            if (!isManager) {
                if (!pin) {
                    toast({ title: "Authentication Required", description: "Manager PIN is required for this action", variant: "destructive" });
                    return;
                }
                const manager = await managerApi.verifyPin(pin);
                managerId = manager.id;
            }

            onConfirm(priceNum, reason, managerId);
            onClose();

            toast({
                title: "Price Overridden",
                description: `Price for ${itemName} updated to Rs.${priceNum}`,
            });
        } catch (error: any) {
            toast({
                title: "Authorization Failed",
                description: error.message || "Invalid manager credentials",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Price Override Authorization</DialogTitle>
                    </div>
                    <DialogDescription>
                        Updating price for: <span className="font-bold text-slate-900">{itemName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Original (Rs.)
                            </label>
                            <Input value={originalPrice} disabled className="bg-slate-50" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Tag className="h-4 w-4 text-amber-600" />
                                New Price (Rs.)
                            </label>
                            <Input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Override Reason
                        </label>
                        <textarea
                            className="w-full min-h-[80px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                            placeholder="e.g., Bulk discount, damaged packaging, seasonal promo..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {!isManager && (
                        <div className="space-y-2 pt-2 border-t pt-4">
                            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                MANAGER PIN REQUIRED
                            </label>
                            <Input
                                type="password"
                                placeholder="Enter 4-digit Manager PIN"
                                value={pin}
                                maxLength={6}
                                onChange={(e) => setPin(e.target.value)}
                                className="text-center tracking-[0.5em] font-black text-xl h-12"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleConfirm}
                        disabled={isSubmitting || !newPrice || !reason}
                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                    >
                        {isSubmitting ? 'Verifying...' : 'Authorize Override'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
