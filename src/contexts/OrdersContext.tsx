import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Order, OrderItem } from '../types';

type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled';

interface OrdersContextValue {
  orders: Order[];
  pendingOrders: Order[];
  addOrder: (items: OrderItem[], total: number, shippingAddress: string, userId: string) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const STORAGE_KEY = 'ecommerce_orders';

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error guardando ordenes en localStorage', e);
    }
  }, [orders]);

  const addOrder = (items: OrderItem[], total: number, shippingAddress: string, userId: string): Order => {
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'cancelled' as const } : ord))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  const value = useMemo(() => {
    const pendingOrders = orders.filter((ord) => ord.status === 'pending');
    return {
      orders,
      pendingOrders,
      addOrder,
      cancelOrder,
      updateOrderStatus,
    };
  }, [orders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders debe ser usado dentro de un OrdersProvider');
  }
  return context;
}
