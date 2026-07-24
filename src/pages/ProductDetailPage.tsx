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

  const hasSpecs = product.specifications && Object.keys(product.specifications).length > 0;

  return (
    <section className="animate-in">
      <Link
        to="/"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
      >
        ← Volver al catálogo
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Image Card */}
        <div
          className="card"
          style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', padding: 0, border: '1px solid var(--border)' }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Info & Purchase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              <span className="product-category">{product.category}</span>
              {product.brand && <span className="product-brand-tag">Marca: {product.brand}</span>}
              {product.origin && <span className="origin-badge">🌐 Hecho en {product.origin}</span>}
              {product.warranty && <span className="warranty-badge">🛡️ {product.warranty}</span>}
            </div>

            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
                lineHeight: 1.25,
              }}
            >
              {product.name}
            </h1>
            {product.sku && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                SKU / Ref: <strong>{product.sku}</strong>
              </p>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
            {product.description}
          </p>

          {/* Quick Specs Highlight */}
          <div className="spec-highlights-grid">
            {product.brand && (
              <div className="spec-highlight-card">
                <span className="spec-highlight-label">Marca</span>
                <span className="spec-highlight-value">{product.brand}</span>
              </div>
            )}
            {product.origin && (
              <div className="spec-highlight-card">
                <span className="spec-highlight-label">Origen</span>
                <span className="spec-highlight-value">{product.origin}</span>
              </div>
            )}
            {product.warranty && (
              <div className="spec-highlight-card">
                <span className="spec-highlight-label">Garantía</span>
                <span className="spec-highlight-value">{product.warranty}</span>
              </div>
            )}
            <div className="spec-highlight-card">
              <span className="spec-highlight-label">Disponibilidad</span>
              <span className="spec-highlight-value" style={{ color: 'var(--success)' }}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
              </span>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(74, 52, 44, 0.4) 0%, rgba(38, 34, 32, 0.9) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--gold-glow)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                Precio Especial
              </span>
              <span
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 900,
                  color: 'var(--color-radiant-gold)',
                  letterSpacing: '-0.04em',
                }}
              >
                {formatPrice(product.price)}
              </span>
            </div>
            {product.stock > 0 && (
              <span className="badge badge-success">Disponible</span>
            )}
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
                🛒 Agregar al carrito
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-lg btn-block">
                Iniciar sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Technical Specifications Table */}
      {hasSpecs && (
        <div className="spec-table-container animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="spec-table-header">
            <h2 className="spec-table-title">📐 Especificaciones Técnicas y Detalle</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-radiant-gold)', fontWeight: 700 }}>
              Ficha Técnica Oficial
            </span>
          </div>
          <table className="spec-table">
            <tbody>
              {product.brand && (
                <tr>
                  <td className="spec-key">Fabricante / Marca</td>
                  <td className="spec-val">{product.brand}</td>
                </tr>
              )}
              {product.origin && (
                <tr>
                  <td className="spec-key">País de Fabricación</td>
                  <td className="spec-val">{product.origin}</td>
                </tr>
              )}
              {product.warranty && (
                <tr>
                  <td className="spec-key">Garantía del Producto</td>
                  <td className="spec-val">{product.warranty}</td>
                </tr>
              )}
              {product.sku && (
                <tr>
                  <td className="spec-key">Código SKU</td>
                  <td className="spec-val">{product.sku}</td>
                </tr>
              )}
              {Object.entries(product.specifications!).map(([key, val]) => (
                <tr key={key}>
                  <td className="spec-key">{key}</td>
                  <td className="spec-val">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

