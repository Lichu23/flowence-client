'use client';

/**
 * ProtectedRoute - Wrapper component for authenticated routes
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Allowed roles for this route. If not specified, any authenticated user can access.
   */
  allowedRoles?: ('owner' | 'employee')[];
  /**
   * Redirect path if user doesn't have the required role
   */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { currentStore, loading: storeLoading } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading || storeLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role-based access
    if (allowedRoles && user) {
      const hasAccess = allowedRoles.includes(user.role as 'owner' | 'employee');
      if (!hasAccess) {
        router.replace(redirectTo);
        return;
      }
    }

    // Business size validation for owners (except on onboarding pages)
    if (user?.role === 'owner' && !pathname?.startsWith('/onboarding')) {
      if (currentStore && !currentStore.business_size) {
        console.log('[ProtectedRoute] 🔄 Owner needs to select business size, redirecting to onboarding');
        router.replace('/onboarding/business-size');
        return;
      }
    }
  }, [isAuthenticated, authLoading, storeLoading, user, currentStore, allowedRoles, redirectTo, pathname, router]);

  // Show loading state while checking authentication and store
  if (authLoading || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-foreground-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Don't render children if user doesn't have required role
  if (allowedRoles && user) {
    const hasAccess = allowedRoles.includes(user.role as 'owner' | 'employee');
    if (!hasAccess) {
      return null;
    }
  }

  // Don't render if owner needs to complete business size onboarding
  if (user?.role === 'owner' && !pathname?.startsWith('/onboarding')) {
    if (currentStore && !currentStore.business_size) {
      return null;
    }
  }

  return <>{children}</>;
}

