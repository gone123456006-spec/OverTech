import { applyStorefrontCache, getStorefrontCache, saveStorefront } from './storefront';

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
  paymentMethod: 'cod' | 'gpay' | 'razorpay';
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
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
const BANNERS_KEY = 'admin_banners';
const PRODUCT_OVERRIDES_KEY = 'admin_product_overrides';
const CUSTOM_PRODUCTS_KEY = 'admin_custom_products';
const CUSTOM_PRODUCTS_EVENT = 'customProductsUpdated';

function publishStorefront(partial?: {
  banners?: AdminBanners;
  productOverrides?: ProductOverride[];
  customProducts?: CustomProduct[];
  invoiceSettings?: InvoiceSettings;
}) {
  const current = getStorefrontCache();
  applyStorefrontCache({
    banners: partial?.banners ?? current.banners ?? {},
    productOverrides: partial?.productOverrides ?? current.productOverrides ?? [],
    customProducts: partial?.customProducts ?? current.customProducts ?? [],
    invoiceSettings: partial?.invoiceSettings ?? current.invoiceSettings,
    updatedAt: new Date().toISOString(),
  });
  saveStorefront(partial ?? current).catch(() => {
    /* offline — local cache still updated */
  });
}

// Banner types
export interface AdminBanners {
  home?: string;
  cart?: string;
  categoryClothes?: string;
  categoryJewellery?: string;
  categoryFood?: string;
}

/** Default images shown on the storefront when no custom banner is saved. */
export const DEFAULT_BANNER_IMAGES: Partial<Record<keyof AdminBanners, string>> = {
  home: '/assets/images/banner-grains-pulses.png',
};

const CATEGORY_BANNER_KEYS: Record<string, keyof AdminBanners> = {
  tech: 'categoryClothes',
  clothes: 'categoryClothes',
  jewellery: 'categoryJewellery',
  food: 'categoryFood',
};

export function getEffectiveBanner(key: keyof AdminBanners): string | undefined {
  const custom = getBanners()[key];
  if (custom) return custom;
  return DEFAULT_BANNER_IMAGES[key];
}

export function getCategoryPageBanner(categorySlug: string): string | undefined {
  const key = CATEGORY_BANNER_KEYS[categorySlug.toLowerCase()];
  if (!key) return undefined;
  return getBanners()[key];
}

export interface InvoiceSettings {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  termsAndConditions: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  businessName: 'OverTech',
  businessAddress: 'India',
  businessPhone: '',
  businessEmail: '',
  termsAndConditions:
    '1. All prices are inclusive of applicable taxes unless stated otherwise.\n' +
    '2. Goods once sold will not be taken back or exchanged except in case of defective items.\n' +
    '3. Delivery timelines are estimates and may vary based on location.\n' +
    '4. For support, contact us with your order ID and registered mobile number.',
};

export const BANNER_SLOT_CONFIG: {
  key: keyof AdminBanners;
  label: string;
  hint: string;
  defaultPreview?: string;
}[] = [
  { key: 'home', label: 'Homepage Banner', hint: 'Top of the homepage', defaultPreview: DEFAULT_BANNER_IMAGES.home },
  { key: 'cart', label: 'Cart Banner', hint: 'Top of the cart page' },
  { key: 'categoryClothes', label: 'Tech Category', hint: 'Tech category page' },
  { key: 'categoryJewellery', label: 'Jewellery Category', hint: 'Jewellery category page' },
  { key: 'categoryFood', label: 'Food Category', hint: 'Food category page' },
];

export interface ProductOverride {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  image?: string;
  description?: string;
  banner?: string;
  category?: string;
  rating?: number;
}

export interface CustomProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

// Banner Operations
export const getBanners = (): AdminBanners => getStorefrontCache().banners || {};

export const saveBanners = (banners: AdminBanners): void => {
  publishStorefront({ banners });
};

export const getInvoiceSettings = (): InvoiceSettings => {
  const saved = getStorefrontCache().invoiceSettings;
  return { ...DEFAULT_INVOICE_SETTINGS, ...saved };
};

export const saveInvoiceSettings = (settings: InvoiceSettings): void => {
  publishStorefront({ invoiceSettings: settings });
};

// Product Override Operations
export const getProductOverrides = (): ProductOverride[] => getStorefrontCache().productOverrides || [];

export const saveProductOverride = (override: ProductOverride): void => {
  const overrides = [...getProductOverrides()];
  const idx = overrides.findIndex(o => o.id === override.id);
  if (idx >= 0) {
    overrides[idx] = { ...overrides[idx], ...override };
  } else {
    overrides.push(override);
  }
  publishStorefront({ productOverrides: overrides });
};

export const getCustomProducts = (): CustomProduct[] => getStorefrontCache().customProducts || [];

export const saveCustomProduct = (product: CustomProduct): void => {
  const list = [...getCustomProducts()];
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    list[idx] = product;
  } else {
    list.push(product);
  }
  publishStorefront({ customProducts: list });
  window.dispatchEvent(new Event(CUSTOM_PRODUCTS_EVENT));
};

export const deleteCustomProduct = (id: string): void => {
  const list = getCustomProducts().filter((p) => p.id !== id);
  const overrides = getProductOverrides().filter((o) => o.id !== id);
  publishStorefront({ customProducts: list, productOverrides: overrides });
  window.dispatchEvent(new Event(CUSTOM_PRODUCTS_EVENT));
};

export const newCustomProductId = (): string =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'gpay' || order.paymentMethod === 'razorpay' ? 'paid' : 'pending'),
      refundStatus: order.refundStatus || 'not_required',
      deliveryAgentName: order.deliveryAgentName || 'Rider Team',
      deliveryAgentPhone: order.deliveryAgentPhone || '+91 90000 00000'
    };
  });
};

export const getPaymentMethodLabel = (method: Order['paymentMethod']): string => {
  if (method === 'cod') return 'Cash on Delivery';
  return 'Razorpay';
};

export const createOrder = (
  items: CartItem[],
  address: Address,
  paymentMethod: 'cod' | 'razorpay',
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
    paymentStatus: options?.paymentStatus || (paymentMethod === 'razorpay' ? 'paid' : 'pending'),
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

/** Persist an order returned from the backend (for checkout + admin sync). */
export const saveOrderFromServer = (order: Order): void => {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event('ordersUpdated'));
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
