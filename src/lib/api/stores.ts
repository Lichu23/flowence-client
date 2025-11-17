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
};
