import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';

export function CartPage() {
  const { state, removeItem, updateQuantity, clearCart, totalAmount, totalItems } = useCart();

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Tu Carrito de Compras</h1>
        {state.items.length > 0 && (
          <p className="page-subtitle">{totalItems} producto(s) en tu selección</p>
        )}
      </div>

      {state.items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Tu carrito está vacío</p>
          <p className="empty-state-desc">
            Agrega productos desde el catálogo para comenzar tu compra
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {state.items.map((item) => (
            <div key={item.productId} className="cart-item animate-in">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">{formatPrice(item.price)} por unidad</p>
                <div className="cart-item-controls">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600, marginRight: '0.25rem' }}>
                    Cantidad:
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    className="qty-input"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) updateQuantity(item.productId, val);
                    }}
                  />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}

          {/* Summary bar */}
          <div
            className="card card-lg"
            style={{
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Total a pagar
              </p>
              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {formatPrice(totalAmount)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={clearCart}>
                Vaciar carrito
              </button>
              <Link to="/checkout" className="btn btn-primary btn-lg">
                Proceder al Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
