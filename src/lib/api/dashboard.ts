/**
 * Dashboard API
 *
 * This module provides dashboard statistics and analytics API functions
 * including store stats, defective products, and global summary data.
 */

import { apiRequest } from "./client";
import { DashboardStats } from "@/types";

export const dashboardApi = {
  getStats: async (storeId: string): Promise<DashboardStats> => {
    const response = await apiRequest<DashboardStats>(
      `/api/dashboard/stats/${storeId}`,
      {
        method: "GET",
      }
    );
    return response.data!;
  },

  getDefectiveProducts: async (
    storeId: string
  ): Promise<{
    products: Array<{
      product_id: string;
      product_name: string;
      total_defective: number;
      last_return_date: string;
      monetary_loss: number;
    }>;
  }> => {
    const response = await apiRequest<{
      products: Array<{
        product_id: string;
        product_name: string;
        total_defective: number;
        last_return_date: string;
        monetary_loss: number;
      }>;
    }>(`/api/dashboard/defective-products/${storeId}`, {
      method: "GET",
    });
    return response.data!;
  },

  getGlobalSummary: async (): Promise<{
    totalEmployees: number;
    totalProfit: number;
    totalRevenue: number;
    totalExpenses: number;
    stores: Array<{
      storeId: string;
      storeName: string;
      month: string;
      expenses: number;
      revenue: number;
      profit: number;
      employees: number;
    }>;
  }> => {
    const response = await apiRequest<{
      totalEmployees: number;
      totalProfit: number;
      totalRevenue: number;
      totalExpenses: number;
      stores: Array<{
        storeId: string;
        storeName: string;
        month: string;
        expenses: number;
        revenue: number;
        profit: number;
        employees: number;
      }>;
    }>("/api/dashboard/global-summary", {
      method: "GET",
    });
    return response.data!;
  },
};
