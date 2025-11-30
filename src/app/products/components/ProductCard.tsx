// src/app/products/components/ProductCard.tsx

import { FC } from 'react';
import type { Product, User } from '@/types';

interface ProductCardProps {
  product: Product;
  user: User | null;
  formatCurrency: (value: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
}

export const ProductCard: FC<ProductCardProps> = ({
  product,
  user,
  formatCurrency,
  onEdit,
  onDelete,
}) => {
  const calculateProfit = (price: number, cost: number) => {
    const profit = price - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0';
    return { profit, margin };
  };

  const { margin } = calculateProfit(product.price, product.cost);
  const isLowStockDeposito = (product.stock_deposito || 0) <= (product.min_stock_deposito || 10);
  const isLowStockVenta = (product.stock_venta || 0) <= (product.min_stock_venta || 5);

  return (
    <div className={`p-4 ${!product.is_active ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-foreground-subtle mt-0.5">{product.category}</p>
          )}
        </div>
        <span className={`badge flex-shrink-0 ${
          product.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-foreground-muted border-border'
        }`}>
          {product.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {(product.barcode || product.sku) && (
        <div className="text-xs font-mono text-foreground-muted mb-2">
          {product.barcode && <div>Código: {product.barcode}</div>}
          {product.sku && <div>SKU: {product.sku}</div>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="glass-card p-2">
          <p className="text-xs text-foreground-muted">Precio</p>
          <p className="text-base font-bold text-foreground">{formatCurrency(product.price)}</p>
          <p className="text-xs text-success">Margen: {margin}%</p>
        </div>
        <div className="glass-card p-2">
          <p className="text-xs text-foreground-muted">Stock Depósito</p>
          <p className={`text-base font-bold ${isLowStockDeposito ? 'text-warning' : 'text-foreground'}`}>
            {product.stock_deposito || 0}
          </p>
          {isLowStockDeposito && <p className="text-xs text-warning">Bajo!</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-3">
        <div className="glass-card p-2 bg-primary/5">
          <p className="text-xs text-foreground-muted">Stock Piso de Ventas</p>
          <p className={`text-base font-bold ${isLowStockVenta ? 'text-warning' : 'text-foreground'}`}>
            {product.stock_venta || 0}
          </p>
          {isLowStockVenta && <p className="text-xs text-warning">Stock bajo!</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        {user?.role === 'owner' ? (
          <>
            <button
              onClick={() => onEdit(product)}
              className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors active:scale-95"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(product.id, product.name)}
              className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-error hover:text-error/80 transition-colors active:scale-95"
            >
              Eliminar
            </button>
          </>
        ) : (
          <button
            onClick={() => onEdit(product)}
            className="btn-secondary w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors active:scale-95"
            title="Editar stock de venta"
          >
            Editar Stock de Venta
          </button>
        )}
      </div>
    </div>
  );
};
