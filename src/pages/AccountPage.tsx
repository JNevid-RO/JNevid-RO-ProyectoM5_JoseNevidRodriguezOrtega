import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AccountPage() {
  const { user, updateUserProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [shippingAddress, setShippingAddress] = useState(user?.shippingAddress || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ displayName, shippingAddress });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <section>
      <div className="page-header">
        <h1 className="page-title">Mi Cuenta</h1>
        <p className="page-subtitle">Gestiona tu perfil y preferencias de envío</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card card-lg animate-in" style={{ padding: '2rem' }}>
          {/* User profile header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontSize: '1.05rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.displayName || user?.email}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                {user?.email}
              </p>
              <div style={{ marginTop: '0.35rem' }}>
                <span className="badge badge-role">
                  Rol: {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>
          </div>

          {saved && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              Perfil actualizado correctamente
            </div>
          )}

          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="form-group">
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="label">Nombre de usuario</label>
              <input
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ingresa tu nombre preferido"
              />
            </div>

            <div className="form-group">
              <label className="label">Dirección de envío habitual</label>
              <textarea
                className="input textarea"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Calle, Número, Ciudad, CP, País"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                Se aplicará automáticamente durante el proceso de compra
              </p>
            </div>

            <hr className="divider" />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary">
                Guardar cambios
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
