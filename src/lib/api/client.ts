/**
 * API Client Core
 *
 * This module provides the core HTTP client functionality for making API requests.
 * It handles authentication, token refresh, and error handling.
 */

import { ApiResponse, AuthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// Helper function to get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper function to get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Helper function to refresh the token
export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    // Wait for the ongoing refresh to complete
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Refreshing access token using refresh token...");

      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      const newToken = data.data!.token;
      const newRefreshToken = data.data!.refreshToken;
      const newUser = data.data!.user;

      // Update localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      console.log("✅ Token refreshed successfully");
      return newToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Only clear access token on refresh failure, keep refresh token
      // Refresh token should only be removed on explicit logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Do NOT remove refreshToken here - only remove on logout
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Helper function to make API requests with auto-retry on 401
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const token = getToken();

  // TODO: Proactive token refresh disabled temporarily for debugging
  // Check if token is expired and refresh proactively
  // if (token && isTokenExpired(token) && !isRetry && !endpoint.includes('/auth/')) {
  //   console.log('🔄 Token expired or about to expire, refreshing proactively...');
  //   try {
  //     token = await refreshAccessToken();
  //   } catch (error) {
  //     console.error('❌ Proactive token refresh failed:', error);
  //     // Continue with expired token, will trigger 401 and retry
  //   }
  // }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const fullUrl = `${API_URL}${endpoint}`;

    // Performance monitoring for products endpoint
    const isProductsEndpoint = endpoint.includes('/products');
    const startTime = isProductsEndpoint ? performance.now() : 0;

    // Log request details for sales and products endpoints
    if (endpoint.includes('/sales') || isProductsEndpoint) {
      console.log(`[API CLIENT] Making request to ${isProductsEndpoint ? 'products' : 'sales'} endpoint`);
      console.log('[API CLIENT] Endpoint:', endpoint);
      console.log('[API CLIENT] Full URL:', fullUrl);
      console.log('[API CLIENT] Method:', options.method || 'GET');
      if (isProductsEndpoint) {
        console.log('[API CLIENT] ⏱️ Request started at:', new Date().toISOString());
      }
    }

    const fetchStartTime = isProductsEndpoint ? performance.now() : 0;
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    const fetchEndTime = isProductsEndpoint ? performance.now() : 0;

    if (isProductsEndpoint) {
      console.log(`[API CLIENT] ⏱️ Network request took: ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
    }

    // Log response details for sales and products endpoints
    if (endpoint.includes('/sales') || isProductsEndpoint) {
      console.log('[API CLIENT] Response received');
      console.log('[API CLIENT] Status:', response.status);
      if (isProductsEndpoint) {
        console.log('[API CLIENT] Response size:', response.headers.get('content-length'), 'bytes');
      }
    }

    const parseStartTime = isProductsEndpoint ? performance.now() : 0;
    const data: ApiResponse<T> = await response.json();
    const parseEndTime = isProductsEndpoint ? performance.now() : 0;

    if (isProductsEndpoint) {
      console.log(`[API CLIENT] ⏱️ JSON parsing took: ${(parseEndTime - parseStartTime).toFixed(2)}ms`);
      console.log(`[API CLIENT] ⏱️ Total request time: ${(parseEndTime - startTime).toFixed(2)}ms`);
      const productData = data.data as { products?: unknown[] };
      console.log('[API CLIENT] Products received:', productData?.products?.length || 0);
    }

    // Log parsed response data for sales endpoints
    if (endpoint.includes('/sales')) {
      console.log('[API CLIENT] Parsed response data:', JSON.stringify(data, null, 2));
    }

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !isRetry && !endpoint.includes("/auth/")) {
      console.log("🔑 Received 401, attempting token refresh...");

      try {
        const newToken = await refreshAccessToken();
        console.log(
          "✅ New token obtained (first 20 chars):",
          newToken.substring(0, 20) + "..."
        );

        // Retry the original request with new token
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };

        console.log("🔄 Retrying request to:", `${API_URL}${endpoint}`);
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });

        console.log("📊 Retry response status:", retryResponse.status);
        const retryData: ApiResponse<T> = await retryResponse.json();

        if (!retryResponse.ok) {
          console.error("❌ Retry failed with status:", retryResponse.status);
          console.error("❌ Retry error:", retryData.error);
          throw new Error(
            retryData.error?.message || "Request failed after token refresh"
          );
        }

        console.log("✅ Retry successful!");
        return retryData;
      } catch {
        console.error("Failed to refresh token, redirecting to login...");
        // Token refresh failed, user needs to login again
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      throw new Error(data.error?.message || "Request failed");
    }

    return data;
  } catch (err) {
    // Check if it's an intentional abort (don't log or transform these)
    const errorObj = err as Error & { name?: string };
    if (errorObj?.name === "AbortError") {
      // Re-throw as-is without logging - this is intentional cancellation
      throw err;
    }

    // Narrow error type for safe access to message/name
    console.error("API Request Error:", err);

    // Check if it's a network error (no internet connection)
    if (
      err instanceof TypeError &&
      ((err as Error).message?.includes("fetch") ||
        (err as Error).message?.includes("Failed to fetch") ||
        (err as Error).message?.includes("NetworkError") ||
        (err as Error).message?.includes("Load failed"))
    ) {
      throw new Error(
        "Network error: No internet connection. Please check your WiFi and try again."
      );
    }

    // Check if it's a timeout or connection error (not AbortError)
    if (
      typeof errorObj?.message === "string" &&
      (errorObj.message.includes("timeout") ||
        errorObj.message.includes("Connection failed") ||
        errorObj.message.includes("ERR_NETWORK") ||
        errorObj.message.includes("ERR_INTERNET_DISCONNECTED"))
    ) {
      throw new Error(
        "Connection timeout. Please check your internet connection and try again."
      );
    }

    // Check if it's a CORS error (also network-related)
    const errorObj2 = err as Error;
    if (
      typeof errorObj2?.message === "string" &&
      (errorObj2.message.includes("CORS") ||
        errorObj2.message.includes("Cross-Origin"))
    ) {
      throw new Error(
        "Network error: Unable to connect to server. Please check your connection."
      );
    }

    throw err as Error;
  }
}
