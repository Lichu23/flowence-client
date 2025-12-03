'use client';

/**
 * Business Size Selection Page
 *
 * Shows after owner creates their first store.
 * Allows selection between small business (individual/small teams)
 * or medium/large business (multiple locations).
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { storeApi } from '@/lib/api';
import { Store, Building2, ArrowRight } from 'lucide-react';

export default function BusinessSizePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { currentStore, refreshStores } = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium_large' | null>(null);

  // Redirect if user is not owner or already has business_size set
  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.push('/dashboard');
      return;
    }

    if (currentStore?.business_size) {
      router.push('/dashboard');
      return;
    }
  }, [user, currentStore, router]);

  const handleSelection = async (size: 'small' | 'medium_large') => {
    if (!currentStore) return;

    console.log('[BusinessSizePage] 🚀 Starting business size selection:', {
      storeId: currentStore.id,
      size,
      storeName: currentStore.name
    });

    setLoading(true);
    try {
      console.log('[BusinessSizePage] 📞 Calling setBusinessSize API...');
      const result = await storeApi.setBusinessSize(currentStore.id, size);
      console.log('[BusinessSizePage] ✅ API call successful:', result);

      console.log('[BusinessSizePage] 🔄 Refreshing user data...');
      await refreshUser();

      console.log('[BusinessSizePage] 🔄 Refreshing stores...');
      await refreshStores();

      console.log('[BusinessSizePage] ✅ Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('[BusinessSizePage] ❌ Error setting business size:', error);

      // Extract error message if available
      let errorMessage = 'Error al configurar el tamaño del negocio. Por favor intenta nuevamente.';
      if (error instanceof Error) {
        errorMessage += `\n\nDetalles: ${error.message}`;
      }

      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-fuchsia-900/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ¿Qué tipo de negocio tienes?
          </h1>
          <p className="text-base md:text-lg text-foreground-muted">
            Selecciona la opción que mejor describa tu negocio para personalizar tu experiencia
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Small Business Card */}
          <div
            onClick={() => !loading && setSelectedSize('small')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                e.preventDefault();
                setSelectedSize('small');
              }
            }}
            aria-disabled={loading}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedSize === 'small'
                ? 'border-primary bg-primary/10 shadow-lg-ambient shadow-lg-direct'
                : 'border-border-light hover:border-primary/50 hover:bg-primary/5'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
            `}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Negocio Pequeño
                </h2>
                <p className="text-sm text-foreground-muted">
                  Perfecto para tiendas individuales y equipos pequeños
                </p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Acceso al sistema de punto de venta (POS)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Panel de control con métricas de ventas
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Gestión de productos e inventario
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Invitaciones para empleados
                </span>
              </li>
            </ul>

            {selectedSize === 'small' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection('small');
                }}
                disabled={loading}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Medium/Large Business Card */}
          <div
            onClick={() => !loading && setSelectedSize('medium_large')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                e.preventDefault();
                setSelectedSize('medium_large');
              }
            }}
            aria-disabled={loading}
            className={`
              relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
              ${selectedSize === 'medium_large'
                ? 'border-primary bg-primary/10 shadow-lg-ambient shadow-lg-direct'
                : 'border-border-light hover:border-primary/50 hover:bg-primary/5'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
            `}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Negocio Mediano/Grande
                </h2>
                <p className="text-sm text-foreground-muted">
                  Ideal para negocios en crecimiento con múltiples ubicaciones
                </p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Panel de control avanzado con análisis
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Gestión de productos e inventario
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Historial de ventas y reportes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground">
                  Sistema de invitaciones para empleados
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-sm text-foreground-muted italic">
                  Nota: El POS no está disponible para esta modalidad
                </span>
              </li>
            </ul>

            {selectedSize === 'medium_large' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection('medium_large');
                }}
                disabled={loading}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-muted">
            Puedes cambiar esta configuración más adelante en la configuración de tu tienda
          </p>
        </div>
      </div>
    </div>
  );
}
