export type Customer = {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    currentBalance: number; // Receivable
    totalPurchases: number;
    totalCredit: number; // Added to match API
    creditLimit: number;
    isActive: boolean;
    createdDate: Date;
    lastPurchaseDate?: Date;
};

export type CreditSale = {
    id: string;
    customerId: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'pending' | 'partial' | 'paid';
    dueDate: Date;
    createdDate: Date;
    items?: string; // Serialized items for now
};

export type CreditPayment = {
    id: string;
    customerId: string;
    creditSaleId: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
    reference?: string;
    createdDate: Date;
    notes?: string;
};

export type TransactionType = 'opening_balance' | 'sale' | 'payment' | 'refund' | 'adjustment';

export type CustomerTransaction = {
    id: string;
    customerId: string;
    type: TransactionType;
    amount: number;
    description: string;
    referenceId?: string;
    createdAt: string;
    performedBy?: string;
};

export type CustomerHistory = {
    id: string;
    customerId: string;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    changedBy?: string;
    changedAt: string;
};
