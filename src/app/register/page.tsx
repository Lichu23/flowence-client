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
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Flowence</h1>
          <p className="text-foreground-muted mt-2">Crea tu cuenta</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Tu Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
            />
            <p className="text-xs text-foreground-subtle mt-1">
              Debe tener al menos 8 caracteres con mayúscula, minúscula, número y carácter especial
            </p>
          </div>

          <div>
            <label htmlFor="store_name" className="block text-sm font-medium text-foreground mb-2">
              Nombre de la Primera Tienda
            </label>
            <input
              id="store_name"
              type="text"
              required
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="input-field"
              placeholder="Mi Tienda"
            />
            <p className="text-xs text-foreground-subtle mt-1">
              Tu primera tienda se creará automáticamente
            </p>
          </div>

          <div>
            <label htmlFor="store_address" className="block text-sm font-medium text-foreground mb-2">
              Dirección de la Tienda <span className="text-foreground-subtle">(Opcional)</span>
            </label>
            <input
              id="store_address"
              type="text"
              value={formData.store_address}
              onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
              className="input-field"
              placeholder="123 Calle Principal, Ciudad, Estado CP"
            />
          </div>

          <div>
            <label htmlFor="store_phone" className="block text-sm font-medium text-foreground mb-2">
              Teléfono de la Tienda <span className="text-foreground-subtle">(Opcional)</span>
            </label>
            <input
              id="store_phone"
              type="tel"
              value={formData.store_phone}
              onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
              className="input-field"
              placeholder="+52 (555) 123-4567"
            />
          </div>

          {error && (
            <div className="bg-error/10 backdrop-blur-sm border border-error/30 text-foreground px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-foreground-muted">
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

