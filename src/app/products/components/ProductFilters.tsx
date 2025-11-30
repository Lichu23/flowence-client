// src/app/products/components/ProductFilters.tsx

import { FC, ChangeEvent } from 'react';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  showLowStock: boolean;
  onLowStockToggle: () => void;
  debouncedSearch: string;
  onPageReset: () => void;
}

export const ProductFilters: FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showLowStock,
  onLowStockToggle,
  debouncedSearch,
  onPageReset,
}) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    onPageReset();
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
    onPageReset();
  };

  const handleLowStockToggle = () => {
    onLowStockToggle();
    onPageReset();
  };

  return (
    <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por nombre, código de barras o SKU..."
                value={search}
                onChange={handleSearchChange}
                className="input-field w-full text-sm sm:text-base"
              />
              {/* Loading indicator while debouncing */}
              {search !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="input-field w-full text-sm sm:text-base"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={handleLowStockToggle}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              showLowStock
                ? 'bg-warning/10 text-warning border-2 border-warning/30'
                : 'btn-secondary'
            }`}
          >
            Stock Bajo
          </button>
        </div>
      </div>
    </div>
  );
};
