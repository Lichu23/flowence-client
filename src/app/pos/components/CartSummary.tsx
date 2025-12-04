// src/app/pos/components/CartSummary.tsx

import { FC } from "react";

interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  formatCurrency: (value: number) => string;
  onCheckout: () => void;
  loading: boolean;
  hasItems: boolean;
}

export const CartSummary: FC<CartSummaryProps> = ({
  totalItems,
  subtotal,
  tax,
  total,
  formatCurrency,
  onCheckout,
  loading,
  hasItems,
}) => {
  return (
    <div className="border-t border-border pt-4 mt-4">
      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-muted">Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
          <span className="tabular-nums text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        {tax > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">IVA</span>
            <span className="tabular-nums text-foreground">{formatCurrency(tax)}</span>
          </div>
        )}
        <div className="h-px bg-border my-2"></div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span className="text-foreground">Total</span>
          <span className="tabular-nums text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={!hasItems || loading}
        className="w-full px-4 py-3 md:py-4 text-base md:text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "Validando..." : "Cobrar"}
      </button>
    </div>
  );
};
