import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Power, Calculator, AlertCircle } from 'lucide-react';
import { useShift } from '@/context/ShiftContext';

interface CloseShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({ isOpen, onClose }) => {
    const [actualCash, setActualCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { closeShift } = useShift();

    const handleClose = async () => {
        const cash = parseFloat(actualCash) || 0;
        try {
            setIsSubmitting(true);
            await closeShift(cash, notes);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <Power className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Close Shift Session</DialogTitle>
                    </div>
                    <DialogDescription>
                        Count all cash in the drawer and enter the total below. This will conclude your session and generate a Z-Report.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700">
                            Ensure all pending bills are cleared or held before closing. System will calculate the reconciliation difference automatically.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Actual Cash in Drawer (Rs.)
                        </label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={actualCash}
                            onChange={(e) => setActualCash(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Closing Notes (Optional)
                        </label>
                        <textarea
                            className="w-full min-h-[80px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                            placeholder="Discrepancies, handover notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Keep Open
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleClose}
                        disabled={isSubmitting || !actualCash}
                        className="gap-2"
                    >
                        {isSubmitting ? 'Closing...' : 'Confirm & Close Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
