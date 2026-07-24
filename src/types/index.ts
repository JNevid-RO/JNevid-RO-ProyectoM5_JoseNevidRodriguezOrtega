export type UserRole = 'customer' | 'admin';

export interface AddressDetails {
  street: string;
  city: string;
  stateRegion: string;
  zip: string;
  country: string;
  phone: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
  shippingAddress?: string;
  addressDetails?: AddressDetails;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  brand?: string;
  origin?: string;
  warranty?: string;
  sku?: string;
  specifications?: Record<string, string>;
  available?: boolean;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress?: string;
}
