import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToProducts } from '../services/productService';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import type { Product } from '../types';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToProducts((newProducts) => {
      setProducts(newProducts);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const activeProducts = products.filter((p) => p.available !== false);
    return [...new Set(activeProducts.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return products.filter((product) => {
      // Solo mostrar productos que estén disponibles para el público
      const isAvailable = product.available !== false;
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return isAvailable && matchesCategory && matchesSearch;
    });
  }, [products, category, debouncedSearch]);

  return (
    <section>
      {/* Hero Banner with catchy slogan */}
      <div className="hero-banner animate-in">
        <span className="hero-badge">Tecnología & Estilo</span>
        <h1 className="hero-title">ShopNova — Innovación y Tecnología Premium a tu Alcance</h1>
        <p className="hero-slogan">
          Descubre dispositivos de alta gama, laptops ultraligeras y accesorios inteligentes diseñados para potenciar tu día a día con el mejor rendimiento y garantía.
        </p>
      </div>

      <div className="page-header" style={{ marginTop: '2.5rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Catálogo de Productos</h2>
        <p className="page-subtitle">Explora nuestra colección cuidadosamente seleccionada</p>
      </div>

      <div className="filter-row">
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos por nombre o descripción..."
        />
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Sin resultados</p>
          <p className="empty-state-desc">Intenta con otras palabras clave o cambia la categoría seleccionada</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product, i) => (
            <article
              key={product.id}
              className="product-card animate-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ overflow: 'hidden' }}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
              </div>
              <div className="product-body">
                <div className="product-meta-header">
                  <span className="product-category">{product.category}</span>
                  {product.brand && <span className="product-brand-tag">{product.brand}</span>}
                </div>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                {product.origin && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.6rem' }}>
                    🌐 {product.origin} {product.warranty ? `• 🛡️ ${product.warranty}` : ''}
                  </p>
                )}
                <p className="product-price">{formatPrice(product.price)}</p>
                <div className="product-actions">
                  {user ? (
                    <button
                      className="btn btn-primary btn-sm"
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
                      Agregar
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-secondary btn-sm">
                      Iniciar sesión
                    </Link>
                  )}
                  <Link to={`/product/${product.id}`} className="btn btn-gold btn-sm">
                    Ver más
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
