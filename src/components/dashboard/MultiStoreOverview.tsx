'use client';

/**
 * MultiStoreOverview Component - Shows stats across all stores
 */

import { useEffect, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useSettings } from '@/contexts/SettingsContext';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardHeader } from '@/components/ui/Card';

interface StoreStats extends DashboardStats {
  storeName: string;
  storeId: string;
}

export function MultiStoreOverview() {
  const { stores, setCurrentStore } = useStore();
  const { formatCurrency } = useSettings();
  const [allStats, setAllStats] = useState<StoreStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalSummary, setGlobalSummary] = useState<{
    totalEmployees: number;
    totalProfit: number;
    totalRevenue: number;
    totalExpenses: number;
    stores: Array<{
      storeId: string;
      storeName: string;
      month: string;
      expenses: number;
      revenue: number;
      profit: number;
      employees: number;
    }>;
  } | null>(null);
  const [showProfitModal, setShowProfitModal] = useState(false);

  useEffect(() => {
    const fetchAllStats = async () => {
      if (stores.length === 0) {
        setLoading(false);
        return;
      }

      // Check if user is authenticated before making requests
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.warn('No authentication token found, skipping multi-store overview');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch global summary (only for owners with valid auth)
        try {
          const summary = await dashboardApi.getGlobalSummary();
          setGlobalSummary(summary);
        } catch (summaryError) {
          console.error('Error fetching global summary:', summaryError);
          // Don't throw - continue loading individual store stats
          // If it's an auth error, the main dashboard will handle logout
        }

        const statsPromises = stores.map(async (store) => {
          try {
            const stats = await dashboardApi.getStats(store.id);
            return {
              ...stats,
              storeName: store.name,
              storeId: store.id
            };
          } catch (err) {
            console.error(`Error fetching stats for ${store.name}:`, err);
            return {
              storeName: store.name,
              storeId: store.id,
              totalProducts: 0,
              totalSales: 0,
              revenue: 0,
              employees: 0,
              lowStockProducts: 0,
              totalValue: 0
            };
          }
        });

        const results = await Promise.all(statsPromises);
        setAllStats(results);
      } catch (err) {
        console.error('Error fetching multi-store stats:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [stores]);

  if (loading) {
    return (
      <Card>
        <LoadingSpinner size="lg" text="Cargando resumen de tiendas..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorMessage message={error} />
      </Card>
    );
  }

  if (stores.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Global Summary */}
        {globalSummary && (
          <Card>
            <CardHeader 
              title="Resumen Global" 
              subtitle={`Estadísticas de ${stores.length} ${stores.length === 1 ? 'tienda' : 'tiendas'}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <p className="text-sm text-orange-700 font-medium mb-1">Total Empleados</p>
                <p className="text-2xl font-bold text-orange-900">{globalSummary.totalEmployees.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">Todas las tiendas</p>
              </div>
              <button
                onClick={() => setShowProfitModal(true)}
                className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg hover:shadow-lg transition-all text-left"
              >
                <p className="text-sm text-green-700 font-medium mb-1">Ganancia Total</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(globalSummary.totalProfit)}</p>
                <p className="text-xs text-green-600 mt-1">Click para ver desglose →</p>
              </button>
            </div>
          </Card>
        )}

      {/* Individual Store Cards */}
      <Card>
        <CardHeader title="Tiendas Individuales" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStats.map((stats) => (
            <button
              key={stats.storeId}
              onClick={() => {
                const store = stores.find(s => s.id === stats.storeId);
                if (store) setCurrentStore(store);
              }}
              className="text-left bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all active:scale-98"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg truncate flex-1">
                  {stats.storeName}
                </h3>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productos</span>
                  <span className="font-semibold text-gray-900">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventas</span>
                  <span className="font-semibold text-gray-900">{stats.totalSales}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ingresos</span>
                  <span className="font-semibold text-green-600">{formatCurrency(stats.revenue)}</span>
                </div>
                {(stats.lowStockProducts ?? 0) > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-orange-600">Stock Bajo</span>
                    <span className="font-semibold text-orange-600">{stats.lowStockProducts}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>
      </div>

      {/* Profit Breakdown Modal */}
      {showProfitModal && globalSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfitModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Desglose de Ganancias</h2>
                <p className="text-sm text-gray-600 mt-1">{globalSummary.stores[0]?.month || 'Mes Actual'}</p>
              </div>
              <button
                onClick={() => setShowProfitModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Ingresos Totales</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(globalSummary.totalRevenue)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">Gastos Totales</p>
                  <p className="text-xl font-bold text-red-900 mt-1">{formatCurrency(globalSummary.totalExpenses)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Ganancia Total</p>
                  <p className="text-xl font-bold text-green-900 mt-1">{formatCurrency(globalSummary.totalProfit)}</p>
                </div>
              </div>

              {/* Per-Store Breakdown */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tienda</h3>
              <div className="space-y-3">
                {globalSummary.stores.map((store) => (
                  <div key={store.storeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{store.storeName}</h4>
                        <p className="text-xs text-gray-500 mt-1">{store.employees} empleado{store.employees !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${store.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(store.profit)}
                        </p>
                        <p className="text-xs text-gray-500">Ganancia</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Ingresos</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(store.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gastos</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(store.expenses)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
