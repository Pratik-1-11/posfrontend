import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ExpenseFiltersProps {
    searchTerm: string;
    filter: string;
    onSearchChange: (value: string) => void;
    onFilterChange: (value: string) => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
    searchTerm,
    filter,
    onSearchChange,
    onFilterChange
}) => {
    return (
        <div className="stat-card">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="input-group flex-1">
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="input"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div style={{ minWidth: '200px' }}>
                    <div className="input-group">
                        <Filter size={16} color="#9ca3af" className="mr-2" />
                        <select
                            className="select"
                            value={filter}
                            onChange={(e) => onFilterChange(e.target.value)}
                        >
                            <option value="all">All Expenses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
