// src/app/pos/components/CartList.tsx

import { FC } from "react";
import { CartProduct } from "@/contexts/CartContext";
import { CartItem } from "./CartItem";

interface CartListProps {
  items: Array<{ product: CartProduct; quantity: number }>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartList: FC<CartListProps> = ({
  items,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <ul className="divide-y divide-border">
      {items.map(({ product, quantity }) => (
        <CartItem
          key={product.id}
          product={product}
          quantity={quantity}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
};
