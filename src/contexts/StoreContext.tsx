'use client';

/**
 * StoreContext - Manages current store selection globally
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storeApi } from '@/lib/api';
import type { StoreListItem, Store, StoreStats, CreateStoreData, UpdateStoreData } from '@/types';

interface StoreContextType {
  currentStore: StoreListItem | null;
  stores: StoreListItem[];
  loading: boolean;
  selectStore: (storeId: string) => void;
  setCurrentStore: (store: StoreListItem) => void;
  refreshStores: () => Promise<void>;
  createStore: (data: CreateStoreData) => Promise<Store>;
  updateStore: (id: string, data: UpdateStoreData) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;
  getStoreDetails: (id: string) => Promise<{ store: Store; stats: StoreStats }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentStore, setCurrentStore] = useState<StoreListItem | null>(null);
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize stores from user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setStores(user.stores);

      // Try to restore previous store selection
      const savedStoreId = localStorage.getItem('currentStoreId');
      if (savedStoreId) {
        const savedStore = user.stores.find(s => s.id === savedStoreId);
        if (savedStore) {
          setCurrentStore(savedStore);
        } else if (user.stores.length > 0) {
          // If saved store not found, select first one
          setCurrentStore(user.stores[0]);
          localStorage.setItem('currentStoreId', user.stores[0].id);
        }
      } else if (user.stores.length > 0) {
        // No saved selection, select first store
        setCurrentStore(user.stores[0]);
        localStorage.setItem('currentStoreId', user.stores[0].id);
      }

      setLoading(false);
    } else {
      setStores([]);
      setCurrentStore(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const selectStore = useCallback((storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('currentStoreId', storeId);
    }
  }, [stores]);

  const refreshStores = useCallback(async () => {
    try {
      const freshStores = await storeApi.getAll();
      setStores(freshStores);

      // Update current store if it's in the new list
      if (currentStore) {
        const updatedCurrentStore = freshStores.find(s => s.id === currentStore.id);
        if (updatedCurrentStore) {
          setCurrentStore(updatedCurrentStore);
        } else if (freshStores.length > 0) {
          // Current store was deleted, select first one
          setCurrentStore(freshStores[0]);
          localStorage.setItem('currentStoreId', freshStores[0].id);
        } else {
          setCurrentStore(null);
          localStorage.removeItem('currentStoreId');
        }
      }
    } catch (error) {
      console.error('Failed to refresh stores:', error);
      throw error;
    }
  }, [currentStore]);

  const createStore = useCallback(async (data: CreateStoreData) => {
    try {
      const newStore = await storeApi.create(data);
      await refreshStores();
      return newStore;
    } catch (error) {
      console.error('Failed to create store:', error);
      throw error;
    }
  }, [refreshStores]);

  const updateStore = useCallback(async (id: string, data: UpdateStoreData) => {
    try {
      const updatedStore = await storeApi.update(id, data);
      await refreshStores();
      return updatedStore;
    } catch (error) {
      console.error('Failed to update store:', error);
      throw error;
    }
  }, [refreshStores]);

  const deleteStore = useCallback(async (id: string) => {
    try {
      await storeApi.delete(id);
      await refreshStores();
    } catch (error) {
      console.error('Failed to delete store:', error);
      throw error;
    }
  }, [refreshStores]);

  const getStoreDetails = useCallback(async (id: string) => {
    try {
      return await storeApi.getById(id);
    } catch (error) {
      console.error('Failed to get store details:', error);
      throw error;
    }
  }, []);

  const value: StoreContextType = {
    currentStore,
    stores,
    loading,
    selectStore,
    setCurrentStore,
    refreshStores,
    createStore,
    updateStore,
    deleteStore,
    getStoreDetails,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

