/**
 * Stores API
 *
 * This module provides store management API functions including
 * CRUD operations and statistics for multi-tenant store operations.
 */

import { apiRequest } from "./client";
import {
  Store,
  StoreListItem,
  CreateStoreData,
  UpdateStoreData,
  StoreStats,
  Employee,
} from "@/types";

export const storeApi = {
  getAll: async (): Promise<StoreListItem[]> => {
    const response = await apiRequest<StoreListItem[]>("/api/stores");
    return response.data!;
  },

  getById: async (id: string): Promise<{ store: Store; stats: StoreStats }> => {
    const response = await apiRequest<{ store: Store; stats: StoreStats }>(
      `/api/stores/${id}`
    );
    return response.data!;
  },

  create: async (data: CreateStoreData): Promise<Store> => {
    const response = await apiRequest<Store>("/api/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  update: async (id: string, data: UpdateStoreData): Promise<Store> => {
    const response = await apiRequest<Store>(`/api/stores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/api/stores/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async (id: string): Promise<StoreStats> => {
    const response = await apiRequest<StoreStats>(`/api/stores/${id}/stats`);
    return response.data!;
  },

  setBusinessSize: async (
    storeId: string,
    businessSize: "small" | "medium_large"
  ): Promise<Store> => {
    const payload = { business_size: businessSize };
    console.log('[setBusinessSize] 📤 Sending request:', {
      url: `/api/stores/${storeId}/business-size`,
      method: 'POST',
      payload
    });

    const response = await apiRequest<Store>(
      `/api/stores/${storeId}/business-size`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    console.log('[setBusinessSize] ✅ Response received:', response);
    return response.data!;
  },

  getEmployees: async (storeId: string): Promise<Employee[]> => {
    const response = await apiRequest<Employee[]>(
      `/api/stores/${storeId}/employees`
    );
    return response.data!;
  },
};
