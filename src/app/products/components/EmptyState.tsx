// src/app/products/components/EmptyState.tsx

import { FC } from 'react';
import { CheckCircle, Search, Package } from 'lucide-react';
import type { User } from '@/types';

interface EmptyStateProps {
  showLowStock: boolean;
  hasSearchFilters: boolean;
  searchTerm: string;
  category: string;
  user: User | null;
  onCreateClick: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({
  showLowStock,
  hasSearchFilters,
  searchTerm,
  category,
  user,
  onCreateClick,
}) => {
  if (showLowStock) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-success mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-foreground-muted">¡Excelente! No hay productos con stock bajo</p>
        <p className="text-xs sm:text-sm text-foreground-subtle mt-2">Todos tus productos tienen stock suficiente</p>
      </div>
    );
  }

  if (hasSearchFilters) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <Search className="w-12 h-12 sm:w-16 sm:h-16 text-foreground-subtle mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-foreground-muted">No se encontraron productos</p>
        <p className="text-xs sm:text-sm text-foreground-subtle mt-2">
          {searchTerm && category
            ? `con "${searchTerm}" en la categoría "${category}"`
            : searchTerm
              ? `que coincidan con "${searchTerm}"`
              : `en la categoría "${category}"`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 text-center">
      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-foreground-subtle mx-auto mb-3 sm:mb-4" />
      <p className="text-sm sm:text-base text-foreground-muted mb-4">No hay productos aún</p>
      {user?.role === 'owner' && (
        <button
          onClick={onCreateClick}
          className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all"
        >
          Crear Primer Producto
        </button>
      )}
    </div>
  );
};
