// src/app/pos/components/CashPaymentForm.tsx

import { FC } from "react";

interface CashPaymentFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  change: number;
  formatCurrency: (value: number) => string;
}

export const CashPaymentForm: FC<CashPaymentFormProps> = ({
  amount,
  onAmountChange,
  change,
  formatCurrency,
}) => {
  return (
    <div className="mb-3 sm:mb-4">
      <label
        htmlFor="cash-amount"
        className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5"
      >
        Monto recibido
      </label>
      <input
        id="cash-amount"
        name="cash-amount"
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="input-field w-full text-base sm:text-lg tabular-nums"
        placeholder="0.00…"
        step="0.01"
        autoComplete="off"
      />
      {amount && parseFloat(amount) > 0 && (
        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 glass-card rounded-lg">
          <div className="flex justify-between text-foreground font-semibold text-sm sm:text-base">
            <span>Cambio a devolver:</span>
            <span className="tabular-nums">{formatCurrency(change)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
