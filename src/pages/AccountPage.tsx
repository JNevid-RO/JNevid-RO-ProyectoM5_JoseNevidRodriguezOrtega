import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AccountPage() {
  const { user, updateUserProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  
  const [street, setStreet] = useState(user?.addressDetails?.street || '');
  const [city, setCity] = useState(user?.addressDetails?.city || '');
  const [stateRegion, setStateRegion] = useState(user?.addressDetails?.stateRegion || '');
  const [zip, setZip] = useState(user?.addressDetails?.zip || '');
  const [country, setCountry] = useState(user?.addressDetails?.country || '');
  const [phone, setPhone] = useState(user?.addressDetails?.phone || '');

  const [saved, setSaved] = useState(false);

  // Sincronizar estado local si el usuario cambia (ej. recarga de Firestore)
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      if (user.addressDetails) {
        setStreet(user.addressDetails.street || '');
        setCity(user.addressDetails.city || '');
        setStateRegion(user.addressDetails.stateRegion || '');
        setZip(user.addressDetails.zip || '');
        setCountry(user.addressDetails.country || '');
        setPhone(user.addressDetails.phone || '');
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName,
      addressDetails: {
        street,
        city,
        stateRegion,
        zip,
        country,
        phone,
      }
    });
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

      <div style={{ maxWidth: 700 }}>
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
              Perfil actualizado correctamente en la base de datos
            </div>
          )}

          <form
            onSubmit={handleSave}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
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

            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', color: 'var(--text)' }}>
                Dirección de envío habitual
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Se aplicará automáticamente durante el proceso de compra.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Calle y Número</label>
                  <input
                    className="input"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ej. Av. Reforma 123, Int. 4"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Ciudad</label>
                  <input
                    className="input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Ciudad de México"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Estado / Provincia</label>
                  <input
                    className="input"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="Ej. CDMX"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Código Postal</label>
                  <input
                    className="input"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Ej. 06000"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">País</label>
                  <input
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ej. México"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Teléfono de contacto</label>
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +52 55 1234 5678"
                    type="tel"
                  />
                </div>
              </div>
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
