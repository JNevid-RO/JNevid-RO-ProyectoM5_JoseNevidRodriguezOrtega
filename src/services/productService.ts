import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Product } from '../types';
import { products as localProducts } from '../data/products';

const PRODUCTS_COLLECTION = 'products';

/**
 * Obtiene todos los productos desde Firestore.
 * Si Firebase no está configurado, retorna los productos locales como fallback.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured) {
    return localProducts;
  }

  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const products: Product[] = [];
    snapshot.forEach((docSnap: any) => {
      products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });
    return products.length > 0 ? products : localProducts;
  } catch (error) {
    console.error('Error al obtener productos de Firestore:', error);
    return localProducts;
  }
}

/**
 * Escucha cambios en tiempo real de la colección de productos.
 */
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  if (!isFirebaseConfigured) {
    callback(localProducts);
    return () => {};
  }

  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot: any) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap: any) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      callback(products.length > 0 ? products : localProducts);
    });
  } catch (error) {
    console.error('Error al suscribirse a productos:', error);
    callback(localProducts);
    return () => {};
  }
}

/**
 * Agrega un producto nuevo a Firestore.
 */
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (!isFirebaseConfigured) {
    const newProduct = { ...product, id: `p-${Date.now()}` } as Product;
    return newProduct;
  }

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createdAt: product.createdAt || new Date().toISOString(),
  });
  return { ...product, id: docRef.id } as Product;
}

/**
 * Actualiza un producto existente en Firestore.
 */
export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  if (!isFirebaseConfigured) return;
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(productRef, data);
}

/**
 * Elimina un producto de Firestore.
 */
export async function deleteProduct(productId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productRef);
}
