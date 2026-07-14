import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

export function HomePage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCart();
  const { user } = useAuth();

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], []);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, debouncedSearch]);

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Catálogo de Productos</h1>
        <p className="page-subtitle">Descubre nuestra selección de productos de alta calidad</p>
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
                <span className="product-category">{product.category}</span>
                <h2 className="product-title">{product.name}</h2>
                <p className="product-desc">{product.description}</p>
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
                      Agregar al carrito
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-secondary btn-sm">
                      Iniciar sesión
                    </Link>
                  )}
                  <Link to={`/product/${product.id}`} className="btn btn-ghost btn-sm">
                    Ver detalle
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
