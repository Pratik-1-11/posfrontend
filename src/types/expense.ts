export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod?: string;
    receiptUrl?: string;
}
