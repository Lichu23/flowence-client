// src/app/products/components/ProductStats.tsx

import { FC } from 'react';

interface ProductStatsProps {
  stats: {
    total_products: number;
    total_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  formatCurrency: (value: number) => string;
  totalProducts: number;
  debouncedSearch: string;
}

export const ProductStats: FC<ProductStatsProps> = ({
  stats,
  formatCurrency,
  totalProducts,
  debouncedSearch,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Total Productos</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total_products}</p>
        {debouncedSearch && (
          <p className="text-xs text-primary mt-1">({totalProducts} encontrados)</p>
        )}
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Valor Total</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(stats.total_value)}</p>
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Stock Bajo</p>
        <p className="text-xl sm:text-2xl font-bold text-warning">{stats.low_stock_count}</p>
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Sin Stock</p>
        <p className="text-xl sm:text-2xl font-bold text-error">{stats.out_of_stock_count}</p>
      </div>
    </div>
  );
};
