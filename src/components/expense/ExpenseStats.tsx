import React from 'react';
import { DollarSign, Calendar, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

interface ExpenseStatsProps {
    totalAmount: number;
    thisMonthTotal: number;
    percentageChange: number;
    approvedAmount: number;
    approvedCount: number;
    pendingAmount: number;
    pendingCount: number;
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({
    totalAmount,
    thisMonthTotal,
    percentageChange,
    approvedAmount,
    approvedCount,
    pendingAmount,
    pendingCount
}) => {
    return (
        <div className="stats-grid">
            {/* Total Expenses */}
            <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                    <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                        <DollarSign size={24} color="#2563eb" />
                    </div>
                    <span className="stat-label">Total</span>
                </div>
                <h3 className="stat-value">${(totalAmount || 0).toFixed(2)}</h3>
                <p className="stat-label">All expenses</p>
            </div>

            {/* This Month */}
            <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                    <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
                        <Calendar size={24} color="#16a34a" />
                    </div>
                    <span className="stat-label">This Month</span>
                </div>
                <h3 className="stat-value">${(thisMonthTotal || 0).toFixed(2)}</h3>
                <div className="flex items-center gap-1 mt-1">
                    {percentageChange >= 0 ? (
                        <TrendingUp size={16} color="#ef4444" />
                    ) : (
                        <TrendingDown size={16} color="#22c55e" />
                    )}
                    <span
                        style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: percentageChange >= 0 ? '#ef4444' : '#22c55e'
                        }}
                    >
                        {(Math.abs(percentageChange || 0)).toFixed(1)}%
                    </span>
                    <span className="stat-label">vs last month</span>
                </div>
            </div>

            {/* Approved */}
            <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                    <div className="stat-icon" style={{ backgroundColor: '#f3e8ff' }}>
                        <Receipt size={24} color="#7e22ce" />
                    </div>
                    <span className="badge badge-success">Approved</span>
                </div>
                <h3 className="stat-value">${(approvedAmount || 0).toFixed(2)}</h3>
                <p className="stat-label">{approvedCount} transactions</p>
            </div>

            {/* Pending */}
            <div className="stat-card">
                <div className="flex items-center justify-between mb-3">
                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
                        <Calendar size={24} color="#d97706" />
                    </div>
                    <span className="badge badge-warning">Pending</span>
                </div>
                <h3 className="stat-value">${(pendingAmount || 0).toFixed(2)}</h3>
                <p className="stat-label">{pendingCount} transactions</p>
            </div>
        </div>
    );
};
