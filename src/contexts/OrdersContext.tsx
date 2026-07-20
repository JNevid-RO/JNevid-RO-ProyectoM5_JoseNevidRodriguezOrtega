import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Order, OrderItem } from '../types';
import { useAuth } from './AuthContext';
import {
  createOrder as createOrderInFirestore,
  updateOrderStatus as updateOrderStatusInFirestore,
  subscribeToUserOrders,
  subscribeToAllOrders,
} from '../services/orderService';

type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled';

interface OrdersContextValue {
  orders: Order[];
  pendingOrders: Order[];
  addOrder: (items: OrderItem[], total: number, shippingAddress: string, userId: string) => Promise<Order>;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const STORAGE_KEY = 'ecommerce_orders';

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sincronizar con localStorage como cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error guardando ordenes en localStorage', e);
    }
  }, [orders]);

  // Suscripción en tiempo real a Firestore
  useEffect(() => {
    if (!user) return;

    let unsubscribe: () => void;

    if (role === 'admin') {
      // Admin ve todas las órdenes
      unsubscribe = subscribeToAllOrders((firestoreOrders) => {
        if (firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
      });
    } else {
      // Cliente ve solo sus órdenes
      unsubscribe = subscribeToUserOrders(user.uid, (firestoreOrders) => {
        if (firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
      });
    }

    return () => unsubscribe();
  }, [user, role]);

  const addOrder = async (items: OrderItem[], total: number, shippingAddress: string, userId: string): Promise<Order> => {
    const newOrder = await createOrderInFirestore(items, total, shippingAddress, userId);
    // También guardar localmente por si Firestore tarda en notificar
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatusInFirestore(orderId, 'cancelled').catch(console.error);
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'cancelled' as const } : ord))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatusInFirestore(orderId, status).catch(console.error);
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
