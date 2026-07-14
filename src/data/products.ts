import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Auriculares inalámbricos',
    description: 'Audio premium y conexión rápida.',
    price: 129.99,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    stock: 10,
  },
  {
    id: 'p2',
    name: 'Smartwatch Pro',
    description: 'Rastrea actividad y notificaciones.',
    price: 189.5,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    stock: 6,
  },
  {
    id: 'p3',
    name: 'Laptop ligera',
    description: 'Diseño portátil y rendimiento sólido.',
    price: 899,
    category: 'Computación',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    stock: 4,
  },
  {
    id: 'p4',
    name: 'Teclado mecánico',
    description: 'Respuesta ágil y estética premium.',
    price: 89,
    category: 'Computación',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    stock: 8,
  },
  {
    id: 'p5',
    name: 'Pulsera de actividad',
    description: 'Monitorea sueño, pasos y ritmo cardíaco.',
    price: 74.99,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    stock: 7,
  },
];
