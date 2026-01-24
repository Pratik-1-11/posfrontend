import { apiClient } from './apiClient';
import { db } from '@/db/db';
import { toast } from '@/hooks/use-toast';
import type { PaymentMethod } from '@/types/payment';
import { v4 as uuidv4 } from 'uuid';

type CreateOrderItem = { productId: string; quantity: number };

export type CreateOrderPayload = {
  items: CreateOrderItem[];
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: Record<string, number>;
  customerName?: string;
  customerId?: string;
  customerPan?: string;
};

const mapToBackendPaymentMethod = (pm: PaymentMethod): string => {
  switch (pm) {
    case 'credit_card': return 'card';
    case 'fonepay':
    case 'esewa': return 'qr';
    case 'credit': return 'credit';
    case 'mixed': return 'mixed';
    case 'cash': return 'cash';
    default: return 'cash';
  }
};

type BackendOrderResponse = {
  status: 'success';
  data: {
    order: {
      id: string;
      invoice_number: string;
      sub_total: number;
      taxable_amount: number;
      vat_amount: number;
      total_amount: number;
      payment_method: string;
      created_at: string;
    };
  };
};

export const orderApi = {
  create: async (payload: CreateOrderPayload) => {
    // ============================================================================
    // CRITICAL SECURITY: Generate UUID for idempotency (Fix #4)
    // ============================================================================
    const idempotencyKey = uuidv4();
    const apiPayload = {
      items: payload.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      discountAmount: payload.discountAmount ?? 0,
      paymentMethod: mapToBackendPaymentMethod(payload.paymentMethod),
      paymentDetails: payload.paymentDetails,
      customerName: payload.customerName ?? '',
      customerId: payload.customerId,
      customerPan: payload.customerPan,
      idempotencyKey
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[OrderApi] Offline mode. Saving local.');
      await db.offlineSales.add({
        data: apiPayload,
        created_at: Date.now(),
        retry_count: 0
      });
      return {
        id: 'OFFLINE-' + Date.now(),
        invoice_number: 'PENDING-SYNC',
        total_amount: 0,
        orderNumber: 'PENDING-SYNC',
        totalAmount: 0,
        isOffline: true
      };
    }

    try {
      const res = await apiClient.request<BackendOrderResponse>('/api/orders', {
        method: 'POST',
        json: apiPayload
      });

      const o = res.data?.order || (res.data as any)?.sale;

      if (!o) {
        console.error('Backend response missing order data:', res);
        throw new Error('Server response missing order information');
      }

      return {
        ...o,
        orderNumber: o.invoice_number || 'N/A',
        totalAmount: o.total_amount || 0
      };
    } catch (error: any) {
      // Fallback for network errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.warn('[OrderApi] Network error. Saving offline.');
        await db.offlineSales.add({
          data: apiPayload,
          created_at: Date.now(),
          retry_count: 0
        });
        toast({ title: "Network Disconnected", description: "Transaction saved locally.", variant: "destructive" });

        return {
          id: 'OFFLINE-' + Date.now(),
          invoice_number: 'OFFLINE-SAVED',
          total_amount: 0,
          orderNumber: 'OFFLINE-SAVED',
          totalAmount: 0,
          isOffline: true
        };
      }
      throw error;
    }
  },
  getAll: async (params?: { customerId?: string }): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params?.customerId) searchParams.append('customerId', params.customerId);

    const res = await apiClient.request<{ status: string, data: { orders: any[] } }>(
      `/api/orders?${searchParams.toString()}`,
      { method: 'GET' }
    );
    return res.data.orders;
  },
  getOne: async (id: string): Promise<any> => {
    const res = await apiClient.request<{ status: string, data: { order: any } }>(
      `/api/orders/${id}`,
      { method: 'GET' }
    );
    return res.data.order;
  }
};
