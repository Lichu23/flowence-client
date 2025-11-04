'use client';

/**
 * ProtectedRoute - Wrapper component for authenticated routes
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

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
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

  return <>{children}</>;
}

