import Dexie, { type Table } from 'dexie';

export interface Product {
    id: string;
    name: string;
    barcode?: string;
    price: number;
    stock: number;
    category?: string;
    tenant_id?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    loyalty_points?: number;
}

export interface OfflineSale {
    id?: number; // Auto-incrementing local ID
    data: any; // The full sale payload
    created_at: number; // Timestamp
    retry_count: number;
}

export class PosDatabase extends Dexie {
    products!: Table<Product>;
    customers!: Table<Customer>;
    offlineSales!: Table<OfflineSale>;

    constructor() {
        super('PosDatabase');
        this.version(1).stores({
            products: 'id, name, barcode, category', // Primary key and indexed props
            customers: 'id, name, phone',
            offlineSales: '++id, created_at'
        });
    }
}

export const db = new PosDatabase();
