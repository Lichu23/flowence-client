'use client';

/**
 * Accept Invitation Page
 * Public page for employees to accept invitations and create accounts
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { invitationApi } from '@/lib/api';
import { InvitationValidation } from '@/types';
import Link from 'next/link';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [validation, setValidation] = useState<InvitationValidation | null>(null);
  const [validating, setValidating] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setValidating(false);
      setError('Token de invitación no proporcionado');
    }
  }, [token]);

  const validateToken = async (token: string) => {
    try {
      const result = await invitationApi.validate(token);
      setValidation(result);
      
      if (!result.valid) {
        setValidating(false);
      }
    } catch {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token de invitación no encontrado');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await invitationApi.accept({
        token,
        name,
        password,
      });

      // Save token and user data in localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      console.log('✅ Invitation accepted, user created and logged in');
      console.log('👤 User:', result.user);
      
      // Force a full page reload to initialize AuthContext with new credentials
      // This ensures the ProtectedRoute sees the authenticated state
      window.location.href = '/dashboard';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al aceptar la invitación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground-muted mt-4">Validando invitación...</p>
        </div>
      </div>
    );
  }

  if (!validation || !validation.valid) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <svg className="w-16 h-16 text-error mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-foreground mb-2">Invitación Inválida</h2>
          <p className="text-foreground-muted mb-6">{error || 'Esta invitación ha expirado o no es válida'}</p>
          <Link
            href="/login"
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all inline-block"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Flowence</h1>
          <p className="text-foreground-muted mt-2">Crear Cuenta de Empleado</p>
        </div>

        {/* Invitation Info */}
        <div className="glass-card bg-info/10 border-info/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-info font-medium">Has sido invitado a:</p>
          <p className="text-lg font-bold text-info mt-1">{validation.store?.name}</p>
          <p className="text-sm text-foreground-muted mt-1">
            Email: {validation.invitation?.email}
          </p>
          <p className="text-sm text-foreground-muted">
            Rol: {validation.invitation?.role}
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Tu Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              placeholder="Juan Pérez"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
            <p className="text-xs text-foreground-subtle mt-1">
              Mínimo 8 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="glass-card bg-error/10 border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta y Aceptar'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-foreground-muted">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium hover-contrast">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground-muted mt-4">Cargando...</p>
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

