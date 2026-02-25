import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, PlayCircle, ShieldCheck } from 'lucide-react';
import { useShift } from '@/context/ShiftContext';
import { managerApi } from '@/services/api/managerApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OpenShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({ isOpen, onClose }) => {
    const [startCash, setStartCash] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [pin, setPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { openShift } = useShift();
    const { user } = useAuth();
    const { toast } = useToast();

    const isManager = user && ['VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(user.role);

    const handleOpen = async () => {
        const cash = parseFloat(startCash) || 0;
        try {
            setIsSubmitting(true);

            // If not a manager, require manager PIN for shift opening (compliance)
            if (!isManager) {
                if (!pin) {
                    toast({ title: "Authorization Required", description: "Manager PIN is required to open shift", variant: "destructive" });
                    return;
                }
                await managerApi.verifyPin(pin);
            }

            await openShift(cash, notes);
            setStartCash('');
            setNotes('');
            setPin('');
            onClose();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Shift Opening Failed",
                description: error.message || "Invalid credentials or system error",
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
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={startCash}
                            onChange={(e) => {
                                // Allow only numbers and decimal point
                                const val = e.target.value;
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setStartCash(val);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && startCash) {
                                    handleOpen();
                                }
                            }}
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

                    {!isManager && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                MANAGER PIN REQUIRED
                            </label>
                            <Input
                                type="password"
                                placeholder="Enter Manager PIN"
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
