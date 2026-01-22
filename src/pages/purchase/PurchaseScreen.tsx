import React, { useState } from 'react';
import { usePurchaseContext } from '@/context/PurchaseContext';
import { Plus, Search, Filter, Trash2, Edit2, Package, Truck, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { PurchaseForm } from './components/PurchaseForm';
import type { Purchase } from './types';

export const PurchaseScreen: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { purchases, loading: isLoading, addPurchase, updatePurchase, deletePurchase } = usePurchaseContext();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleAddPurchase = () => {
    setSelectedPurchase(null);
    setIsModalOpen(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleDeletePurchase = async (id: string) => {
    // Custom styled confirm could be better but sticking to logic
    if (window.confirm('Permanently remove this purchase record?')) {
      try {
        await deletePurchase(id);
        toast({
          title: 'Entry Deleted',
          description: 'The purchase record has been removed from the system.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete purchase record.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmitPurchase = async (purchase: Omit<Purchase, 'id'>) => {
    try {
      if (selectedPurchase) {
        await updatePurchase(selectedPurchase.id, purchase);
        toast({ title: 'Success', description: 'Transaction updated successfully' });
      } else {
        await addPurchase(purchase);
        toast({ title: 'Success', description: 'New purchase record added' });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save purchase record.',
        variant: 'destructive',
      });
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || purchase.status === filter;
    return matchesSearch && matchesFilter;
  });

  const StatusBadge = ({ status }: { status: Purchase['status'] }) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      cancelled: 'destructive',
    } as const;
    return <Badge variant={variants[status]} className="capitalize font-bold">{status}</Badge>;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Purchase Management</h1>
          <p className="text-muted-foreground font-medium">Record and track inventory restocks from suppliers.</p>
        </div>
        <Button onClick={handleAddPurchase} size="lg" className="px-8 font-black shadow-xl shadow-primary/20 gap-2 h-12">
          <Plus className="w-5 h-5" />
          Add Purchase Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Active Entries</p>
              <h3 className="text-2xl font-black">{purchases.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Truck className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Suppliers</p>
              <h3 className="text-2xl font-black">{new Set(purchases.map(p => p.supplierName)).size}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><DollarSign className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Value</p>
              <h3 className="text-2xl font-black">
                Rs.{purchases.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0).toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardHeader className="border-b p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Product, SKU or Supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus:ring-primary/20 font-medium"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[220px] h-11 font-bold">
                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-semibold">All Transactions</SelectItem>
                <SelectItem value="pending" className="font-semibold text-amber-600">Pending Approval</SelectItem>
                <SelectItem value="completed" className="font-semibold text-green-600">Completed Records</SelectItem>
                <SelectItem value="cancelled" className="font-semibold text-red-600">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-black text-slate-900 py-5">Inventory Product</TableHead>
                  <TableHead className="font-black text-slate-900">SKU / Code</TableHead>
                  <TableHead className="font-black text-slate-900">Supplier</TableHead>
                  <TableHead className="text-right font-black text-slate-900">Qty</TableHead>
                  <TableHead className="text-right font-black text-slate-900">Net Cost</TableHead>
                  <TableHead className="font-black text-slate-900">Entry Date</TableHead>
                  <TableHead className="font-black text-slate-900">Status</TableHead>
                  <TableHead className="text-right font-black text-slate-900 pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-20 font-bold text-slate-400">Syncing with Warehouse...</TableCell></TableRow>
                ) : filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id} className="group hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Package size={14} /></div>
                          <span className="font-bold text-slate-700">{purchase.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-400">{purchase.sku || '---'}</TableCell>
                      <TableCell className="font-semibold text-slate-600">{purchase.supplierName}</TableCell>
                      <TableCell className="text-right font-black text-slate-900">{purchase.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-slate-900">Rs.{(purchase.quantity * purchase.unitPrice).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400">@ Rs.{purchase.unitPrice} / unit</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-500">{new Date(purchase.purchaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell><StatusBadge status={purchase.status} /></TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditPurchase(purchase)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeletePurchase(purchase.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-24">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200"><Package size={32} /></div>
                        <p className="font-bold text-slate-400">No purchase records found</p>
                        <Button variant="link" onClick={handleAddPurchase} className="font-bold text-primary">Add your first transaction record <ArrowRight className="ml-2 w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{selectedPurchase ? 'Edit Transaction' : 'New Purchase Entry'}</DialogTitle>
            <DialogDescription className="font-medium">
              Maintain accurate records for financial tracking and inventory management.
            </DialogDescription>
          </DialogHeader>
          <PurchaseForm
            purchase={selectedPurchase || undefined}
            onSubmit={handleSubmitPurchase}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseScreen;
