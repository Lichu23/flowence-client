// src/app/products/components/ProductFormFields.tsx

import { FC } from 'react';
import type { ProductFormData } from '@/types';

interface ProductFormFieldsProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string | number | boolean) => void;
  onNumberChange: (field: string, value: string) => void;
  getDisplayValue: (value: number | string) => string;
  categories: string[];
  isEmployee: boolean;
  isEditing: boolean;
}

export const ProductFormFields: FC<ProductFormFieldsProps> = ({
  formData,
  onChange,
  onNumberChange,
  getDisplayValue,
  categories,
  isEmployee,
  isEditing,
}) => {
  const isFieldDisabled = isEmployee && isEditing;

  return (
    <>
      {/* Employee Notice */}
      {isEmployee && isEditing && (
        <div className="glass-card bg-info/10 border-info/30 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-info mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-info">Modo Empleado</p>
              <p className="text-xs text-foreground-muted mt-1">Solo puedes editar el stock de venta. Los cambios se descontarán automáticamente del depósito.</p>
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre del Producto *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          disabled={isFieldDisabled}
          className={`input-field w-full text-sm sm:text-base ${
            isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="Ej: Coca Cola 600ml"
        />
      </div>

      {/* Barcode and SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Código de Barras
          </label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => onChange('barcode', e.target.value)}
            disabled={isFieldDisabled}
            className={`input-field w-full text-sm sm:text-base font-mono ${
              isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="7891234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => onChange('sku', e.target.value)}
            disabled={isFieldDisabled}
            className={`input-field w-full text-sm sm:text-base font-mono ${
              isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder="PROD-001"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Categoría
        </label>
        <input
          type="text"
          list="categories"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          disabled={isFieldDisabled}
          className={`input-field w-full text-sm sm:text-base ${
            isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="Bebidas, Snacks, etc."
        />
        <datalist id="categories">
          {categories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      {/* Price and Cost */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Precio de Venta *
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-2.5 sm:top-3 text-sm sm:text-base ${
              isFieldDisabled ? 'text-foreground-subtle' : 'text-foreground-muted'
            }`}>$</span>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={getDisplayValue(formData.price)}
              onChange={(e) => onNumberChange('price', e.target.value)}
              disabled={isFieldDisabled}
              className={`input-field w-full pl-7 pr-3 sm:pr-4 text-sm sm:text-base ${
                isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Costo *
          </label>
          <div className="relative">
            <span className={`absolute left-3 top-2.5 sm:top-3 text-sm sm:text-base ${
              isFieldDisabled ? 'text-foreground-subtle' : 'text-foreground-muted'
            }`}>$</span>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={getDisplayValue(formData.cost)}
              onChange={(e) => onNumberChange('cost', e.target.value)}
              disabled={isFieldDisabled}
              className={`input-field w-full pl-7 pr-3 sm:pr-4 text-sm sm:text-base ${
                isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Dual Stock System */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Sistema de Stock Dual</h4>

        {/* Warehouse Stock */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Stock Depósito *
            </label>
            <input
              type="number"
              required
              min="0"
              value={getDisplayValue(formData.stock_deposito)}
              onChange={(e) => onNumberChange('stock_deposito', e.target.value)}
              disabled={isFieldDisabled}
              className={`input-field w-full text-sm sm:text-base ${
                isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="0"
            />
            <p className="text-xs text-foreground-subtle mt-1">
              {isFieldDisabled ? 'Solo para propietarios' : 'Almacén/Bodega'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mínimo Depósito
            </label>
            <input
              type="number"
              min="0"
              value={getDisplayValue(formData.min_stock_deposito)}
              onChange={(e) => onNumberChange('min_stock_deposito', e.target.value)}
              disabled={isFieldDisabled}
              className={`input-field w-full text-sm sm:text-base ${
                isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="10"
            />
          </div>
        </div>

        {/* Sales Floor Stock */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Stock Piso Venta *
              {isEmployee && isEditing && (
                <span className="ml-2 text-xs text-primary font-medium">(Único campo editable)</span>
              )}
            </label>
            <input
              type="number"
              required
              min="0"
              value={getDisplayValue(formData.stock_venta)}
              onChange={(e) => onNumberChange('stock_venta', e.target.value)}
              className="input-field w-full text-sm sm:text-base"
              placeholder="0"
            />
            <p className="text-xs text-foreground-subtle mt-1">
              {isEmployee && isEditing ? 'Los cambios se descontarán del depósito automáticamente' : 'Exhibición/Ventas'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mínimo Venta
            </label>
            <input
              type="number"
              min="0"
              value={getDisplayValue(formData.min_stock_venta)}
              onChange={(e) => onNumberChange('min_stock_venta', e.target.value)}
              disabled={isFieldDisabled}
              className={`input-field w-full text-sm sm:text-base ${
                isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="5"
            />
          </div>
        </div>
      </div>

      {/* Unit */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Unidad
        </label>
        <select
          value={formData.unit}
          onChange={(e) => onChange('unit', e.target.value)}
          disabled={isFieldDisabled}
          className={`input-field w-full text-sm sm:text-base ${
            isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <option value="unit">Unidad</option>
          <option value="kg">Kilogramo</option>
          <option value="g">Gramo</option>
          <option value="lb">Libra</option>
          <option value="box">Caja</option>
          <option value="pack">Paquete</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          disabled={isFieldDisabled}
          className={`input-field w-full text-sm sm:text-base resize-none ${
            isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="Descripción opcional del producto..."
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => onChange('is_active', e.target.checked)}
          disabled={isFieldDisabled}
          className={`w-4 h-4 text-primary border-border rounded focus:ring-primary ${
            isFieldDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <label htmlFor="is_active" className={`ml-2 text-sm ${
          isFieldDisabled ? 'text-foreground-subtle' : 'text-foreground'
        }`}>
          Producto activo para ventas
        </label>
      </div>
    </>
  );
};
