import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/db';
import type { ReactNode } from 'react';
import type { Product } from '@/types/product';
import { productApi } from '@/services/api/productApi';
import { batchApi, type ProductBatch } from '@/services/api/batchApi';

type ProductContextType = {
  products: Product[];
  batches: ProductBatch[];
  loading: boolean;
  refresh: () => void;
  refreshProducts: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (productId: string, data: { quantity: number; type: 'in' | 'out' | 'adjustment'; reason: string; branchId: string }) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_QUERY_KEY = ['products'];
const BATCHES_QUERY_KEY = ['batches'];

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const savedUser = localStorage.getItem('pos_user');
  const tenantId = savedUser ? JSON.parse(savedUser).tenant?.id || '' : '';

  const [currentBranchId, setCurrentBranchId] = useState<string | undefined>(
    localStorage.getItem('pos_current_branch_id') || undefined
  );

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery<Product[]>({
    queryKey: ['products', currentBranchId],
    queryFn: () => productApi.getAll(currentBranchId),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: batchesData,
    isLoading: batchesLoading,
  } = useQuery({
    queryKey: BATCHES_QUERY_KEY,
    queryFn: () => batchApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const batches = batchesData?.data?.batches || [];

  // Listen for branch changes
  useEffect(() => {
    const handleBranchChange = (e: any) => {
      const branchId = e.detail?.id;
      if (branchId) {
        setCurrentBranchId(branchId);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    };

    window.addEventListener('pos_branch_changed', handleBranchChange);
    return () => window.removeEventListener('pos_branch_changed', handleBranchChange);
  }, [queryClient]);

  // Optimized Background Sync to Dexie
  useEffect(() => {
    if (products.length > 0) {
      const sync = async () => {
        try {
          await db.products.bulkPut(products.map(p => ({
            id: p.id,
            name: p.name,
            barcode: p.barcode,
            price: p.price,
            selling_price: p.price,
            stock_quantity: p.stock,
            tenant_id: tenantId,
            last_fetched_at: Date.now()
          })));
        } catch (err) {
          console.error('Dexie Product sync failed:', err);
        }
      };
      sync();
    }
  }, [products, tenantId]);

  useEffect(() => {
    if (batches.length > 0) {
      const sync = async () => {
        try {
          await db.productBatches.bulkPut(batches.map(b => ({
            id: b.id,
            product_id: b.product_id,
            batch_number: b.batch_number,
            cost_price: b.cost_price,
            selling_price: b.selling_price,
            quantity_remaining: b.quantity_remaining,
            expiry_date: b.expiry_date,
            tenant_id: tenantId
          })));
        } catch (err) {
          console.error('Dexie Batch sync failed:', err);
        }
      };
      sync();
    }
  }, [batches, tenantId]);

  const getProductById = (id: string) => {
    return products.find((p: Product) => p.id === id);
  };

  const addProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      productApi.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ['product', id] });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) => productApi.updateStock(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
  };

  const value = {
    products,
    batches,
    loading: productsLoading || batchesLoading,
    refresh: refreshProducts,
    refreshProducts,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: (id: string, updates: Partial<Product>) =>
      updateProductMutation.mutateAsync({ id, updates }),
    deleteProduct: deleteProductMutation.mutateAsync,
    updateStock: (productId: string, data: { quantity: number; type: 'in' | 'out' | 'adjustment'; reason: string; branchId: string }) =>
      updateStockMutation.mutateAsync({ productId, data }),
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
