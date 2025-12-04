/**
 * SalesPagination Component
 * Pagination controls for sales list
 */

interface SalesPaginationProps {
  page: number;
  pages: number;
  totalSales: number;
  onPageChange: (page: number) => void;
}

export function SalesPagination({
  page,
  pages,
  totalSales,
  onPageChange,
}: SalesPaginationProps) {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-border flex items-center justify-between">
      <div className="text-xs sm:text-sm text-foreground-muted">
        Página {page} de {pages} ({totalSales} ventas)
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="btn-secondary px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
