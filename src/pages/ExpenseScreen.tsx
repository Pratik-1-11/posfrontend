import React, { useState } from 'react';
import { Plus, Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Receipt, Edit, Trash2 } from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/utils/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useExpenseContext } from '@/context/ExpenseContext';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import type { Expense } from '@/types/expense';



export const ExpenseScreen: React.FC = () => {
  const { toast } = useToast();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || expense.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        toast({ title: 'Deleted', description: 'Expense deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete expense', variant: 'destructive' });
      }
    }
  };

  const handleSave = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, expenseData);
        toast({ title: 'Success', description: 'Expense updated successfully' });
      } else {
        await addExpense(expenseData);
        toast({ title: 'Success', description: 'Expense added successfully' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
      throw error;
    }
  };

  // Calculate statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthTotal = expenses
    .filter(e => new Date(e.date) >= startOfThisMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const lastMonthTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const percentageChange = lastMonthTotal === 0 ? (thisMonthTotal > 0 ? 100 : 0) : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

  const StatusBadge = ({ status }: { status: Expense['status'] }) => {
    const variant = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'destructive';
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    return <Badge variant="secondary" className="font-medium">{category}</Badge>;
  };



  const handleExport = (type: 'csv' | 'pdf') => {
    if (!filteredExpenses.length) {
      toast({ title: "No Data", description: "Nothing to export based on current filters" });
      return;
    }

    const filename = `Expense_Report_${format(new Date(), 'yyyy-MM-dd')}`;

    if (type === 'csv') {
      const csvData = filteredExpenses.map(e => ({
        Date: format(new Date(e.date), 'yyyy-MM-dd'),
        Description: e.description,
        Category: e.category,
        Amount: e.amount,
        Status: e.status
      }));
      exportToCSV(csvData, filename);
    } else {
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Status'];
      const rows = filteredExpenses.map(e => [
        format(new Date(e.date), 'yyyy-MM-dd'),
        e.description,
        e.category,
        e.amount.toFixed(2),
        e.status
      ]);
      exportToPDF(headers, rows, filename, 'Expense Report');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">Track and manage your business expenses effortlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-semibold">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreate} className="gap-2 shadow-lg shadow-primary/20 font-bold">
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <DollarSign size={20} />
              </div>
              <Badge variant="outline" className="font-semibold">Total</Badge>
            </div>
            <h3 className="text-2xl font-bold">Rs.{(totalAmount || 0).toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground mt-1">Across all filtered categories</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Calendar size={20} />
              </div>
              <Badge variant="outline" className="font-semibold">This Month</Badge>
            </div>
            <h3 className="text-2xl font-bold">Rs.{(thisMonthTotal || 0).toFixed(2)}</h3>
            <div className="flex items-center gap-1 mt-1">
              {percentageChange >= 0 ? <TrendingUp size={14} className="text-red-500" /> : <TrendingDown size={14} className="text-green-500" />}
              <span className={cn("text-xs font-bold", percentageChange >= 0 ? "text-red-500" : "text-green-500")}>
                {(Math.abs(percentageChange || 0)).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Receipt size={20} />
              </div>
              <Badge variant="success" className="font-bold">Approved</Badge>
            </div>
            <h3 className="text-2xl font-bold">Rs.{(approvedAmount || 0).toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{expenses.filter(e => e.status === 'approved').length} verified transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Calendar size={20} />
              </div>
              <Badge variant="warning" className="font-bold">Pending</Badge>
            </div>
            <h3 className="text-2xl font-bold">Rs.{(pendingAmount || 0).toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{expenses.filter(e => e.status === 'pending').length} awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="p-6 bg-white border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expenses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold text-black pl-6">Description</TableHead>
                <TableHead className="font-bold text-black">Category</TableHead>
                <TableHead className="font-bold text-black">Amount</TableHead>
                <TableHead className="font-bold text-black">Date</TableHead>
                <TableHead className="font-bold text-black">Status</TableHead>
                <TableHead className="font-bold text-black">Payment</TableHead>
                <TableHead className="text-right pr-6 font-bold text-black">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium pl-6">{expense.description}</TableCell>
                    <TableCell><CategoryBadge category={expense.category} /></TableCell>
                    <TableCell className="font-bold">Rs.{(expense.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell><StatusBadge status={expense.status} /></TableCell>
                    <TableCell className="text-muted-foreground font-medium">{expense.paymentMethod || '-'}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(expense)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(expense.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                    No expenses found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expense={selectedExpense}
        onSave={handleSave}
      />
    </div>
  );
};

export default ExpenseScreen;