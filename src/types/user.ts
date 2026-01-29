export type Role =
    | "SUPER_ADMIN"
    | "VENDOR_ADMIN"
    | "VENDOR_MANAGER"
    | "CASHIER"
    | "INVENTORY_MANAGER"
    | "WAITER"

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
