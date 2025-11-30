// src/app/pos/components/PaymentMethodSelector.tsx

import { FC } from "react";

interface PaymentMethodSelectorProps {
  paymentMethod: "cash" | "card";
  onPaymentMethodChange: (method: "cash" | "card") => void;
}

export const PaymentMethodSelector: FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
}) => {
  return (
    <fieldset className="mb-3">
      <legend className="block text-xs sm:text-sm font-medium text-foreground mb-1">
        Método de pago
      </legend>
      <div
        className="flex gap-3"
        role="radiogroup"
        aria-label="Seleccionar método de pago"
      >
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="paymethod"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => onPaymentMethodChange("cash")}
            className="cursor-pointer"
          />
          Efectivo
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="paymethod"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => onPaymentMethodChange("card")}
            className="cursor-pointer"
          />
          Tarjeta
        </label>
      </div>
    </fieldset>
  );
};
