// src/app/products/components/Pagination.tsx

import { FC, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

/**
 * Pagination Component - Optimized for zero flicker
 *
 * This component is memoized and never shows loading states to ensure
 * the pagination text ("Page X of Y • Z products") remains stable and
 * never flickers during page navigation.
 *
 * The parent component handles caching, so navigation between pages
 * is instant without re-fetching already-visited pages.
 */
const PaginationComponent: FC<PaginationProps> = ({
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
        {/* Page Information - Always visible, never replaced with loading state */}
        <div
          className="text-xs sm:text-sm text-foreground-muted text-center sm:text-left"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            <span className="hidden sm:inline"> • {totalProducts} productos</span>
          </span>
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

      {/* Mobile-only product count - Always visible */}
      <div className="sm:hidden text-xs text-foreground-muted text-center mt-2">
        {totalProducts} productos en total
      </div>
    </div>
  );
};

PaginationComponent.displayName = 'Pagination';

export const Pagination = memo(PaginationComponent);
