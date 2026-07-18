import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isRegistering
          ? 'No se pudo crear la cuenta. Intenta de nuevo.'
          : 'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('No se pudo autenticar con Google.');
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
      <div className="animate-in" style={{ width: '100%', maxWidth: 440 }}>
        <div className="card card-xl" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.04em',
                marginBottom: '0.4rem',
              }}
            >
              {isRegistering ? 'Crear una cuenta' : 'Bienvenido'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isRegistering
                ? 'Regístrate para comenzar tus compras en ShopNova'
                : 'Inicia sesión para continuar comprando'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${!isRegistering ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
              onClick={() => {
                setIsRegistering(false);
                setError('');
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isRegistering ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
              onClick={() => {
                setIsRegistering(true);
                setError('');
              }}
            >
              Crear cuenta
            </button>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continuar con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '0.75rem' }}>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>o</span>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
          >
            {isRegistering && (
              <div className="form-group">
                <label className="label">Nombre completo</label>
                <input
                  className="input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  required
                />
              </div>
            )}

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

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}
            >
              {loading
                ? isRegistering
                  ? 'Creando cuenta...'
                  : 'Iniciando sesión...'
                : isRegistering
                ? 'Registrarse'
                : 'Iniciar sesión'}
            </button>
          </form>
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
