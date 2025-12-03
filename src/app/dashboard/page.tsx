'use client';

/**
 * Dashboard Page
 */

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useStore } from '@/contexts/StoreContext';
import { dashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MultiStoreOverview } from '@/components/dashboard/MultiStoreOverview';
import { HelpButton } from '@/components/help/HelpModal';

function DashboardContent() {
  const { currentStore, stores } = useStore();
  const { formatCurrency } = useSettings();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defectiveCount, setDefectiveCount] = useState(0);
  const [showDefectiveModal, setShowDefectiveModal] = useState(false);
  const [defectiveProducts, setDefectiveProducts] = useState<Array<{ product_id: string; product_name: string; total_defective: number; last_return_date: string; monetary_loss: number }>>([]);
  const [loadingDefective, setLoadingDefective] = useState(false);
  const [showMonthlyView, setShowMonthlyView] = useState(false);

  // Fetch dashboard stats when store changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentStore) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getStats(currentStore.id);
        setStats(data);
        
        // Fetch defective products count
        const defective = await dashboardApi.getDefectiveProducts(currentStore.id);
        setDefectiveCount(defective.products.length);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentStore]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Multi-Store Overview (shown when user has multiple stores and main stats are loaded) */}
        {stores.length > 1 && !loading && stats && (
          <div className="mb-6 sm:mb-8">
            <MultiStoreOverview />
          </div>
        )}

        {currentStore ? (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
               {currentStore.name}
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {/* Loading State */}
              {loading && (
                <div className="col-span-full">
                  <div className="glass-card p-6">
                    <LoadingSpinner size="md" text="Cargando estadísticas..." />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="col-span-full">
                  <ErrorMessage 
                    title="Error al cargar estadísticas" 
                    message={error}
                    onRetry={() => window.location.reload()}
                  />
                </div>
              )}

              {/* Stats Cards - Only show when data is loaded */}
              {!loading && !error && stats && (
                <>
                  <div className="glass-card p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Total Productos</p>
                        <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{stats.totalProducts.toLocaleString()}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-info/10 rounded-lg self-end sm:self-auto">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Ventas {stats.currentMonth || 'Mes Actual'}</p>
                        <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{(stats.monthlySales ?? stats.totalSales).toLocaleString()}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-success/10 rounded-lg self-end sm:self-auto">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Ingresos {stats.currentMonth || 'Mes Actual'}</p>
                        <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.monthlyRevenue ?? stats.revenue)}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg self-end sm:self-auto">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Empleados</p>
                        <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">{stats.employees.toLocaleString()}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-warning/10 rounded-lg self-end sm:self-auto">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Additional Stats for Owners */}
            {!loading && !error && stats && (
              <div className="mb-6 sm:mb-8">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Métricas Operativas</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMonthlyView(!showMonthlyView)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-colors ${
                        showMonthlyView
                          ? 'text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:scale-105 active:scale-95'
                          : 'btn-secondary'
                      }`}
                    >
                      {showMonthlyView ? 'Vista Mensual' : 'Vista General'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {/* Total Losses from Defective Products */}
                  {stats.totalLosses !== undefined && (
                    <div className="glass-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground-muted">Pérdidas Totales</p>
                          <p className="text-xl sm:text-2xl font-bold text-error mt-1">{formatCurrency(stats.totalLosses)}</p>
                          <p className="text-xs text-foreground-subtle mt-1">Productos defectuosos</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-error/10 rounded-lg self-end sm:self-auto">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Refunded Orders */}
                  {stats.refundedOrders !== undefined && (
                    <div className="glass-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground-muted">Órdenes Reembolsadas</p>
                          <p className="text-xl sm:text-2xl font-bold text-warning mt-1">{stats.refundedOrders.toLocaleString()}</p>
                          <p className="text-xs text-foreground-subtle mt-1">Total de devoluciones</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-warning/10 rounded-lg self-end sm:self-auto">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Revenue */}
                  {stats.overallRevenue !== undefined && (
                    <div className="glass-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground-muted">
                            {showMonthlyView ? 'Ingresos Mensuales' : 'Ingresos Totales'}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-success mt-1">
                            {formatCurrency(showMonthlyView ? (stats.monthlyRevenue || 0) : stats.overallRevenue)}
                          </p>
                          <p className="text-xs text-foreground-subtle mt-1">
                            {showMonthlyView ? stats.currentMonth || 'Mes actual' : 'Todos los tiempos'}
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-success/10 rounded-lg self-end sm:self-auto">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Expenses */}
                  {stats.overallExpenses !== undefined && (
                    <div className="glass-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground-muted">
                            {showMonthlyView ? 'Gastos Mensuales' : 'Gastos Totales'}
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">
                            {formatCurrency(showMonthlyView ? (stats.monthlyExpenses || 0) : stats.overallExpenses)}
                          </p>
                          <p className="text-xs text-foreground-subtle mt-1">
                            {showMonthlyView ? stats.currentMonth || 'Mes actual' : 'Todos los tiempos'}
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg self-end sm:self-auto">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Existing Additional Stats */}
            {!loading && !error && stats && (stats.lowStockProducts !== undefined || stats.totalValue !== undefined) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {stats.lowStockProducts !== undefined && (
                  <div className="glass-card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Productos Stock Bajo</p>
                        <p className="text-xl sm:text-2xl font-bold text-warning mt-1">{stats.lowStockProducts.toLocaleString()}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-warning/10 rounded-lg self-end sm:self-auto">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {stats.monthlyExpenses !== undefined && (
                  <div className="glass-card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground-muted">Gastos {stats.currentMonth || 'Mes Actual'}</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(stats.monthlyExpenses)}</p>
                        <p className="text-xs text-foreground-subtle mt-1">Productos comprados este mes</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-900/30 rounded-lg self-end sm:self-auto">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Defective Products Card */}
                <button
                  onClick={async () => {
                    if (!currentStore) return;
                    setShowDefectiveModal(true);
                    setLoadingDefective(true);
                    try {
                      const data = await dashboardApi.getDefectiveProducts(currentStore.id);
                      setDefectiveProducts(data.products);
                    } catch (err) {
                      console.error('Error fetching defective products:', err);
                    } finally {
                      setLoadingDefective(false);
                    }
                  }}
                  className="glass-card p-4 sm:p-6 hover:border-error/30 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground-muted">Productos Defectuosos</p>
                      <p className="text-xl sm:text-2xl font-bold text-error mt-1">{defectiveCount.toLocaleString()}</p>
                      <p className="text-xs text-foreground-subtle mt-1">Click para ver detalles</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-error/10 rounded-lg self-end sm:self-auto">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            )}

           

            {/* Multi-Store Info */}
            {stores.length > 1 && (
              <div className="mt-4 sm:mt-6 glass-card p-3 sm:p-4 border-purple-500/30 bg-purple-900/30">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-foreground text-sm sm:text-base">Tienes {stores.length} tiendas</h4>
                    <p className="text-xs sm:text-sm text-foreground-muted mt-1">
                      Usa el selector de tiendas en la parte superior para cambiar entre tus tiendas. Cada tienda tiene inventario y ventas independientes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-foreground-subtle mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">Ninguna tienda seleccionada</h3>
            <p className="text-sm sm:text-base text-foreground-muted mb-4 px-4">Por favor selecciona una tienda del menú desplegable de arriba</p>
          </div>
        )}
      </main>

      {/* Defective Products Modal */}
      {showDefectiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDefectiveModal(false)}>
          <div className="glass-card max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Productos Defectuosos</h2>
              <button
                onClick={() => setShowDefectiveModal(false)}
                className="text-foreground-subtle hover:text-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingDefective ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-foreground-muted">Cargando...</p>
                </div>
              ) : defectiveProducts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-success mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-foreground-muted">¡No hay productos defectuosos registrados!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {defectiveProducts.map((product) => (
                    <div key={product.product_id} className="glass-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{product.product_name}</h3>
                          <p className="text-sm text-foreground-muted mt-1">
                            Total defectuoso: <span className="font-medium text-error">{product.total_defective}</span> unidades
                          </p>
                          <p className="text-sm text-foreground-muted mt-1">
                            Pérdida monetaria: <span className="font-medium text-error">{formatCurrency(product.monetary_loss)}</span>
                          </p>
                          <p className="text-xs text-foreground-subtle mt-1">
                            Última devolución: {new Date(product.last_return_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className="badge bg-error/10 text-error border-error/20">
                            Defectuoso
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']} redirectTo="/pos">
      <DashboardContent />
    </ProtectedRoute>
  );
}

