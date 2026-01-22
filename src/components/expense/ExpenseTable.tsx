import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    paymentMethod?: string;
}

interface ExpenseTableProps {
    expenses: Expense[];
    onView: (expense: Expense) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
    expenses,
    onView,
    onEdit,
    onDelete
}) => {
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'status-badge status-approved';
            case 'pending': return 'status-badge status-pending';
            case 'rejected': return 'status-badge status-rejected';
            default: return 'status-badge';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'Office': { bg: '#dbeafe', text: '#1e40af' },
            'Food': { bg: '#dcfce7', text: '#166534' },
            'Software': { bg: '#f3e8ff', text: '#6b21a8' },
            'Utilities': { bg: '#ffedd5', text: '#9a3412' },
            'Marketing': { bg: '#fce7f3', text: '#9d174d' },
            'Travel': { bg: '#cffafe', text: '#155e75' },
        };
        return colors[category] || { bg: '#f3f4f6', text: '#374151' };
    };

    return (
        <div className="expense-table-container">
            <table className="expense-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.length > 0 ? (
                        expenses.map((expense) => {
                            const categoryColor = getCategoryColor(expense.category);
                            return (
                                <tr key={expense.id}>
                                    <td style={{ fontWeight: 500 }}>{expense.description}</td>
                                    <td>
                                        <span
                                            className="category-badge"
                                            style={{
                                                backgroundColor: categoryColor.bg,
                                                color: categoryColor.text
                                            }}
                                        >
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>${(expense.amount || 0).toFixed(2)}</td>
                                    <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(expense.status)}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td>{expense.paymentMethod || '-'}</td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button className="action-btn view" onClick={() => onView(expense)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="action-btn edit" onClick={() => onEdit(expense)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => onDelete(expense.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                No expenses found. Try adjusting your search or filter criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>);
};
