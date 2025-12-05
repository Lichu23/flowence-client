import { FC, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EmployeesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalEmployees: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const EmployeesPaginationComponent: FC<EmployeesPaginationProps> = ({
  currentPage,
  totalPages,
  totalEmployees,
  onPageChange,
  loading = false,
}) => {
  // Don't show pagination if there are no employees
  if (totalEmployees === 0) {
    return null;
  }

  const isPreviousDisabled = currentPage === 1 || loading;
  const isNextDisabled = currentPage === totalPages || loading;
  const showButtons = totalPages > 1;

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Page Information */}
        <div
          className="text-xs sm:text-sm text-foreground-muted text-center sm:text-left"
          role="status"
          aria-live="polite"
        >
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          <span className="hidden sm:inline"> • {totalEmployees} empleados</span>
        </div>

        {/* Navigation Buttons */}
        {showButtons && (
          <nav
            className="flex gap-2"
            role="navigation"
            aria-label="Paginación de empleados"
          >
            <button
              onClick={() => !isPreviousDisabled && onPageChange(currentPage - 1)}
              disabled={isPreviousDisabled}
              aria-label="Página anterior"
              className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
              disabled={isNextDisabled}
              aria-label="Página siguiente"
              className="btn-secondary px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>

      {/* Mobile-only count */}
      <div className="sm:hidden text-xs text-foreground-muted text-center mt-2">
        {totalEmployees} empleados en total
      </div>
    </div>
  );
};

export const EmployeesPagination = memo(EmployeesPaginationComponent);