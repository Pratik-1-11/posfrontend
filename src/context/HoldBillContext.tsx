import React, { createContext, useContext, useState, useCallback } from 'react';

interface HeldBill {
    id: string;
    items: any[]; // CartItem[]
    timestamp: Date;
    note?: string;
}

interface HoldBillContextType {
    heldBills: HeldBill[];
    holdCurrentBill: (items: any[], note?: string) => string;
    retrieveBill: (id: string) => HeldBill | null;
    deleteBill: (id: string) => void;
    clearOldBills: (hoursOld: number) => void;
}

const HoldBillContext = createContext<HoldBillContextType | undefined>(undefined);

export const HoldBillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
        const saved = localStorage.getItem('held_bills');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            return parsed.map((bill: any) => ({
                ...bill,
                timestamp: new Date(bill.timestamp)
            }));
        }
        return [];
    });

    // Save to localStorage whenever heldBills changes
    React.useEffect(() => {
        localStorage.setItem('held_bills', JSON.stringify(heldBills));
    }, [heldBills]);

    const holdCurrentBill = useCallback((items: any[], note?: string): string => {
        const id = `HELD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newBill: HeldBill = {
            id,
            items: [...items],
            timestamp: new Date(),
            note
        };

        setHeldBills(prev => [...prev, newBill]);
        return id;
    }, []);

    const retrieveBill = useCallback((id: string): HeldBill | null => {
        const bill = heldBills.find(b => b.id === id);
        if (bill) {
            // Remove the bill from held bills after retrieval
            setHeldBills(prev => prev.filter(b => b.id !== id));
            return bill;
        }
        return null;
    }, [heldBills]);

    const deleteBill = useCallback((id: string) => {
        setHeldBills(prev => prev.filter(b => b.id !== id));
    }, []);

    const clearOldBills = useCallback((hoursOld: number = 24) => {
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
        setHeldBills(prev => prev.filter(bill => bill.timestamp > cutoffTime));
    }, []);

    return (
        <HoldBillContext.Provider value={{
            heldBills,
            holdCurrentBill,
            retrieveBill,
            deleteBill,
            clearOldBills
        }}>
            {children}
        </HoldBillContext.Provider>
    );
};

export const useHoldBill = () => {
    const context = useContext(HoldBillContext);
    if (context === undefined) {
        throw new Error('useHoldBill must be used within a HoldBillProvider');
    }
    return context;
};
