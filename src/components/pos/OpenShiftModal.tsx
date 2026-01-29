import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, PlayCircle } from 'lucide-react';
import { useShift } from '@/context/ShiftContext';

interface OpenShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({ isOpen, onClose }) => {
    const [startCash, setStartCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { openShift } = useShift();

    const handleOpen = async () => {
        const cash = parseFloat(startCash) || 0;
        try {
            setIsSubmitting(true);
            await openShift(cash, notes);
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
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl">Open New Shift</DialogTitle>
                    </div>
                    <DialogDescription>
                        Enter the starting cash amount in the drawer to begin your session.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Starting Cash (Rs.)
                        </label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={startCash}
                            onChange={(e) => setStartCash(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Shift Notes (Optional)
                        </label>
                        <textarea
                            className="w-full min-h-[80px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="Any comments for the start of shift..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleOpen}
                        disabled={isSubmitting || !startCash}
                        className="gap-2"
                    >
                        {isSubmitting ? 'Starting...' : 'Start Shift Session'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
