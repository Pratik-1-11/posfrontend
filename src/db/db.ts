import Dexie, { type Table } from 'dexie';

export interface Product {
    id: string;
    name: string;
    barcode?: string;
    price: number;
    selling_price?: number; // Added to match backend
    stock_quantity?: number; // Added to match backend
    category_id?: string;
    tenant_id: string;
    last_fetched_at: number;
}

export interface Category {
    id: string;
    name: string;
    tenant_id: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    loyalty_points?: number;
    tenant_id: string;
}

export interface OfflineSale {
    id?: number;
    idempotencyKey: string;
    payload: any;
    status: 'pending' | 'syncing' | 'failed' | 'completed';
    error?: string;
    retry_count: number;
    next_retry_time?: number;
    created_at: number;
}

export interface SyncState {
    key: string; // e.g., 'last_product_sync'
    value: any;
}

export class PosDatabase extends Dexie {
    products!: Table<Product>;
    categories!: Table<Category>;
    customers!: Table<Customer>;
    offlineSales!: Table<OfflineSale>;
    syncState!: Table<SyncState>;

    constructor() {
        super('PosDatabase');
        this.version(2).stores({
            products: 'id, name, barcode, category_id, tenant_id',
            categories: 'id, name, tenant_id',
            customers: 'id, name, phone, tenant_id',
            offlineSales: '++id, idempotencyKey, status, created_at, next_retry_time',
            syncState: 'key'
        });
    }
}

export const db = new PosDatabase();
