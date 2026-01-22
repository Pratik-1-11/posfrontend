import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import type { Purchase } from '../types';

interface PurchaseFormProps {
  purchase?: Purchase;
  onSubmit: (purchase: Omit<Purchase, 'id'>) => void;
  onCancel: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Purchase, 'id'>>(
    purchase || {
      productName: '',
      sku: '',
      supplierName: '',
      quantity: 1,
      unitPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    }
  );

  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(formData.quantity * formData.unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productName" className="font-bold">Product Name</Label>
          <Input
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Search or enter product name"
            className="font-semibold h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku" className="font-bold">SKU / Barcode</Label>
          <Input
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Automatic if empty"
            className="font-mono font-semibold h-11"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="supplierName" className="font-bold">Supplier Info</Label>
          <Input
            id="supplierName"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            placeholder="Legal name of the supplier"
            className="font-semibold h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="font-bold">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="font-bold h-11 text-blue-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice" className="font-bold">Unit Cost (NPR)</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={handleChange}
            className="font-bold h-11 text-green-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate" className="font-bold">Entry Date</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="font-semibold h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="font-bold">Transaction Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'pending' | 'completed' | 'cancelled') =>
              setFormData(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-full h-11 font-bold">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" className="font-semibold">Pending</SelectItem>
              <SelectItem value="completed" className="font-semibold">Completed</SelectItem>
              <SelectItem value="cancelled" className="font-semibold text-red-600">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total Amount</span>
          <p className="text-sm font-medium text-slate-500">Net payable to supplier</p>
        </div>
        <div className="text-3xl font-black text-primary">
          Rs.{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="flex gap-3 pt-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8 font-bold text-gray-500">
          Discard Changes
        </Button>
        <Button type="submit" className="px-10 font-black shadow-lg shadow-primary/20">
          {purchase ? 'Update Transaction' : 'Save Purchase Entry'}
        </Button>
      </div>
    </form>
  );
};
