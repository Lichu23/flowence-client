/**
 * API Module Index
 *
 * Central export point for all API modules. Import API functions from this file
 * instead of individual modules.
 *
 * @example
 * import { authApi, storeApi, productApi } from '@/lib/api';
 */

// Core HTTP client exports
export { apiRequest, getToken, getRefreshToken, refreshAccessToken } from "./client";

// API module exports
export { authApi } from "./auth";
export { storeApi } from "./stores";
export { invitationApi } from "./invitations";
export { productApi } from "./products";
export { salesApi } from "./sales";
export { dashboardApi } from "./dashboard";
export { currencyApi } from "./currency";
export { paymentsApi } from "./payments";

// Re-export types from sales module
export type { CreateSaleRequest, CreateSaleItemRequest } from "./sales";
