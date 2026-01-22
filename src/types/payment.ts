import type { CartItem } from './sales';

export type PaymentMethod = 'cash' | 'credit_card' | 'fonepay' | 'esewa' | 'credit' | 'mixed';

export interface PaymentDetails {
    method: PaymentMethod;
    amount: number;
    timestamp: Date;
}

export interface Invoice {
    invoiceNumber: string;
    items: CartItem[];
    date: Date;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: PaymentMethod;
}
