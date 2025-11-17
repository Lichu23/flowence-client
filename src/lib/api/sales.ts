/**
 * Sales API
 *
 * This module provides sales management API functions including
 * processing sales, listing transactions, handling refunds and returns,
 * and downloading receipts.
 */

import { apiRequest, getToken, refreshAccessToken } from "./client";
import { Sale, SaleItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

type CreateSaleItemRequest = {
  product_id: string;
  quantity: number;
  unit_price?: number;
  discount?: number;
  stock_type?: "venta" | "deposito";
};

type CreateSaleRequest = {
  items: CreateSaleItemRequest[];
  payment_method: "cash" | "card" | "mixed";
  discount?: number;
  notes?: string;
};

// Helper function to download file from response
async function downloadFileFromResponse(response: Response): Promise<void> {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "receipt.pdf";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const salesApi = {
  processSale: async (
    storeId: string,
    data: CreateSaleRequest
  ): Promise<{ sale: Sale; receipt_number: string }> => {
    const response = await apiRequest<{ sale: Sale; receipt_number: string }>(
      `/api/stores/${storeId}/sales`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data!;
  },

  list: async (
    storeId: string,
    params?: {
      page?: number;
      limit?: number;
      payment_method?: "cash" | "card" | "mixed";
      payment_status?: "completed" | "refunded" | "cancelled" | "pending";
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    sales: Sale[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.payment_method)
      query.append("payment_method", params.payment_method);
    if (params?.payment_status)
      query.append("payment_status", params.payment_status);
    if (params?.start_date) query.append("start_date", params.start_date);
    if (params?.end_date) query.append("end_date", params.end_date);
    const qs = query.toString();
    const response = await apiRequest<{
      sales: Sale[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/api/stores/${storeId}/sales${qs ? `?${qs}` : ""}`);
    return response.data!;
  },

  getSale: async (
    storeId: string,
    saleId: string
  ): Promise<{
    sale: Sale;
    items: Array<{
      id: string;
      product_id: string;
      product_name: string;
      product_barcode: string | null;
      product_sku: string | null;
      quantity: number;
      unit_price: number;
      total: number;
      stock_type: "venta" | "deposito";
    }>;
  }> => {
    const response = await apiRequest<{
      sale: Sale;
      items: Array<{
        id: string;
        product_id: string;
        product_name: string;
        product_barcode: string | null;
        product_sku: string | null;
        quantity: number;
        unit_price: number;
        total: number;
        stock_type: "venta" | "deposito";
      }>;
    }>(`/api/stores/${storeId}/sales/${saleId}`);
    return response.data!;
  },

  refund: async (storeId: string, saleId: string): Promise<{ sale: Sale }> => {
    const response = await apiRequest<{ sale: Sale }>(
      `/api/stores/${storeId}/sales/${saleId}/refund`,
      { method: "POST" }
    );
    return response.data!;
  },

  getReturnsSummary: async (
    storeId: string,
    saleId: string
  ): Promise<{
    items: Array<{
      sale_item: {
        id: string;
        product_id: string;
        product_name: string;
        stock_type: "venta" | "deposito";
        quantity: number;
      };
      returned_quantity: number;
      remaining_quantity: number;
      stock_current: number;
    }>;
  }> => {
    const response = await apiRequest<{
      items: Array<{
        sale_item: {
          id: string;
          product_id: string;
          product_name: string;
          stock_type: "venta" | "deposito";
          quantity: number;
        };
        returned_quantity: number;
        remaining_quantity: number;
        stock_current: number;
      }>;
    }>(`/api/stores/${storeId}/sales/${saleId}/returns-summary`);
    return response.data!;
  },

  returnItemsBatch: async (
    storeId: string,
    saleId: string,
    items: Array<{
      sale_item_id: string;
      product_id: string;
      stock_type: "venta" | "deposito";
      quantity: number;
      return_type: "defective" | "customer_mistake";
    }>
  ): Promise<{
    processed: Array<{
      sale_item_id: string;
      quantity: number;
      return_type: string;
    }>;
    summary: {
      items: Array<{
        sale_item: {
          id: string;
          product_id: string;
          product_name: string;
          stock_type: "venta" | "deposito";
          quantity: number;
        };
        returned_quantity: number;
        remaining_quantity: number;
        stock_current: number;
      }>;
    };
  }> => {
    const response = await apiRequest<{
      processed: Array<{
        sale_item_id: string;
        quantity: number;
        return_type: string;
      }>;
      summary: {
        items: Array<{
          sale_item: {
            id: string;
            product_id: string;
            product_name: string;
            stock_type: "venta" | "deposito";
            quantity: number;
          };
          returned_quantity: number;
          remaining_quantity: number;
          stock_current: number;
        }>;
      };
    }>(`/api/stores/${storeId}/sales/${saleId}/returns-batch`, {
      method: "POST",
      body: JSON.stringify({ items }),
    });
    return response.data!;
  },

  getReturnedProducts: async (
    storeId: string,
    saleId: string
  ): Promise<{
    returns: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      return_date: string;
      return_type: "defective" | "customer_mistake";
    }>;
  }> => {
    const response = await apiRequest<{
      returns: Array<{
        product_id: string;
        product_name: string;
        quantity: number;
        return_date: string;
        return_type: "defective" | "customer_mistake";
      }>;
    }>(`/api/stores/${storeId}/sales/${saleId}/returned-products`);
    return response.data!;
  },

  searchByTicket: async (
    storeId: string,
    ticket: string
  ): Promise<{ sale: Sale; items: SaleItem[] }> => {
    const response = await apiRequest<{
      sale: Sale;
      items: SaleItem[];
    }>(`/api/stores/${storeId}/sales/search/ticket?ticket=${encodeURIComponent(ticket)}`);
    return response.data!;
  },

  downloadReceipt: async (storeId: string, saleId: string): Promise<void> => {
    const token = getToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await fetch(
        `${API_URL}/api/stores/${storeId}/sales/${saleId}/receipt`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          console.log(
            "🔑 Received 401 for PDF download, attempting token refresh..."
          );

          try {
            const newToken = await refreshAccessToken();

            const retryResponse = await fetch(
              `${API_URL}/api/stores/${storeId}/sales/${saleId}/receipt`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            if (!retryResponse.ok) {
              throw new Error("Failed to download receipt after token refresh");
            }

            await downloadFileFromResponse(retryResponse);
          } catch (refreshError) {
            console.error(
              "Failed to refresh token for PDF download:",
              refreshError
            );
            throw new Error("Session expired. Please login again.");
          }
        } else {
          throw new Error(`Failed to download receipt: ${response.statusText}`);
        }
      } else {
        await downloadFileFromResponse(response);
      }
    } catch (error) {
      console.error("PDF Download Error:", error);
      throw error;
    }
  },
};

export type { CreateSaleRequest, CreateSaleItemRequest };
