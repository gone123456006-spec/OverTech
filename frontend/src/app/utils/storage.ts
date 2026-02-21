export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  house: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  address: Address;
  paymentMethod: 'cod' | 'gpay';
  status: 'pending' | 'accepted' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  acceptedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundStatus?: 'not_required' | 'pending' | 'processed';
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  total: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

// Local Storage Keys
const CART_KEY = 'ecommerce_cart';
const ADDRESSES_KEY = 'ecommerce_addresses';
const ORDERS_KEY = 'ecommerce_orders';
const PROFILE_KEY = 'ecommerce_profile';

// Cart Operations
export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (productId: string, quantity: number = 1): void => {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  saveCart(cart);
};

export const updateCartItemQuantity = (productId: string, quantity: number): void => {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(cart);
    }
  }
};

export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.productId !== productId);
  saveCart(updatedCart);
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_KEY);
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Address Operations
export const getAddresses = (): Address[] => {
  const addresses = localStorage.getItem(ADDRESSES_KEY);
  return addresses ? JSON.parse(addresses) : [];
};

export const saveAddress = (address: Omit<Address, 'id'>): Address => {
  const addresses = getAddresses();
  const newAddress: Address = {
    ...address,
    id: `addr_${Date.now()}`
  };
  addresses.push(newAddress);
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  return newAddress;
};

export const deleteAddress = (addressId: string): void => {
  const addresses = getAddresses();
  const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updatedAddresses));
};

// Order Operations
export const getOrders = (): Order[] => {
  const orders = localStorage.getItem(ORDERS_KEY);
  const parsedOrders: any[] = orders ? JSON.parse(orders) : [];

  // Backward compatibility for previously saved order statuses.
  return parsedOrders.map((order) => {
    let normalizedStatus: Order['status'] = order.status;
    if (order.status === 'confirmed') normalizedStatus = 'pending';
    if (order.status === 'packed') normalizedStatus = 'accepted';
    if (order.status === 'shipped') normalizedStatus = 'out_for_delivery';

    return {
      ...order,
      status: normalizedStatus,
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'gpay' ? 'paid' : 'pending'),
      refundStatus: order.refundStatus || 'not_required',
      deliveryAgentName: order.deliveryAgentName || 'Rider Team',
      deliveryAgentPhone: order.deliveryAgentPhone || '+91 90000 00000'
    };
  });
};

export const createOrder = (
  items: CartItem[],
  address: Address,
  paymentMethod: 'cod' | 'gpay',
  total: number,
  options?: { paymentStatus?: Order['paymentStatus'] }
): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    id: `ORD${Date.now().toString().slice(-8)}`,
    date: new Date().toISOString(),
    items,
    address,
    paymentMethod,
    status: 'pending',
    paymentStatus: options?.paymentStatus || (paymentMethod === 'gpay' ? 'paid' : 'pending'),
    refundStatus: 'not_required',
    deliveryAgentName: 'Rider Team',
    deliveryAgentPhone: '+91 90000 00000',
    total
  };
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('ordersUpdated'));
  return newOrder;
};

export const getOrderById = (orderId: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === orderId);
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    if (status === 'accepted') {
      order.acceptedAt = new Date().toISOString();
    }
    if (status === 'out_for_delivery') {
      order.outForDeliveryAt = new Date().toISOString();
    }
    if (status === 'delivered') {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('ordersUpdated'));
  }
};

export const cancelOrder = (orderId: string, reason: string): void => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    order.cancellationReason = reason;
    if (order.paymentStatus === 'paid') {
      order.refundStatus = 'pending';
      order.paymentStatus = 'refunded';
    } else {
      order.refundStatus = 'not_required';
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('ordersUpdated'));
  }
};

// Profile Operations
export const getProfile = (): UserProfile | null => {
  const profile = localStorage.getItem(PROFILE_KEY);
  return profile ? JSON.parse(profile) : null;
};

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const hasProfile = (): boolean => {
  return getProfile() !== null;
};
