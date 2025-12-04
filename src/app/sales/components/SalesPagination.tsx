/**
 * SalesPagination Component
 * Pagination controls for sales list (matches Products pagination style)
 */

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// First update the interface in SalesPagination.tsx to remove one of the redundant props
interface SalesPaginationProps {
  page: number;         // Current page
  pages: number;        // Total pages
  totalSales: number;   // Total number of sales
  onPageChange: (page: number) => void;
  loading?: boolean;
}


function SalesPaginationComponent({
  page,
  pages,
  totalSales,
  onPageChange,
  loading = false,
}: SalesPaginationProps) {
  // Don't show pagination if there's only one page or no sales
  if (pages <= 1) {
    return null;
  }

  const isPreviousDisabled = page === 1 || loading;
  const isNextDisabled = page === pages || loading;

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Page Information */}
        <div
          className="text-xs sm:text-sm text-foreground-muted text-center sm:text-left"
          role="status"
          aria-live="polite"
        >
          Página <strong>{page}</strong> de <strong>{pages}</strong>
          <span className="hidden sm:inline"> • {totalSales} ventas</span>
        </div>

        {/* Navigation Buttons */}
        <nav
          className="flex gap-2"
          role="navigation"
          aria-label="Paginación de ventas"
        >
          <button
            onClick={() => !isPreviousDisabled && onPageChange(page - 1)}
            disabled={isPreviousDisabled}
            aria-label="Página anterior"
            className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={() => !isNextDisabled && onPageChange(page + 1)}
            disabled={isNextDisabled}
            aria-label="Página siguiente"
            className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* Mobile-only sales count */}
      <div className="sm:hidden text-xs text-foreground-muted text-center mt-2">
        {totalSales} ventas en total
      </div>
    </div>
  );
}

export const SalesPagination = memo(SalesPaginationComponent);
