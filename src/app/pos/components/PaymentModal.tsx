// src/app/pos/components/PaymentModal.tsx

import { FC, useEffect } from "react";
import { X } from "lucide-react";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CashPaymentForm } from "./CashPaymentForm";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "cash" | "card";
  onPaymentMethodChange: (method: "cash" | "card") => void;
  amount: string;
  onAmountChange: (value: string) => void;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  change: number;
  formatCurrency: (value: number) => string;
  onConfirmPayment: () => void;
  loading: boolean;
  hasItems: boolean;
}

export const PaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  onPaymentMethodChange,
  amount,
  onAmountChange,
  subtotal,
  tax,
  taxRate,
  total,
  change,
  formatCurrency,
  onConfirmPayment,
  loading,
  hasItems,
}) => {
  // Handle ESC key to close modal (accessibility)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="glass-card max-w-sm sm:max-w-md w-full p-4 sm:p-6" role="document">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3
            id="payment-modal-title"
            className="text-base sm:text-lg font-bold text-foreground"
          >
            Cobrar ({paymentMethod === "cash" ? "Efectivo" : "Tarjeta"})
          </h3>
          <button
            onClick={onClose}
            className="text-foreground-subtle hover:text-foreground text-xl sm:text-2xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cerrar modal de pago"
            type="button"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-foreground-muted">
            <span>IVA ({taxRate}%)</span>
            <span className="tabular-nums">{formatCurrency(tax)}</span>
          </div>
          <div className="h-px bg-border my-2"></div>
          <div className="flex justify-between font-semibold text-sm sm:text-base">
            <span>Total (IVA incluido)</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onPaymentMethodChange={onPaymentMethodChange}
        />

        {/* Cash Payment Form */}
        {paymentMethod === "cash" && (
          <CashPaymentForm
            amount={amount}
            onAmountChange={onAmountChange}
            change={change}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Card Payment Confirmation UI */}
        {paymentMethod === "card" && (
          <div className="mb-3 sm:mb-4">
            <div className="p-4 glass-card rounded-lg border border-crisp">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="w-12 h-12 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <p className="text-center text-foreground font-medium mb-2">
                Pago con tarjeta
              </p>
              <p className="text-center text-foreground-muted text-sm mb-4">
                Confirme que el pago con tarjeta fue procesado exitosamente en
                el terminal de pago.
              </p>
              <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-foreground text-center font-semibold tabular-nums">
                  Total a cobrar: {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn-secondary px-3 py-2 md:px-4 md:py-2 text-sm md:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmPayment}
            disabled={loading || !hasItems}
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
