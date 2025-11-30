// src/app/products/components/Pagination.tsx

import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalProducts,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
      <div className="text-xs sm:text-sm text-foreground-muted">
        Página {currentPage} de {totalPages} ({totalProducts} productos)
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
