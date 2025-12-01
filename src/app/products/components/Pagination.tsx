// src/app/products/components/Pagination.tsx

import { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalProducts,
  onPageChange,
  loading = false,
}) => {
  // Don't show pagination if there's only one page or no products
  if (totalPages <= 1) {
    return null;
  }

  const isPreviousDisabled = currentPage === 1 || loading;
  const isNextDisabled = currentPage === totalPages || loading;

  const handlePrevious = () => {
    if (!isPreviousDisabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isNextDisabled) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Page Information */}
        <div className="text-xs sm:text-sm text-foreground-muted text-center sm:text-left">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              Cargando...
            </span>
          ) : (
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              <span className="hidden sm:inline"> ({totalProducts} productos)</span>
            </span>
          )}
        </div>

        {/* Navigation Buttons */}
        <nav
          className="flex gap-2"
          role="navigation"
          aria-label="Paginación de productos"
        >
          <button
            onClick={handlePrevious}
            disabled={isPreviousDisabled}
            aria-label="Página anterior"
            aria-disabled={isPreviousDisabled}
            className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            aria-label="Página siguiente"
            aria-disabled={isNextDisabled}
            className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </nav>
      </div>

      {/* Mobile-only product count */}
      {!loading && (
        <div className="sm:hidden text-xs text-foreground-muted text-center mt-2">
          {totalProducts} productos en total
        </div>
      )}
    </div>
  );
};
