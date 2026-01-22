import React, { createContext, useContext } from 'react';
import type { TenantWithStats } from '@/services/api/superAdminApi';

interface TenantContextType {
    tenant: TenantWithStats | null;
    refresh: () => void;
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{
    tenant: TenantWithStats | null;
    refresh: () => void;
    loading: boolean;
    children: React.ReactNode
}> = ({ tenant, refresh, loading, children }) => {
    return (
        <TenantContext.Provider value={{ tenant, refresh, loading }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenantContext = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenantContext must be used within a TenantProvider');
    }
    return context;
};
