// src/app/pos/components/ProductSearchBar.tsx

import { FC } from "react";

interface ProductSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  adding: boolean;
}

export const ProductSearchBar: FC<ProductSearchBarProps> = ({
  search,
  onSearchChange,
  onAddProduct,
  adding,
}) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Agregar producto..."
        className="input-field"
      />
      <div className="flex gap-2">
        <button
          onClick={onAddProduct}
          disabled={adding || !search.trim()}
          className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all flex-1 sm:flex-initial disabled:opacity-50 whitespace-nowrap"
        >
          {adding ? "Agregando..." : "Agregar"}
        </button>
      </div>
    </div>
  );
};
