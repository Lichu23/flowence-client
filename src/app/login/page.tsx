'use client';

/**
 * Login Page
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === 'owner' ? '/dashboard' : '/pos');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // redirect happens in the effect based on role
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-apca-pass">Flowence</h1>
          <p className="text-apca-muted mt-2">Gestión Multi-Tiendas</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-apca-pass mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="tu@ejemplo.com…"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-apca-pass mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {error && (
            <div
              id="login-error"
              className="glass-bg-5 border border-error/30 text-apca-pass px-4 py-3 rounded-xl"
              role="alert"
              aria-live="assertive"
            >
              <div className="text-icon-pair-sm">
                <svg
                  className="w-5 h-5 text-error flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            aria-busy={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-apca-muted">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 hover-contrast font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

