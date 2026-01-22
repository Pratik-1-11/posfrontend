export interface Purchase {
  id: string;
  productName: string;
  sku: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string; // ISO date string
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expiryDate?: string; // ISO date string
  batchNumber?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseFilterOptions {
  status?: 'all' | 'pending' | 'completed' | 'cancelled';
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface PurchaseSummary {
  totalPurchases: number;
  totalAmount: number;
  pendingPurchases: number;
  completedPurchases: number;
  cancelledPurchases: number;
}

export interface PurchaseFormData {
  productName: string;
  sku: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}
