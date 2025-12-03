'use client';

/**
 * RequireBusinessSize - Wrapper component that ensures owner has selected business size
 *
 * If owner has a store but business_size is null, redirects to /onboarding/business-size
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';

interface RequireBusinessSizeProps {
  children: React.ReactNode;
}

export function RequireBusinessSize({ children }: RequireBusinessSizeProps) {
  const { user } = useAuth();
  const { currentStore, loading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Only check for owners
    if (user?.role !== 'owner') return;

    // If owner has a store but no business_size (null or undefined), redirect to onboarding
    if (currentStore && !currentStore.business_size) {
      console.log('[RequireBusinessSize] 🔄 Redirecting to onboarding - business_size is:', currentStore.business_size);
      router.replace('/onboarding/business-size');
      return;
    }

    if (currentStore?.business_size) {
      console.log('[RequireBusinessSize] ✅ Business size already set:', currentStore.business_size);
    }
  }, [user, currentStore, loading, router]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-foreground-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render if redirecting to onboarding
  if (user?.role === 'owner' && currentStore && !currentStore.business_size) {
    return null;
  }

  return <>{children}</>;
}
