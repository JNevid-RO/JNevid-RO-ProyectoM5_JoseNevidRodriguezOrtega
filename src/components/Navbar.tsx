import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrdersContext';
import { useTheme } from '../contexts/ThemeContext';

export function Navbar() {
  const { totalItems } = useCart();
  const { user, role } = useAuth();
  const { pendingOrders } = useOrders();
  const { theme, toggleTheme } = useTheme();

  const userPendingOrders = pendingOrders.filter((ord) => ord.userId === user?.uid);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Cuenta';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-gradient">✨ ShopNova</span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className="nav-link">Catálogo</Link>

        {user ? (
          <>
            <Link to="/cart" className="nav-link nav-link-cart">
              Carrito{totalItems > 0 ? ` (${totalItems})` : ''}
            </Link>
            {totalItems > 0 && (
              <Link to="/checkout" className="nav-link">Checkout</Link>
            )}
            <Link to="/orders" className={userPendingOrders.length > 0 ? "nav-link nav-link-pending" : "nav-link"}>
              Mis Órdenes{userPendingOrders.length > 0 ? ` (${userPendingOrders.length})` : ''}
            </Link>

            {role === 'admin' && (
              <Link to="/admin" className="nav-link nav-link-admin">
                Administrador
              </Link>
            )}

            <Link to="/account" className="nav-link nav-link-account" title={user.email}>
              {displayName}
            </Link>
          </>
        ) : (
          <Link to="/login" className="nav-link nav-link-login">
            Iniciar sesión
          </Link>
        )}

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? 'Oscuro' : 'Claro'}
        </button>
      </div>
    </nav>
  );
}
