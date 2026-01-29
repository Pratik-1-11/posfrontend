// Role-based permission utilities
import type { Role } from '../types/user';

export const isSuperAdmin = (role?: Role | string): boolean => {
    return role === 'SUPER_ADMIN';
};

export const isVendorAdmin = (role?: Role | string): boolean => {
    return role === 'VENDOR_ADMIN' || isSuperAdmin(role);
};

export const isManager = (role?: Role | string): boolean => {
    return role === 'VENDOR_MANAGER' || isVendorAdmin(role);
};

export const isStaff = (role?: Role | string): boolean => {
    return ['CASHIER', 'WAITER', 'INVENTORY_MANAGER'].includes(role as string) || isManager(role);
};

// Specific permission checks
export const canViewReports = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(role as string);
};

export const canManageInventory = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER'].includes(role as string);
};

export const canManageEmployees = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(role as string);
};

export const canAccessDashboard = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER'].includes(role as string);
};

export const canAccessPos = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER', 'WAITER'].includes(role as string);
};

export const canManageSettings = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(role as string);
};

export const canManageStores = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(role as string);
};

// Additional granular permissions
export const canVoidSales = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(role as string);
};

export const canViewProfitMargins = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(role as string);
};

export const canManageExpenses = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(role as string);
};

export const canViewCreditRecovery = (role?: Role | string): boolean => {
    return ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(role as string);
};

// Legacy compatibility - keeping for gradual migration
export const isAdmin = isVendorAdmin;
