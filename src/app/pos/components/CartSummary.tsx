// src/app/pos/components/CartSummary.tsx

import { FC } from "react";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  total: number;
  formatCurrency: (value: number) => string;
  onCheckout: () => void;
  loading: boolean;
  hasItems: boolean;
}

export const CartSummary: FC<CartSummaryProps> = ({
  totalItems,
  subtotal,
  total,
  formatCurrency,
  onCheckout,
  loading,
  hasItems,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Carrito Temporal</h2>
        <span className="text-sm text-foreground-muted">
          Artículos: {totalItems}
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-foreground-muted">
          Subtotal: {formatCurrency(subtotal)} · Total: {formatCurrency(total)}
        </div>
        <button
          onClick={onCheckout}
          disabled={!hasItems || loading}
          className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Validando..." : "Cobrar"}
        </button>
      </div>
    </>
  );
};
