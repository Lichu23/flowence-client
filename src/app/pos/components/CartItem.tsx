// src/app/pos/components/CartItem.tsx

import { FC } from "react";
import { CartProduct } from "@/contexts/CartContext";

interface CartItemProps {
  product: CartProduct;
  quantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: FC<CartItemProps> = ({
  product,
  quantity,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <li className="py-3 flex items-center gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate text-sm sm:text-base">
          {product.name}
        </div>
        <div className="text-xs text-foreground-subtle truncate">
          {product.barcode || "s/código"}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
          className="btn-secondary px-2 py-1 text-sm"
        >
          -
        </button>
        <span className="w-6 sm:w-8 text-center text-sm text-foreground">
          {quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          className="btn-secondary px-2 py-1 text-sm"
        >
          +
        </button>
      </div>
      <button
        onClick={() => onRemove(product.id)}
        className="text-error text-xs sm:text-sm flex-shrink-0 hover:text-error/80 transition-colors"
      >
        Eliminar
      </button>
    </li>
  );
};
