/**
 * API Client for Flowence Backend
 */

import {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Store,
  StoreListItem,
  CreateStoreData,
  UpdateStoreData,
  StoreStats,
  UserWithStores,
  Invitation,
  SendInvitationData,
  AcceptInvitationData,
  InvitationStats,
  InvitationValidation,
  Product,
  ProductFilters,
  ProductListResponse,
  CreateProductData,
  UpdateProductData,
  AdjustStockData,
  DashboardStats,
  Sale,
  SaleItem,
  FillWarehouseData,
  UpdateSalesStockData,
  RestockOperation,
  StockMovement,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// Debug logging
console.log("🔍 API_URL:", API_URL);
console.log("🔍 NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper function to get refresh token from localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Helper function to refresh the token
async function refreshAccessToken(): Promise<string> {
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
    console.log("🌐 API Request:", fullUrl);
    console.log("🌐 API Options:", options);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

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

    // Check if it's a timeout or connection error
    const errorObj = err as Error & { name?: string };
    if (
      errorObj?.name === "AbortError" ||
      (typeof errorObj?.message === "string" &&
        (errorObj.message.includes("timeout") ||
          errorObj.message.includes("Connection failed") ||
          errorObj.message.includes("ERR_NETWORK") ||
          errorObj.message.includes("ERR_INTERNET_DISCONNECTED")))
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

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data!;
  },

  me: async (): Promise<UserWithStores> => {
    const response = await apiRequest<{ user: UserWithStores }>("/api/auth/me");
    return response.data!.user;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiRequest("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    return response.data!;
  },
};

// Store API
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

// Invitation API
export const invitationApi = {
  send: async (
    data: SendInvitationData
  ): Promise<{ invitation: Invitation; invitationUrl: string }> => {
    const response = await apiRequest<{
      invitation: Invitation;
      invitationUrl: string;
    }>("/api/invitations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  validate: async (token: string): Promise<InvitationValidation> => {
    const response = await apiRequest<InvitationValidation>(
      `/api/invitations/validate/${token}`
    );
    return response.data!;
  },

  accept: async (data: AcceptInvitationData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/invitations/accept", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  getByStore: async (storeId: string): Promise<Invitation[]> => {
    const response = await apiRequest<Invitation[]>(
      `/api/invitations/store/${storeId}`
    );
    return response.data!;
  },

  getPending: async (storeId: string): Promise<Invitation[]> => {
    const response = await apiRequest<Invitation[]>(
      `/api/invitations/store/${storeId}/pending`
    );
    return response.data!;
  },

  getStats: async (storeId: string): Promise<InvitationStats> => {
    const response = await apiRequest<InvitationStats>(
      `/api/invitations/store/${storeId}/stats`
    );
    return response.data!;
  },

  revoke: async (id: string): Promise<void> => {
    await apiRequest(`/api/invitations/${id}/revoke`, {
      method: "POST",
    });
  },

  resend: async (
    id: string
  ): Promise<{ invitation: Invitation; invitationUrl: string }> => {
    const response = await apiRequest<{
      invitation: Invitation;
      invitationUrl: string;
    }>(`/api/invitations/${id}/resend`, {
      method: "POST",
    });
    return response.data!;
  },
};

// Product API
export const productApi = {
  getAll: async (
    storeId: string,
    filters?: Partial<ProductFilters>
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

    const response = await apiRequest<ProductListResponse>(url);
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

// Dashboard API
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

// Sales API
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

// Currency conversion API
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
