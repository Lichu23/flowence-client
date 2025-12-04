'use client';

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
// Minimal product type for cart items to avoid type mismatches
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  barcode?: string | null;
  sku?: string | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  setTaxRate: (rate: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(0);

  const addItem = useCallback((product: CartProduct, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => 
          i.product.id === product.id 
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: Math.max(0, quantity) } : i).filter(i => i.quantity > 0));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);
  const tax = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = subtotal + tax;

  const value: CartContextType = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    totalItems,
    subtotal,
    tax,
    total,
    taxRate,
    setTaxRate
  }), [items, addItem, removeItem, updateQuantity, clear, totalItems, subtotal, tax, total, taxRate]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


