/**
 * SalesList Component
 * Displays sales in desktop table and mobile card views
 */

import Link from "next/link";
import type { Sale } from "@/types";

interface SalesListProps {
  loading: boolean;
  sales: Sale[];
  formatCurrency: (value: number) => string;
  formatDateTime: (date: Date) => string;
  onDownloadReceipt: (saleId: string) => Promise<void>;
  hasFilters: boolean;
  currentStoreId: string;
}

export function SalesList({
  loading,
  sales,
  formatCurrency,
  formatDateTime,
  onDownloadReceipt,
  hasFilters,
}: SalesListProps) {
  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm sm:text-base text-foreground-muted mt-4">
          Cargando ventas...
        </p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
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
          {hasFilters
            ? "No se encontraron ventas con los filtros aplicados"
            : "No hay ventas registradas aún"}
        </p>
      </div>
    );
  }

  return (
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
                      onClick={() => onDownloadReceipt(s.id)}
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
                onClick={() => onDownloadReceipt(s.id)}
                className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors active:scale-95"
              >
                Descargar 
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
    </>
  );
}
