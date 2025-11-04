/**
 * Test Utilities
 * Provides custom render functions and test helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { CartProvider } from '@/contexts/CartContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastProvider } from '@/components/ui/Toast';

// Mock user data
export const mockOwnerUser = {
  id: 'user-1',
  email: 'owner@test.com',
  name: 'Test Owner',
  role: 'owner' as const,
  stores: [
    {
      id: 'store-1',
      name: 'Test Store',
      address: '123 Test St',
      phone: '555-0100',
    },
  ],
};

export const mockEmployeeUser = {
  id: 'user-2',
  email: 'employee@test.com',
  name: 'Test Employee',
  role: 'employee' as const,
  stores: [
    {
      id: 'store-1',
      name: 'Test Store',
      address: '123 Test St',
      phone: '555-0100',
    },
  ],
};

// Mock store data
export const mockStore = {
  id: 'store-1',
  name: 'Test Store',
  address: '123 Test St',
  phone: '555-0100',
  owner_id: 'user-1',
  currency: 'USD',
  tax_rate: 10,
  low_stock_threshold: 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock product data
export const mockProduct = {
  id: 'product-1',
  store_id: 'store-1',
  name: 'Test Product',
  description: 'A test product',
  barcode: '1234567890',
  sku: 'TEST-001',
  category: 'Test',
  price: 10.99,
  cost: 5.00,
  stock: 100, // Legacy
  stock_deposito: 80,
  stock_venta: 20,
  min_stock: 10, // Legacy
  min_stock_deposito: 15,
  min_stock_venta: 5,
  unit: 'unit',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock sale data
export const mockSale = {
  id: 'sale-1',
  store_id: 'store-1',
  user_id: 'user-1',
  receipt_number: 'REC-001',
  total: 10.99,
  payment_method: 'cash' as const,
  payment_status: 'completed' as const,
  items: [
    {
      product_id: 'product-1',
      product_name: 'Test Product',
      quantity: 1,
      price: 10.99,
      subtotal: 10.99,
    },
  ],
  created_at: new Date().toISOString(),
};

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <SettingsProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SettingsProvider>
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Helper to create mock API responses
export const createMockApiResponse = <T,>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Helper to create mock API error
export const createMockApiError = (message: string, delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};
