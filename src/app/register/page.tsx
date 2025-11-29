'use client';

/**
 * Register Page
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    store_name: '',
    store_address: '',
    store_phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic password validation
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Prepare registration data, only include optional fields if they have values
      const registrationData: {
        email: string;
        password: string;
        name: string;
        store_name: string;
        store_address?: string;
        store_phone?: string;
      } = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        store_name: formData.store_name,
      };

      if (formData.store_address.trim()) {
        registrationData.store_address = formData.store_address.trim();
      }

      if (formData.store_phone.trim()) {
        registrationData.store_phone = formData.store_phone.trim();
      }

      await register(registrationData);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse. Intenta de nuevo.');
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
          <p className="text-apca-muted mt-2">Crea tu cuenta</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-apca-pass mb-2">
              Tu Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Juan Pérez…"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'register-error' : undefined}
            />
          </div>

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
              aria-describedby={error ? 'register-error' : undefined}
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby="password-hint register-error"
            />
            <p id="password-hint" className="text-xs text-apca-subtle mt-1">
              Debe tener al menos 8 caracteres con mayúscula, minúscula, número y carácter especial
            </p>
          </div>

          <div>
            <label htmlFor="store_name" className="block text-sm font-medium text-apca-pass mb-2">
              Nombre de la Primera Tienda
            </label>
            <input
              id="store_name"
              name="store_name"
              type="text"
              autoComplete="organization"
              required
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="input-field"
              placeholder="Mi Tienda…"
              aria-describedby="store-name-hint"
            />
            <p id="store-name-hint" className="text-xs text-apca-subtle mt-1">
              Tu primera tienda se creará automáticamente
            </p>
          </div>

          <div>
            <label htmlFor="store_address" className="block text-sm font-medium text-apca-pass mb-2">
              Dirección de la Tienda <span className="text-apca-subtle">(Opcional)</span>
            </label>
            <input
              id="store_address"
              name="store_address"
              type="text"
              autoComplete="street-address"
              value={formData.store_address}
              onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
              className="input-field"
              placeholder="123 Calle Principal, Ciudad…"
            />
          </div>

          <div>
            <label htmlFor="store_phone" className="block text-sm font-medium text-apca-pass mb-2">
              Teléfono de la Tienda <span className="text-apca-subtle">(Opcional)</span>
            </label>
            <input
              id="store_phone"
              name="store_phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={formData.store_phone}
              onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
              className="input-field"
              placeholder="+52 (555) 123-4567…"
            />
          </div>

          {error && (
            <div
              id="register-error"
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
                <span className="text-sm">{error}</span>
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
            {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-apca-muted">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 hover-contrast font-medium">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

