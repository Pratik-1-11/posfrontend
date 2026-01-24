import { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/db/db';
import type { ReactNode } from 'react';
import type { Product } from '@/types/product';
import { productApi } from '@/services/api/productApi';

type ProductContextType = {
  products: Product[];
  loading: boolean;
  refresh: () => void;
  refreshProducts: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (items: { id: string; quantity: number }[]) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_QUERY_KEY = ['products'];

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // 1. Initial Load: Synchronous localStorage check for instant first-paint
  const initialProducts = (() => {
    try {
      const stored = localStorage.getItem('pos_products_cache');
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  })();

  const {
    data: products = initialProducts || [],
    isLoading,
  } = useQuery<Product[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: productApi.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  // 2. Optimized Background Sync
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (products.length > 0) {
      // Debounce the sync to avoid blocking the UI on rapid changes
      timeoutId = setTimeout(async () => {
        try {
          // Sync with LocalStorage for ultra-fast first-paint (small data only)
          if (products.length < 500) {
            localStorage.setItem('pos_products_cache', JSON.stringify(products));
          }

          // Sync to Dexie (Robust offline DB) - Use bulkPut to update instead of clear+bulkPut
          await db.products.clear();
          await db.products.bulkPut(products);
        } catch (err) {
          console.error('Background sync failed:', err);
        }
      }, 2000); // Wait 2 seconds of inactivity before syncing
    }

    return () => clearTimeout(timeoutId);
  }, [products]);

  const getProductById = (id: string) => {
    return (products as Product[]).find((p: Product) => p.id === id);
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
    mutationFn: productApi.updateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
  };

  const value = {
    products,
    loading: isLoading,
    refresh: refreshProducts,
    refreshProducts,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: (id: string, updates: Partial<Product>) =>
      updateProductMutation.mutateAsync({ id, updates }),
    deleteProduct: deleteProductMutation.mutateAsync,
    updateStock: updateStockMutation.mutateAsync,
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
