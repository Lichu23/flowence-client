/**
 * Payments API
 *
 * This module provides Stripe payment integration API functions
 * including payment intent creation, confirmation, and status checking.
 */

import { apiRequest } from "./client";
import { Sale } from "@/types";
import type { CreateSaleRequest } from "./sales";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export const paymentsApi = {
  createIntent: async (
    storeId: string,
    params: {
      amount_cents: number;
      currency?: string;
      receipt_number?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<{ client_secret: string; payment_intent_id: string }> => {
    const response = await apiRequest<{
      client_secret: string;
      payment_intent_id: string;
    }>(`/api/stores/${storeId}/payments/intents`, {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response.data!;
  },

  confirmPayment: async (
    storeId: string,
    params: { payment_intent_id: string; sale_data: CreateSaleRequest }
  ): Promise<{ sale: Sale; receipt_number: string }> => {
    const endpoint = `/api/stores/${storeId}/payments/confirm`;
    console.log("🔍 Payment confirmation endpoint:", endpoint);
    console.log("🔍 Full URL:", `${API_URL}${endpoint}`);
    console.log("🔍 Payment params:", params);

    const response = await apiRequest<{ sale: Sale; receipt_number: string }>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    return response.data!;
  },

  getPaymentStatus: async (
    storeId: string,
    paymentIntentId: string
  ): Promise<{ status: string; payment_intent_id: string }> => {
    const response = await apiRequest<{ status: string; payment_intent_id: string }>(
      `/api/stores/${storeId}/payments/${paymentIntentId}/status`,
      {
        method: "GET",
      }
    );
    return response.data!;
  },
};
