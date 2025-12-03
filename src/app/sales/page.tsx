"use client";

/**
 * Sales Management Page (Mobile Responsive)
 * Displays all store sales with filtering, search, and statistics
 */

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useStore } from "@/contexts/StoreContext";
import { useEffect, useState, useMemo } from "react";
import { salesApi } from "@/lib/api";
import type { Sale } from "@/types";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { HelpButton } from "@/components/help/HelpModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  return (
    <ProtectedRoute>
      <SalesContent />
    </ProtectedRoute>
  );
}

function SalesContent() {
  const { currentStore } = useStore();
  const { formatCurrency, formatDateTime } = useSettings();
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [method, setMethod] = useState<"cash" | "card" | "mixed" | "">("");
  const [status, setStatus] = useState<
    "completed" | "refunded" | "cancelled" | "pending" | ""
  >("");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate stats from current sales data
  const stats = useMemo(() => {
    // Calculate revenue: only include non-refunded sales (completed, pending, cancelled)
    const totalRevenue = sales.reduce((sum, sale) => {
      const amount = Number(sale.total || 0);
      // Exclude refunded sales completely from revenue calculation
      if (sale.payment_status === "refunded") {
        return sum; // Don't add refunded sales
      }
      return sum + amount; // Add all other sales
    }, 0);

    const completedSales = sales.filter(
      (s) => s.payment_status === "completed"
    );
    const cashSales = sales.filter((s) => s.payment_method === "cash").length;
    const cardSales = sales.filter((s) => s.payment_method === "card").length;

    return {
      totalRevenue,
      totalSales: sales.length,
      completedSales: completedSales.length,
      cashSales,
      cardSales,
    };
  }, [sales]);

  useEffect(() => {
    if (!currentStore) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await salesApi.list(currentStore.id, {
          page,
          limit: 20,
          payment_method: method || undefined,
          payment_status: status || undefined,
        });
        setSales(data.sales);
        setPages(data.pagination.pages);
        setTotalSales(data.pagination.total);
      } catch (e) {
        console.error(e);
        setSales([]);
        setPages(0);
        setTotalSales(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentStore, page, method, status]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Ingresa un número de ticket o código de barras");
      return;
    }
    setLoading(true);
    try {
      const result = await salesApi.searchByTicket(
        currentStore!.id,
        searchTerm.trim()
      );
      router.push(`/sales/${result.sale.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Venta no encontrada");
    } finally {
      setLoading(false);
    }
  };

  if (!currentStore) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-foreground-muted">
            Selecciona una tienda para ver las ventas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ventas
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass-card p-3 sm:p-4">
            <p className="text-xs text-foreground-muted mb-1">Total Ventas</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {totalSales}
            </p>
            {(method || status) && (
              <p className="text-xs text-primary mt-1">
                ({stats.totalSales} en página)
              </p>
            )}
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-xs text-foreground-muted mb-1">Ingresos Totales</p>
            <p className="text-xl sm:text-2xl font-bold text-success">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-xs text-foreground-muted mb-1">Efectivo</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {stats.cashSales}
            </p>
          </div>
          <div className="glass-card p-3 sm:p-4">
            <p className="text-xs text-foreground-muted mb-1">Tarjeta</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {stats.cardSales}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Buscar por Ticket/Código
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Número de recibo o código de barras"
                  className="input-field flex-1 text-sm sm:text-base"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Method Filter */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Método de Pago
              </label>
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value as "cash" | "card" | "mixed" | "");
                  setPage(1);
                }}
                className="input-field w-full text-sm sm:text-base"
              >
                <option value="">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(
                    e.target.value as
                      | "completed"
                      | "refunded"
                      | "cancelled"
                      | "pending"
                      | ""
                  );
                  setPage(1);
                }}
                className="input-field w-full text-sm sm:text-base"
              >
                <option value="">Todos</option>
                <option value="completed">Completado</option>
                <option value="refunded">Reintegrado</option>
                <option value="cancelled">Cancelado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="glass-card">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm sm:text-base text-foreground-muted mt-4">
                Cargando ventas...
              </p>
            </div>
          ) : sales.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 text-foreground-subtle mx-auto mb-3 sm:mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm sm:text-base text-foreground-muted">
                {method || status
                  ? "No se encontraron ventas con los filtros aplicados"
                  : "No hay ventas registradas aún"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
                        Recibo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
                        Método
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sales.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {formatDateTime(new Date(s.created_at))}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-foreground">
                            {s.receipt_number}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge ${
                              s.payment_method === "cash"
                                ? "bg-success/10 text-success border-success/20"
                                : s.payment_method === "card"
                                ? "bg-info/10 text-info border-info/20"
                                : "bg-purple-900/30 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {s.payment_method === "cash"
                              ? "Efectivo"
                              : s.payment_method === "card"
                              ? "Tarjeta"
                              : "Mixto"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge ${
                              s.payment_status === "completed"
                                ? "bg-success/10 text-success border-success/20"
                                : s.payment_status === "refunded"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : s.payment_status === "cancelled"
                                ? "bg-error/10 text-error border-error/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {s.payment_status === "completed"
                              ? "Completado"
                              : s.payment_status === "refunded"
                              ? "Reintegrado"
                              : s.payment_status === "cancelled"
                              ? "Cancelado"
                              : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(Number(s.total))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={async () => {
                                try {
                                  await salesApi.downloadReceipt(
                                    currentStore.id,
                                    s.id
                                  );
                                  toast.success("Recibo descargado");
                                } catch (error) {
                                  console.error(
                                    "Failed to download receipt:",
                                    error
                                  );
                                  toast.error("Error al descargar recibo");
                                }
                              }}
                              className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded text-sm transition-colors"
                            >
                              PDF
                            </button>
                            <Link
                              href={`/sales/${s.id}`}
                              className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded text-sm transition-colors"
                            >
                              Detalles
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-border">
                {sales.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {s.receipt_number}
                        </h3>
                        <p className="text-xs text-foreground-subtle mt-0.5">
                          {formatDateTime(new Date(s.created_at))}
                        </p>
                      </div>
                      <span
                        className={`badge flex-shrink-0 ${
                          s.payment_status === "completed"
                            ? "bg-success/10 text-success border-success/20"
                            : s.payment_status === "refunded"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : s.payment_status === "cancelled"
                            ? "bg-error/10 text-error border-error/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                      >
                        {s.payment_status === "completed"
                          ? "Completado"
                          : s.payment_status === "refunded"
                          ? "Reintegrado"
                          : s.payment_status === "cancelled"
                          ? "Cancelado"
                          : "Pendiente"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="glass-card p-2">
                        <p className="text-xs text-foreground-muted">Total</p>
                        <p className="text-base font-bold text-foreground">
                          {formatCurrency(Number(s.total))}
                        </p>
                      </div>
                      <div className="glass-card p-2">
                        <p className="text-xs text-foreground-muted">Método</p>
                        <p className="text-base font-medium text-foreground">
                          {s.payment_method === "cash"
                            ? "Efectivo"
                            : s.payment_method === "card"
                            ? "Tarjeta"
                            : "Mixto"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button
                        onClick={async () => {
                          try {
                            await salesApi.downloadReceipt(
                              currentStore.id,
                              s.id
                            );
                            toast.success("Recibo descargado");
                          } catch (error) {
                            console.error("Failed to download receipt:", error);
                            toast.error("Error al descargar recibo");
                          }
                        }}
                        className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors active:scale-95"
                      >
                        Descargar PDF
                      </button>
                      <Link
                        href={`/sales/${s.id}`}
                        className="btn-secondary flex-1 px-3 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors active:scale-95 text-center"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-foreground-muted">
                    Página {page} de {pages} ({totalSales} ventas)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}
