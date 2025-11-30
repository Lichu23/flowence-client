// src/app/products/components/ProductTable.tsx

import { FC } from 'react';
import type { Product, User } from '@/types';

interface ProductTableProps {
  products: Product[];
  user: User | null;
  formatCurrency: (value: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
}

export const ProductTable: FC<ProductTableProps> = ({
  products,
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

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Producto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Código</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Precio</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Costo</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Depósito</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Venta</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => {
            const { margin } = calculateProfit(product.price, product.cost);
            const isLowStockDeposito = (product.stock_deposito || 0) <= (product.min_stock_deposito || 10);
            const isLowStockVenta = (product.stock_venta || 0) <= (product.min_stock_venta || 5);

            return (
              <tr key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{product.name}</div>
                  {product.category && (
                    <div className="text-xs text-foreground-subtle">{product.category}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground font-mono">{product.barcode || '-'}</div>
                  {product.sku && (
                    <div className="text-xs text-foreground-subtle font-mono">SKU: {product.sku}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-sm font-medium text-foreground">{formatCurrency(product.price)}</div>
                  <div className="text-xs text-success">+{margin}%</div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-foreground-muted">{formatCurrency(product.cost)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium ${isLowStockDeposito ? 'text-warning' : 'text-foreground'}`}>
                    {product.stock_deposito || 0}
                  </span>
                  {isLowStockDeposito && <div className="text-xs text-warning">Bajo</div>}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium ${isLowStockVenta ? 'text-warning' : 'text-foreground'}`}>
                    {product.stock_venta || 0}
                  </span>
                  {isLowStockVenta && <div className="text-xs text-warning">Bajo</div>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${
                    product.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-foreground-muted border-border'
                  }`}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {user?.role === 'owner' ? (
                      <>
                        <button
                          onClick={() => onEdit(product)}
                          className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded text-sm transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(product.id, product.name)}
                          className="text-error hover:text-error/80 px-2 py-1 hover:bg-error/10 rounded text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onEdit(product)}
                        className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded text-sm transition-colors"
                        title="Editar stock de venta"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
