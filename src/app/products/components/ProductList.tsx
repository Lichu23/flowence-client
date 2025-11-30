// src/app/products/components/ProductList.tsx

import { FC } from 'react';
import type { Product, User } from '@/types';
import { ProductTable } from './ProductTable';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  user: User | null;
  formatCurrency: (value: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  filters: {
    showLowStock: boolean;
    searchTerm: string;
    category: string;
  };
  onCreateClick: () => void;
}

export const ProductList: FC<ProductListProps> = ({
  products,
  loading,
  user,
  formatCurrency,
  onEdit,
  onDelete,
  filters,
  onCreateClick,
}) => {
  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm sm:text-base text-foreground-muted mt-4">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    const hasSearchFilters = !!(filters.searchTerm || filters.category);

    return (
      <EmptyState
        showLowStock={filters.showLowStock}
        hasSearchFilters={hasSearchFilters}
        searchTerm={filters.searchTerm}
        category={filters.category}
        user={user}
        onCreateClick={onCreateClick}
      />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <ProductTable
        products={products}
        user={user}
        formatCurrency={formatCurrency}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            user={user}
            formatCurrency={formatCurrency}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
};
