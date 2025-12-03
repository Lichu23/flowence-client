/**
 * Authentication API
 *
 * This module provides authentication-related API functions including
 * user registration, login, logout, and token refresh operations.
 */

import { apiRequest } from "./client";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserWithStores,
} from "@/types";

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
    console.log('[authApi.me] Raw API response:', response);
    console.log('[authApi.me] User stores:', response.data!.user.stores);
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
