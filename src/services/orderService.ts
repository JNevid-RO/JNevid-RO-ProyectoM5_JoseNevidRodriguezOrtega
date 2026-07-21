import {
  collection,
  doc,
  getDoc,
  setDoc,
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
 * Si la orden no existe en Firestore (porque proviene del caché local de localStorage),
 * se inserta la orden completa con el nuevo estado.
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  fullOrderFallback?: Order
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
  try {
    const snap = await getDoc(orderRef);
    if (!snap.exists() && fullOrderFallback) {
      await setDoc(orderRef, {
        ...fullOrderFallback,
        status,
      });
    } else {
      await updateDoc(orderRef, { status });
    }
  } catch (error) {
    console.error('Error al actualizar estado de orden:', error);
    throw error;
  }
}

/**
 * Escucha en tiempo real las órdenes de un usuario específico.
 * Se ordena en memoria para EVITAR la necesidad de crear un índice compuesto en Firestore.
 */
export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    // Al quitar orderBy, eliminamos por completo la obligatoriedad de crear un índice en Firebase
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot: any) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap: any) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Ordenar por fecha de creación descendente en memoria
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
