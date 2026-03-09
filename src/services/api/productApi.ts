import type { Product } from "@/types/product";
import { apiClient } from "./apiClient";
import { db } from "@/db/db";

type ListProductsResponse = {
  status: "success";
  data: {
    products: Product[];
  };
};

type ProductResponse = {
  status: "success";
  data: {
    product: Product;
  };
};

const mapProduct = (p: any): Product => {
  // Start with the global stock_quantity stored on the products table
  let stock = Number(p.stock_quantity ?? 0);

  // If the list query joined branch_inventory, prefer that (branch-specific quantity)
  if (Array.isArray(p.branch_inventory) && p.branch_inventory.length > 0) {
    // Use the first matching branch-inventory row
    const qty = p.branch_inventory[0]?.quantity;
    // Only override if we got a real number (not null/undefined)
    if (qty !== null && qty !== undefined) {
      stock = Number(qty);
    }
  } else if (p.branch_inventory && !Array.isArray(p.branch_inventory)) {
    // Supabase sometimes returns a single object instead of array for unique joins
    const qty = p.branch_inventory.quantity;
    if (qty !== null && qty !== undefined) {
      stock = Number(qty);
    }
  }

  return {
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    price: Number(p.selling_price || 0),
    costPrice: Number(p.cost_price || 0),
    stock: stock,
    category: p.categories?.name || p.category || "General",
    image: p.image_url || p.image,
    minStockLevel: Number(p.min_stock_level || 5),
  };
};

export const productApi = {
  getAll: async (branchId?: string): Promise<Product[]> => {
    try {
      const path = branchId ? `/api/products?branchId=${branchId}` : "/api/products";
      const res = await apiClient.request<ListProductsResponse>(path, { method: "GET" });
      return res.data.products.map(mapProduct);
    } catch (error: any) {
      if (!navigator.onLine || error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.warn('[ProductApi] Network error. Fetching from local DB.');
        const cached = await db.products.toArray();
        if (cached && cached.length > 0) {
          return cached as unknown as Product[]; // IndexedDB stores the correct shape now
        }
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Product | undefined> => {
    try {
      const res = await apiClient.request<ProductResponse>(`/api/products/${id}`, { method: "GET" });
      return mapProduct(res.data.product);
    } catch {
      return undefined;
    }
  },

  create: async (product: Omit<Product, "id">): Promise<Product> => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("barcode", product.barcode ?? "");
    formData.append("price", String(product.price));
    formData.append("costPrice", String(product.costPrice));
    formData.append("stock", String(product.stock));
    formData.append("minQuantity", String(product.minStockLevel || 5));
    formData.append("category", product.category);
    // Send current branchId so backend can seed branch_inventory
    const branchId = localStorage.getItem('pos_current_branch_id');
    if (branchId) formData.append("branchId", branchId);
    if (product.image) {
      if (product.image instanceof File) {
        formData.append("image", product.image);
      } else {
        formData.append("image", product.image);
      }
    }

    const res = await apiClient.request<ProductResponse>("/api/products", {
      method: "POST",
      body: formData,
    });
    return mapProduct(res.data.product);
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
    const formData = new FormData();
    if (updates.name !== undefined) formData.append("name", updates.name);
    if (updates.barcode !== undefined) formData.append("barcode", updates.barcode);
    if (updates.price !== undefined) formData.append("price", String(updates.price));
    if (updates.costPrice !== undefined) formData.append("costPrice", String(updates.costPrice));
    if (updates.stock !== undefined) formData.append("stock", String(updates.stock));
    if (updates.minStockLevel !== undefined) formData.append("minQuantity", String(updates.minStockLevel));
    if (updates.category !== undefined) formData.append("category", updates.category);
    if (updates.image !== undefined) {
      if (updates.image instanceof File) {
        formData.append("image", updates.image);
      } else if (updates.image) {
        formData.append("image", updates.image);
      }
    }

    const res = await apiClient.request<ProductResponse>(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    return mapProduct(res.data.product);
  },

  delete: async (id: string): Promise<boolean> => {
    await apiClient.request("/api/products/" + id, { method: "DELETE" });
    return true;
  },

  updateStock: async (productId: string, data: { quantity: number; type: 'in' | 'out' | 'adjustment'; reason: string; branchId: string }): Promise<void> => {
    await apiClient.request(`/api/products/${productId}/adjust-stock`, {
      method: "POST",
      json: data
    });
  },
  getCategories: async (): Promise<string[]> => {
    const res = await apiClient.request<{ status: string, data: { categories: any[] } }>("/api/products/categories");
    return res.data.categories.map(c => c.name);
  },
};
