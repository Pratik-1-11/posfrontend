export type Role = "admin" | "super_admin" | "super-admin" | "branch_admin" | "cashier" | "waiter" | "manager" | "inventory_manager" | "SUPER_ADMIN" | "VENDOR_ADMIN" | "vendor_admin" | "vendor_manager" | "VENDOR_MANAGER" | "CASHIER" | "INVENTORY_MANAGER"

export interface User {
    id: string
    name: string
    username: string
    email?: string
    role: Role
    password?: string
    tenant?: {
        id: string;
        name: string;
        subscription_status: string;
        subscription_end_date?: string;
        plan_interval?: string;
    }
    branchId?: string;
}
