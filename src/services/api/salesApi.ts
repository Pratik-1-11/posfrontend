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
        items: sale.items.map((i) => ({ productId: Number(i.id), quantity: i.quantity })),
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
    return [];
  },
  getById: async (): Promise<Sale | undefined> => {
    return undefined;
  },
};
