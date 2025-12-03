'use client';

/**
 * AuthContext - Manages authentication state globally
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { UserWithStores, LoginCredentials, RegisterData } from '@/types';

interface AuthContextType {
  user: UserWithStores | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithStores | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // PERFORMANCE: Defer token verification to not block initial render
        // Set loading to false immediately for faster LCP
        setLoading(false);

        // Verify token is still valid (async, non-blocking)
        setTimeout(async () => {
          try {
            const freshUser = await authApi.me();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (error) {
            console.error('Token verification failed:', error);

            // Only logout if it's an authentication error, not a network error
            if (error instanceof Error && (
              error.message.includes('Network error') ||
              error.message.includes('No internet connection') ||
              error.message.includes('Connection timeout') ||
              error.message.includes('Unable to connect to server')
            )) {
              console.log('Network error during token verification, keeping user logged in');
              // Don't logout on network errors, just keep the existing user data
            } else {
              console.log('Authentication error, logging out');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          }
        }, 100); // Defer by 100ms to unblock initial render
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token every 25 minutes (before 30 min expiry)
  useEffect(() => {
    if (!token || !user) return;

    console.log('⏰ Setting up token auto-refresh (every 25 minutes)');

    const refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing token...');
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('❌ No refresh token available');
          return;
        }
        
        const response = await authApi.refreshToken(refreshToken);
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken); // Update refresh token
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ Token auto-refreshed successfully');
      } catch (error) {
        console.error('❌ Auto-refresh failed:', error);
        
        // Only logout if it's an authentication error, not a network error
        if (error instanceof Error && (
          error.message.includes('Network error') ||
          error.message.includes('No internet connection') ||
          error.message.includes('Connection timeout') ||
          error.message.includes('Unable to connect to server')
        )) {
          console.log('Network error during auto-refresh, keeping user logged in');
          // Don't logout on network errors
        } else {
          console.log('Authentication error during auto-refresh, will logout on next API call');
          // Don't logout immediately, let the 401 interceptor handle it
        }
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => {
      console.log('🛑 Clearing token auto-refresh interval');
      clearInterval(refreshInterval);
    };
  }, [token, user]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      
      setUser(response.user);
      setToken(response.token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken); // Store refresh token
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      
      setUser(response.user);
      setToken(response.token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken); // Store refresh token
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken || undefined);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken'); // Remove refresh token on logout
      localStorage.removeItem('user');
      localStorage.removeItem('currentStoreId');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      console.log('[AuthContext] Refreshing user data from API...');
      const freshUser = await authApi.me();
      console.log('[AuthContext] Fresh user received:', {
        id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        stores: freshUser.stores.map(s => ({ id: s.id, name: s.name, business_size: s.business_size }))
      });
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      console.log('[AuthContext] User data saved to localStorage');
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

