import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrdersContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import type { OrderItem } from '../types';

export function CheckoutPage() {
  const { state, clearCart, totalAmount } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();

  const [address, setAddress] = useState(user?.shippingAddress || '');
  const [done, setDone] = useState(false);

  const canSubmit = state.items.length > 0 && address.trim().length > 0;

  const handleCheckout = async () => {
    if (!canSubmit || !user) return;

    const orderItems: OrderItem[] = state.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    await addOrder(orderItems, totalAmount, address, user.uid);
    setDone(true);
    clearCart();
  };

  if (done) {
    return (
      <div
        className="animate-in"
        style={{
          maxWidth: 500,
          margin: '3rem auto',
          textAlign: 'center',
        }}
      >
        <div className="card card-xl" style={{ padding: '3rem 2rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--success)',
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            ¡Pedido confirmado!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Tu compra se procesó con éxito y quedó registrada como orden pendiente.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary btn-lg">
              Ver mis órdenes
            </Link>
            <Link to="/" className="btn btn-ghost btn-lg">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Confirma tu pedido y dirección de entrega</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(0, 360px)',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Shipping form */}
        <div className="card card-lg" style={{ padding: '2rem' }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Dirección de envío
          </h2>
          <div className="form-group">
            <label className="label">Dirección completa</label>
            <textarea
              className="input textarea"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, Número, Ciudad, Código Postal, País"
            />
          </div>
          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-sm)' }}
            onClick={handleCheckout}
            disabled={!canSubmit}
          >
            {canSubmit ? 'Confirmar pedido' : 'Agrega una dirección'}
          </button>
        </div>

        {/* Order summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card card-lg" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Resumen del pedido
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {state.items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.name}{' '}
                    <span style={{ color: 'var(--text-subtle)' }}>×{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--text)',
                  letterSpacing: '-0.03em',
                }}
              >
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
