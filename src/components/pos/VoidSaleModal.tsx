import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Lock } from 'lucide-react';
import { invoiceApi } from '@/services/api/invoiceApi';
import { useToast } from '@/hooks/use-toast';

interface VoidSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: string;
    invoiceNumber: string;
    totalAmount: number;
    onSuccess: () => void;
}

export const VoidSaleModal: React.FC<VoidSaleModalProps> = ({
    isOpen,
    onClose,
    saleId,
    invoiceNumber,
    totalAmount,
    onSuccess
}) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleVoid = async () => {
        if (reason.trim().length < 10) {
            toast({
                title: "Validation Error",
                description: "Reason must be at least 10 characters long.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await invoiceApi.voidSale(saleId, { reason });

            toast({
                title: "Sale Voided",
                description: `Invoice ${invoiceNumber} has been voided and stock restored.`,
                variant: "default", // Success
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Void error:", error);
            toast({
                title: "Void Failed",
                description: error.response?.data?.message || "Failed to void sale. Check permissions.",
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
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Void Sale {invoiceNumber}</DialogTitle>
                    </div>
                    <DialogDescription>
                        This action is <strong>irreversible</strong>.
                        <div className="mt-2 text-sm font-semibold text-slate-800">
                            Transaction Value: Rs.{totalAmount.toLocaleString()}
                        </div>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                            <li>Status will change to VOIDED</li>
                            <li>Stock quantities will be restored</li>
                            <li>Sales revenue will be deducted</li>
                            <li>Action will be logged in audit trail</li>
                        </ul>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Reason for Voiding <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive text-sm"
                            placeholder="Enter detailed reason (e.g. Customer returned items immediately, Wrong entry by cashier...)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <p className="text-xs text-right text-slate-400">
                            {reason.length}/10 chars minimum
                        </p>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500">
                            This action requires Manager or Admin privileges.
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleVoid}
                        disabled={isSubmitting || reason.trim().length < 10}
                        className="gap-2"
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Void Sale'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
