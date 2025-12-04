'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { productApi } from '@/lib/api';
import { Product, ProductListResponse } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useSettings } from '@/contexts/SettingsContext';
import { HelpButton } from '@/components/help/HelpModal';
import {
  ProductStats,
  ProductFilters,
  ProductList,
  ProductForm,
  Pagination,
} from './components';

// Cache key generator for consistent cache lookup
function getCacheKey(
  storeId: string,
  page: number,
  search: string,
  category: string,
  showLowStock: boolean,
  showActive: boolean | undefined
): string {
  return JSON.stringify({
    storeId,
    page,
    search,
    category,
    showLowStock,
    showActive,
  });
}

function ProductsContent() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { formatCurrency } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productListRef = useRef<HTMLDivElement>(null);

  // Client-side cache for pages (Map preserves insertion order)
  const cacheRef = useRef<Map<string, ProductListResponse>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [stats, setStats] = useState({
    total_products: 0,
    total_value: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    categories_count: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [showActive] = useState<boolean | undefined>(undefined);
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync URL → state (single direction, no loop)
  // URL is the single source of truth for page number
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    // Only update state if URL changed (prevents circular updates)
    // This check is CRITICAL: we compare against the NEW value, not trigger a chain
    setCurrentPage(pageFromUrl);
  }, [searchParams]); // ← ONLY depend on searchParams, NOT currentPage

  // Load categories once on mount
  useEffect(() => {
    if (!currentStore) return;

    const loadCategories = async () => {
      try {
        const cats = await productApi.getCategories(currentStore.id);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, [currentStore]);

  // Clear cache when filters change (not page)
  useEffect(() => {
    cacheRef.current.clear();
  }, [debouncedSearch, selectedCategory, showLowStock, currentStore?.id, refetchTrigger]);

  // Load products with cache-first strategy
  useEffect(() => {
    if (!currentStore) return;

    const cacheKey = getCacheKey(
      currentStore.id,
      currentPage,
      debouncedSearch,
      selectedCategory,
      showLowStock,
      showActive
    );

    // Check cache first - instant load for visited pages
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      // Instant update from cache (zero flicker)
      setProducts(cached.products || []);
      setTotalProducts(cached.pagination?.total || 0);
      setTotalPages(cached.pagination?.pages || 0);
      setStats(cached.stats || {
        total_products: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        categories_count: 0,
      });
      setIsInitialLoad(false);
      return; // Skip fetch - use cached data
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    const loadProducts = async () => {
      try {
        const result = await productApi.getAll(
          currentStore.id,
          {
            search: debouncedSearch || undefined,
            is_active: showActive,
            low_stock: showLowStock,
            category: selectedCategory || undefined,
            page: currentPage,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
          },
          { signal }
        );

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          // Cache the result
          cacheRef.current.set(cacheKey, result);

          setProducts(result.products || []);
          setTotalProducts(result.pagination?.total || 0);
          setTotalPages(result.pagination?.pages || 0);
          setStats(result.stats || {
            total_products: 0,
            total_value: 0,
            low_stock_count: 0,
            out_of_stock_count: 0,
            categories_count: 0,
          });
          setIsInitialLoad(false);
        }
      } catch (error) {
        // Ignore abort errors (normal when filters change rapidly)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // Only update error state if request wasn't aborted
        if (!signal.aborted) {
          console.error('Failed to load products:', error);
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(0);
          setStats({
            total_products: 0,
            total_value: 0,
            low_stock_count: 0,
            out_of_stock_count: 0,
            categories_count: 0,
          });
          setIsInitialLoad(false);
        }
      }
    };

    loadProducts();

    // Cleanup: abort request if dependencies change before completion
    return () => {
      controller.abort();
    };
  }, [currentStore, currentPage, debouncedSearch, selectedCategory, showActive, showLowStock, refetchTrigger]);

  // Handlers - memoized to prevent unnecessary re-renders
  const handlePageChange = useCallback((page: number) => {
    // Update URL directly (state will sync via useEffect)
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/products${newUrl}`, { scroll: false });

    // Scroll to top of product list smoothly
    if (productListRef.current) {
      productListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [router, searchParams]);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!currentStore) return;
    if (!confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;

    try {
      await productApi.delete(currentStore.id, id);
      // Trigger refetch by incrementing counter
      setRefetchTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }, [currentStore]);

  const handleFormSuccess = async () => {
    // Reload categories in case a new one was added
    if (currentStore) {
      try {
        const cats = await productApi.getCategories(currentStore.id);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to reload categories:', error);
      }
    }

    // Trigger refetch by incrementing counter
    setRefetchTrigger(prev => prev + 1);
    setShowCreateForm(false);
    setEditingProduct(null);
  };

  const handleCloseForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingProduct(null);
  }, []);

  const handleCreateClick = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  // Memoize filters object to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    showLowStock,
    searchTerm: debouncedSearch,
    category: selectedCategory,
  }), [showLowStock, debouncedSearch, selectedCategory]);

  if (!currentStore) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-foreground-muted">
            Selecciona una tienda para gestionar productos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Inventario</h2>

          {user?.role === 'owner' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span>Agregar Producto</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <ProductStats
          stats={stats}
          formatCurrency={formatCurrency}
          totalProducts={totalProducts}
          debouncedSearch={debouncedSearch}
        />

        {/* Search and Filters */}
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          showLowStock={showLowStock}
          onLowStockToggle={() => setShowLowStock(!showLowStock)}
          debouncedSearch={debouncedSearch}
          onPageReset={() => setCurrentPage(1)}
        />

        {/* Products List */}
        <div className="glass-card" ref={productListRef}>
          <ProductList
            products={products}
            loading={isInitialLoad}
            user={user}
            formatCurrency={formatCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
            filters={filters}
            onCreateClick={handleCreateClick}
          />

          {/* Pagination - never show loading state to prevent flicker */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            onPageChange={handlePageChange}
            loading={false}
          />
        </div>

        {/* Create/Edit Product Modal */}
        <ProductForm
          isOpen={showCreateForm || !!editingProduct}
          onClose={handleCloseForm}
          editingProduct={editingProduct}
          currentStore={currentStore}
          user={user}
          categories={categories}
          onSuccess={handleFormSuccess}
        />
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['owner', 'employee']}>
      <ProductsContent />
    </ProtectedRoute>
  );
}
