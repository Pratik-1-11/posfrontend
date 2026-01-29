import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { shiftApi, type Shift } from '@/services/api/shiftApi';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ShiftContextType {
    currentShift: Shift | null;
    isLoading: boolean;
    openShift: (startCash: number, notes?: string) => Promise<void>;
    closeShift: (actualCash: number, notes?: string) => Promise<void>;
    refreshShift: () => Promise<void>;
    isShiftOpen: boolean;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentShift, setCurrentShift] = useState<Shift | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const refreshShift = useCallback(async () => {
        if (!user) {
            setCurrentShift(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const shift = await shiftApi.getCurrent();
            setCurrentShift(shift);
        } catch (error) {
            console.error('Failed to fetch current shift:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshShift();
    }, [refreshShift]);

    const handleOpenShift = async (startCash: number, notes?: string) => {
        try {
            const newShift = await shiftApi.open({ startCash, notes });
            setCurrentShift(newShift);
            toast({
                title: "Shift Opened",
                description: `Shift started with Rs.${startCash.toLocaleString()}`,
            });
        } catch (error: any) {
            toast({
                title: "Opening Failed",
                description: error.message || "Could not open shift",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleCloseShift = async (actualCash: number, notes?: string) => {
        if (!currentShift) return;

        try {
            const result = await shiftApi.close(currentShift.id, { actualCash, notes });
            setCurrentShift(null);
            toast({
                title: "Shift Closed",
                description: `Shift ended. Reconciliation: ${result.data.difference >= 0 ? '+' : ''}Rs.${result.data.difference.toLocaleString()}`,
            });
        } catch (error: any) {
            toast({
                title: "Closing Failed",
                description: error.message || "Could not close shift",
                variant: "destructive"
            });
            throw error;
        }
    };

    return (
        <ShiftContext.Provider value={{
            currentShift,
            isLoading,
            openShift: handleOpenShift,
            closeShift: handleCloseShift,
            refreshShift,
            isShiftOpen: !!currentShift
        }}>
            {children}
        </ShiftContext.Provider>
    );
};

export const useShift = () => {
    const context = useContext(ShiftContext);
    if (context === undefined) {
        throw new Error('useShift must be used within a ShiftProvider');
    }
    return context;
};
