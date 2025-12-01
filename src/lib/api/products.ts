/**
 * Products API
 *
 * This module provides product management API functions including
 * CRUD operations, stock management (dual-stock system), categories,
 * and search functionality.
 */

import { apiRequest } from "./client";
import {
  Product,
  ProductFilters,
  ProductListResponse,
  CreateProductData,
  UpdateProductData,
  AdjustStockData,
  FillWarehouseData,
  UpdateSalesStockData,
  RestockOperation,
  StockMovement,
} from "@/types";

export const productApi = {
  getAll: async (
    storeId: string,
    filters?: Partial<ProductFilters>,
    options?: RequestInit
  ): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();

    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.is_active !== undefined)
      queryParams.append("is_active", filters.is_active.toString());
    if (filters?.low_stock !== undefined)
      queryParams.append("low_stock", filters.low_stock.toString());
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.sort_by) queryParams.append("sort_by", filters.sort_by);
    if (filters?.sort_order)
      queryParams.append("sort_order", filters.sort_order);

    const queryString = queryParams.toString();
    const url = `/api/stores/${storeId}/products${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiRequest<ProductListResponse>(url, options);
    return response.data!;
  },

  getById: async (storeId: string, id: string): Promise<Product> => {
    const response = await apiRequest<Product>(
      `/api/stores/${storeId}/products/${id}`
    );
    return response.data!;
  },

  getByBarcode: async (storeId: string, barcode: string): Promise<Product> => {
    const response = await apiRequest<Product>(
      `/api/stores/${storeId}/products/barcode/${barcode}`
    );
    return response.data!;
  },

  getCategories: async (storeId: string): Promise<string[]> => {
    const response = await apiRequest<string[]>(
      `/api/stores/${storeId}/products/categories`
    );
    return response.data!;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await apiRequest<Product>(
      `/api/stores/${data.store_id}/products`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  },

  update: async (
    storeId: string,
    id: string,
    data: UpdateProductData
  ): Promise<Product> => {
    const response = await apiRequest<Product>(
      `/api/stores/${storeId}/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  },

  adjustStock: async (
    storeId: string,
    id: string,
    data: AdjustStockData
  ): Promise<Product> => {
    const response = await apiRequest<Product>(
      `/api/stores/${storeId}/products/${id}/adjust-stock`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  },

  // Dual Stock Operations
  fillWarehouse: async (
    storeId: string,
    id: string,
    data: FillWarehouseData
  ): Promise<Product> => {
    const response = await apiRequest<{ product: Product }>(
      `/api/stores/${storeId}/products/${id}/stock/warehouse/fill`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!.product;
  },

  updateSalesStock: async (
    storeId: string,
    id: string,
    data: UpdateSalesStockData
  ): Promise<Product> => {
    const response = await apiRequest<{ product: Product }>(
      `/api/stores/${storeId}/products/${id}/stock/sales/update`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.data!.product;
  },

  restockProduct: async (
    storeId: string,
    id: string,
    data: RestockOperation
  ): Promise<Product> => {
    const response = await apiRequest<{ product: Product }>(
      `/api/stores/${storeId}/products/${id}/restock`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!.product;
  },

  getStockMovements: async (
    storeId: string,
    id: string,
    limit?: number
  ): Promise<StockMovement[]> => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());

    const queryString = queryParams.toString();
    const url = `/api/stores/${storeId}/products/${id}/stock/movements${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiRequest<StockMovement[]>(url);
    return response.data!;
  },

  getLowStockAlerts: async (storeId: string): Promise<Product[]> => {
    const response = await apiRequest<{ products: Product[]; count: number }>(
      `/api/stores/${storeId}/stock/alerts`
    );
    return response.data!.products;
  },

  delete: async (storeId: string, id: string): Promise<void> => {
    await apiRequest(`/api/stores/${storeId}/products/${id}`, {
      method: "DELETE",
    });
  },
};
