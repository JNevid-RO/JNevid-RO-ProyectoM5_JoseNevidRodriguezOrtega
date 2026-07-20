import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subscribeToProducts } from '../services/productService';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((newProducts) => {
      setProducts(newProducts);
    });
    return () => unsubscribe();
  }, []);

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">Producto no encontrado</p>
        <p className="empty-state-desc">El artículo que buscas no existe o fue eliminado del catálogo</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <section className="animate-in">
      <Link
        to="/"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
      >
        Volver al catálogo
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Image */}
        <div
          className="card"
          style={{ overflow: 'hidden', aspectRatio: '4/3', padding: 0 }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span className="product-category" style={{ marginBottom: '0.75rem' }}>
              {product.category}
            </span>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
                lineHeight: 1.2,
                marginTop: '0.5rem',
              }}
            >
              {product.name}
            </h1>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.975rem' }}>
            {product.description}
          </p>

          <div
            style={{
              background: 'var(--accent-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600 }}>
              Precio
            </span>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
              }}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Disponibilidad: {product.stock} unidades en stock
          </div>

          <div>
            {user ? (
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    imageUrl: product.imageUrl,
                  })
                }
              >
                Agregar al carrito
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-lg btn-block">
                Iniciar sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
