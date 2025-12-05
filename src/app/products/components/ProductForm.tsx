// src/app/products/components/ProductForm.tsx

import { FC, useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Product, ProductFormData, UpdateProductData, StoreListItem, User } from '@/types';
import { productApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ProductFormFields } from './ProductFormFields';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  currentStore: StoreListItem | null;
  user: User | null;
  categories: string[];
  onSuccess: () => void;
}

export const ProductForm: FC<ProductFormProps> = ({
  isOpen,
  onClose,
  editingProduct,
  currentStore,
  user,
  categories,
  onSuccess,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    store_id: currentStore?.id || '',
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    barcode: editingProduct?.barcode || '',
    sku: editingProduct?.sku || '',
    category: editingProduct?.category || '',
    price: editingProduct?.price || 0,
    cost: editingProduct?.cost || 0,
    stock: editingProduct?.stock || 0,
    stock_deposito: editingProduct?.stock_deposito || 0,
    stock_venta: editingProduct?.stock_venta || 0,
    min_stock: editingProduct?.min_stock || 5,
    min_stock_deposito: editingProduct?.min_stock_deposito || 10,
    min_stock_venta: editingProduct?.min_stock_venta || 5,
    unit: editingProduct?.unit || 'unit',
    is_active: editingProduct?.is_active ?? true,
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Helper functions for number input handling
  const handleNumberChange = (field: string, value: string) => {
    if (value === '') {
      setFormData({ ...formData, [field]: '' });
    } else {
      const numValue = field === 'price' || field === 'cost' ? parseFloat(value) : parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData({ ...formData, [field]: numValue });
      }
    }
  };

  const getDisplayValue = (value: number | string) => {
    return value === '' ? '' : String(value);
  };

  const ensureNumber = (value: number | string | undefined, fallback: number): number => {
    if (value === '' || value === undefined || value === null) {
      return fallback;
    }
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  const handleFieldChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setFormError('');
    setFormLoading(true);

    try {
      const processedData = {
        ...formData,
        store_id: currentStore.id,
        price: ensureNumber(formData.price, 0),
        cost: ensureNumber(formData.cost, 0),
        stock: ensureNumber(formData.stock, 0),
        stock_deposito: ensureNumber(formData.stock_deposito, 0),
        stock_venta: ensureNumber(formData.stock_venta, 0),
        min_stock: ensureNumber(formData.min_stock, 5),
        min_stock_deposito: ensureNumber(formData.min_stock_deposito, 10),
        min_stock_venta: ensureNumber(formData.min_stock_venta, 5),
      };

      await productApi.create(processedData);
      toast.success('Producto creado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentStore || !editingProduct) return;

    setFormError('');
    setFormLoading(true);

    try {
      if (user?.role === 'employee') {
        const newStockVenta = ensureNumber(formData.stock_venta, 0);
        const reason = 'Actualización de stock por empleado';

        await productApi.updateSalesStock(currentStore.id, editingProduct.id, {
          quantity: newStockVenta,
          reason: reason,
          notes: `Stock actualizado de ${editingProduct.stock_venta} a ${newStockVenta}`,
        });
      } else {
        const updates: UpdateProductData = {
          name: formData.name,
          description: formData.description,
          barcode: formData.barcode,
          sku: formData.sku,
          category: formData.category,
          price: ensureNumber(formData.price, 0),
          cost: ensureNumber(formData.cost, 0),
          stock: ensureNumber(formData.stock, 0),
          stock_deposito: ensureNumber(formData.stock_deposito, 0),
          stock_venta: ensureNumber(formData.stock_venta, 0),
          min_stock: ensureNumber(formData.min_stock, 5),
          min_stock_deposito: ensureNumber(formData.min_stock_deposito, 10),
          min_stock_venta: ensureNumber(formData.min_stock_venta, 5),
          unit: formData.unit,
          is_active: formData.is_active,
        };

        await productApi.update(currentStore.id, editingProduct.id, updates);
      }

      toast.success('Producto actualizado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-black max-w-2xl w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button
            onClick={onClose}
            className="text-foreground-subtle hover:text-foreground p-1 hover:bg-card rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
          <ProductFormFields
            formData={formData}
            onChange={handleFieldChange}
            onNumberChange={handleNumberChange}
            getDisplayValue={getDisplayValue}
            categories={categories}
            isEmployee={user?.role === 'employee'}
            isEditing={!!editingProduct}
          />

          {formError && (
            <div className="glass-card bg-error/10 border-error/30 text-error px-3 py-2 rounded-lg text-xs sm:text-sm">
              {formError}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all flex-1 disabled:opacity-50"
            >
              {formLoading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
