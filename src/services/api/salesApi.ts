import type { Sale } from "@/types/sales";
import { apiClient } from "./apiClient";

type CreateOrderResponse = {
  status: "success";
  data: {
    order: {
      id: string;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
      paymentMethod: string;
      createdAt: string;
      createdBy: string;
    };
  };
};

export const salesApi = {
  create: async (sale: Omit<Sale, "id">): Promise<Sale> => {
    const res = await apiClient.request<CreateOrderResponse>("/api/orders", {
      method: "POST",
      json: {
        items: sale.items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        discountAmount: sale.discount,
        taxAmount: sale.vat,
        paymentMethod: sale.paymentMethod,
      },
    });

    return {
      id: res.data.order.id,
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      vat: sale.vat,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      date: res.data.order.createdAt,
      cashierId: res.data.order.createdBy,
    };
  },
  getAll: async (): Promise<Sale[]> => {
    const res = await apiClient.request<{ data: { orders: any[] } }>("/api/orders", { method: "GET" });
    return res.data.orders.map(o => ({
      id: o.id,
      items: o.sale_items?.map((i: any) => ({
        id: i.product_id,
        name: i.product_name,
        price: i.unit_price,
        quantity: i.quantity,
      })) || [],
      subtotal: o.sub_total,
      discount: o.discount_amount,
      vat: o.vat_amount,
      total: o.total_amount,
      paymentMethod: o.payment_method,
      date: o.created_at,
      cashierId: o.cashier_id,
      invoiceNumber: o.invoice_number
    }));
  },
  getById: async (id: string): Promise<Sale | undefined> => {
    try {
      const res = await apiClient.request<{ data: { order: any } }>(`/api/orders/${id}`, { method: "GET" });
      if (!res.data.order) return undefined;
      const o = res.data.order;
      return {
        id: o.id,
        items: o.sale_items?.map((i: any) => ({
          id: i.product_id,
          name: i.product_name,
          price: i.unit_price,
          quantity: i.quantity,
        })) || [],
        subtotal: o.sub_total,
        discount: o.discount_amount,
        vat: o.vat_amount,
        total: o.total_amount,
        paymentMethod: o.payment_method,
        date: o.created_at,
        cashierId: o.cashier_id,
        invoiceNumber: o.invoice_number
      };
    } catch {
      return undefined;
    }
  },
};
