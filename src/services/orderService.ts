import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Order, OrderItem } from '../types';

const ORDERS_COLLECTION = 'orders';

/**
 * Crea una orden nueva en Firestore.
 */
export async function createOrder(
  items: OrderItem[],
  total: number,
  shippingAddress: string,
  userId: string
): Promise<Order> {
  const orderData = {
    userId,
    items,
    total,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    shippingAddress,
  };

  if (!isFirebaseConfigured) {
    return {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...orderData,
    };
  }

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
  return { id: docRef.id, ...orderData };
}

/**
 * Actualiza el estado de una orden en Firestore.
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, { status });
}

/**
 * Escucha en tiempo real las órdenes de un usuario específico.
 */
export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot: any) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap: any) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      callback(orders);
    });
  } catch (error) {
    console.error('Error al suscribirse a órdenes del usuario:', error);
    callback([]);
    return () => {};
  }
}

/**
 * Escucha en tiempo real TODAS las órdenes (solo para admin).
 */
export function subscribeToAllOrders(callback: (orders: Order[]) => void): () => void {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot: any) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap: any) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      callback(orders);
    });
  } catch (error) {
    console.error('Error al suscribirse a todas las órdenes:', error);
    callback([]);
    return () => {};
  }
}
