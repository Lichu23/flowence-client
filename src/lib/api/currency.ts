/**
 * Currency API
 *
 * This module provides currency conversion and exchange rate API functions
 * for multi-currency support in the POS system.
 */

import { apiRequest } from "./client";

export const currencyApi = {
  getExchangeRate: async (from: string, to: string): Promise<{ rate: number; updated_at: string }> => {
    const response = await apiRequest<{ rate: number; updated_at: string }>(
      `/api/stores/exchange-rate/${from}/${to}`,
      { method: "GET" }
    );
    return response.data!;
  },

  convertAmount: async (amount: number, from: string, to: string): Promise<{
    original_amount: number;
    from: string;
    converted_amount: number;
    to: string;
    rate: number;
    updated_at: string;
  }> => {
    const response = await apiRequest<{
      original_amount: number;
      from: string;
      converted_amount: number;
      to: string;
      rate: number;
      updated_at: string;
    }>(`/api/stores/convert-amount`, {
      method: "POST",
      body: JSON.stringify({ amount, from, to }),
    });
    return response.data!;
  },

  getSupportedCurrencies: async (): Promise<{ currencies: string[] }> => {
    const response = await apiRequest<{ currencies: string[] }>(`/api/stores/supported-currencies`, {
      method: "GET",
    });
    return response.data!;
  },
};
