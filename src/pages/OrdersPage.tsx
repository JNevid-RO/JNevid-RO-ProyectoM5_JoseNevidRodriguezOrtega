import { useOrders } from '../contexts/OrdersContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

export function OrdersPage() {
  const { orders } = useOrders();
  const { user } = useAuth();

  const userOrders = orders.filter((ord) => ord.userId === user?.uid);

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Mis Órdenes</h1>
        <p className="page-subtitle">Historial de pedidos realizados</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Sin órdenes registradas</p>
          <p className="empty-state-desc">Tus pedidos aparecerán aquí una vez que realices una compra</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {userOrders.map((order, i) => (
            <div
              key={order.id}
              className="order-card animate-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Order header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: 'var(--text)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    Orden ID: {order.id}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Fecha: {new Date(order.createdAt).toLocaleString('es-MX', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span
                  className={`badge ${
                    order.status === 'pending'
                      ? 'badge-pending'
                      : order.status === 'completed'
                      ? 'badge-success'
                      : 'badge-cancelled'
                  }`}
                >
                  {order.status === 'pending'
                    ? 'Pendiente'
                    : order.status === 'completed'
                    ? 'Completado'
                    : 'Cancelado'}
                </span>
              </div>

              {/* Items list */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.6rem',
                  }}
                >
                  Productos
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {order.items.map((item) => (
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
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Dirección: {order.shippingAddress || 'Sin dirección registrada'}
                </p>
                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color: 'var(--text)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
