import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="animate-in" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card card-xl" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
                marginBottom: '0.4rem',
              }}
            >
              Bienvenido
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Inicia sesión para continuar comprando
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
          >
            <div className="form-group">
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <hr className="divider" />

          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-subtle)',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Modo de prueba: ingrese su correo de usuario o correo de administrador para ingresar.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/" className="btn btn-ghost btn-sm">
            Volver al catálogo
          </Link>
        </p>
      </div>
    </div>
  );
}
