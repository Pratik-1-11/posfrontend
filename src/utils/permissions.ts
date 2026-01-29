// Role-based permission utilities

export const isSuperAdmin = (role?: string) => {
    const r = role?.toLowerCase();
    return r === 'super_admin' || r === 'super-admin' || r === 'superadmin';
};

export const isAdmin = (role?: string) => {
    const r = role?.toLowerCase();
    return r === 'admin' || isSuperAdmin(role) || r === 'vendor_admin';
};

export const isManager = (role?: string) => {
    const r = role?.toLowerCase();
    return isAdmin(role) || r === 'manager' || r === 'vendor_manager' || r === 'branch_admin';
};

export const isStaff = (role?: string) => {
    const r = role?.toLowerCase();
    return isManager(role) || r === 'cashier' || r === 'waiter' || r === 'inventory_manager';
};

export const canViewReports = (role?: string) => isManager(role);
export const canManageInventory = (role?: string) => isManager(role) || role?.toLowerCase() === 'inventory_manager';
export const canManageEmployees = (role?: string) => isAdmin(role) || role?.toLowerCase() === 'branch_admin';
export const canAccessDashboard = (role?: string) => isManager(role) || role?.toLowerCase() === 'inventory_manager';
export const canAccessPos = (role?: string) => isStaff(role);
export const canManageSettings = (role?: string) => isAdmin(role);
export const canManageStores = (role?: string) => isAdmin(role) || role?.toLowerCase() === 'branch_admin';
