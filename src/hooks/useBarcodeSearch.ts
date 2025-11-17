'use client';

/**
 * useBarcodeSearch Hook
 * Custom hook for searching products by barcode
 */

import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { Product } from '@/types';
import { isValidBarcodeFormat } from '@/utils/validation/barcode';

interface BarcodeSearchResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  searchProduct: (storeId: string, barcode: string) => Promise<Product | null>;
  validateBarcode: (storeId: string, barcode: string, excludeProductId?: string) => Promise<boolean>;
  clearResults: () => void;
}


export const useBarcodeSearch = (): BarcodeSearchResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProduct = useCallback(async (storeId: string, barcode: string): Promise<Product | null> => {
    console.log('🔍 [useBarcodeSearch] Starting search:', { storeId, barcode });
    
    if (!storeId || !barcode) {
      console.warn('⚠️ [useBarcodeSearch] Missing required parameters:', { storeId, barcode });
      setError('Store ID and barcode are required');
      return null;
    }

    // Basic barcode validation
    if (!isValidBarcodeFormat(barcode)) {
      console.warn('⚠️ [useBarcodeSearch] Invalid barcode format:', barcode);
      setError('Invalid barcode format. Must be 8-14 digits.');
      return null;
    }

    console.log('✅ [useBarcodeSearch] Barcode format valid, making API request...');
    setLoading(true);
    setError(null);

    try {
      const url = `/api/stores/${storeId}/products/search/barcode/${barcode}`;
      console.log('📡 [useBarcodeSearch] API URL:', url);
      
      const response = await apiRequest<{ product: Product }>(
        url,
        { method: 'GET' }
      );

      console.log('📨 [useBarcodeSearch] API Response:', response);

      if (response.success && response.data) {
        const foundProduct = response.data.product;
        console.log('✅ [useBarcodeSearch] Product found:', {
          id: foundProduct.id,
          name: foundProduct.name,
          barcode: foundProduct.barcode,
          price: foundProduct.price
        });
        setProduct(foundProduct);
        return foundProduct;
      } else {
        console.warn('⚠️ [useBarcodeSearch] Product not found in response');
        setError('Product not found');
        setProduct(null);
        return null;
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to search for product';
      
      if (err instanceof Error && err.message) {
        if (err.message.includes('PRODUCT_NOT_FOUND')) {
          errorMessage = 'No product found with this barcode';
        } else if (err.message.includes('INVALID_BARCODE_FORMAT')) {
          errorMessage = 'Invalid barcode format';
        } else if (err.message.includes('MISSING_PARAMETERS')) {
          errorMessage = 'Invalid search parameters';
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('❌ [useBarcodeSearch] Search error:', {
        error: err,
        message: errorMessage,
        barcode,
        storeId
      });
      setError(errorMessage);
      setProduct(null);
      return null;
    } finally {
      setLoading(false);
      console.log('🏁 [useBarcodeSearch] Search completed');
    }
  }, []);

  const validateBarcode = useCallback(async (
    storeId: string, 
    barcode: string, 
    excludeProductId?: string
  ): Promise<boolean> => {
    if (!storeId || !barcode) {
      return false;
    }

    // Basic barcode validation
    if (!isValidBarcodeFormat(barcode)) {
      return false;
    }

    try {
      const url = `/api/stores/${storeId}/products/barcode/${barcode}/validate${
        excludeProductId ? `?excludeProductId=${excludeProductId}` : ''
      }`;

      const response = await apiRequest<{
        isUnique: boolean;
        existingProduct?: {
          id: string;
          name: string;
          barcode: string;
        };
      }>(url, { method: 'GET' });

      return response.success && response.data?.isUnique === true;
    } catch (err) {
      console.error('Barcode validation error:', err);
      return false;
    }
  }, []);

  const clearResults = useCallback(() => {
    console.log('🧹 [useBarcodeSearch] Clearing search results');
    setProduct(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    product,
    loading,
    error,
    searchProduct,
    validateBarcode,
    clearResults
  };
};
