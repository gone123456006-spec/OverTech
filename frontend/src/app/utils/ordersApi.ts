import { apiGet, apiPatch, apiPost } from './api';
import type { Address, CartItem, Order } from './storage';

export interface PlaceOrderPayload {
  orderId?: string;
  items: CartItem[];
  address: Omit<Address, 'id'>;
  paymentMethod: 'cod' | 'razorpay';
  total: number;
  razorpayOrderId?: string;
}

export async function placeOrderOnServer(payload: PlaceOrderPayload): Promise<Order> {
  const data = await apiPost<{ order: Order }>('/api/orders', payload);
  return data.order;
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const data = await apiGet<{ orders: Order[] }>('/api/admin/orders', { auth: true });
  return data.orders;
}

export async function updateAdminOrderStatusApi(
  orderId: string,
  status: Order['status']
): Promise<Order> {
  const data = await apiPatch<{ order: Order }>(
    `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
    { status },
    { auth: true }
  );
  return data.order;
}

export async function cancelAdminOrderApi(orderId: string, reason: string): Promise<Order> {
  const data = await apiPost<{ order: Order }>(
    `/api/admin/orders/${encodeURIComponent(orderId)}/cancel`,
    { reason },
    { auth: true }
  );
  return data.order;
}

export async function adminLoginApi(password: string): Promise<string> {
  const data = await apiPost<{ token: string }>('/api/admin/login', { password });
  return data.token;
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    await apiGet('/api/admin/me', { auth: true });
    return true;
  } catch {
    return false;
  }
}
