'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
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

function ProductsContent() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { formatCurrency } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productListRef = useRef<HTMLDivElement>(null);

  // Track re-renders for performance debugging
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`[PRODUCTS PAGE] 🔄 Component render #${renderCount.current}`);

  // Get page from URL, default to 1
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
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

  // Sync URL with current page
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage === 1) {
      params.delete('page');
    } else {
      params.set('page', currentPage.toString());
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/products${newUrl}`, { scroll: false });
  }, [currentPage, router, searchParams]);

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

  // Load products with AbortController to prevent race conditions
  useEffect(() => {
    if (!currentStore) return;

    const controller = new AbortController();
    const { signal } = controller;

    const loadProducts = async () => {
      const pageStartTime = performance.now();
      console.log('[PRODUCTS PAGE] 🚀 Starting product fetch...');

      try {
        // Set loading immediately to show spinner ASAP
        setLoading(true);
        const setLoadingTime = performance.now();
        console.log(`[PRODUCTS PAGE] ⏱️ setLoading(true) took: ${(setLoadingTime - pageStartTime).toFixed(2)}ms`);
        console.log('[PRODUCTS PAGE] ⚠️ Backend response taking >500ms - backend optimization needed!');

        const apiCallStartTime = performance.now();
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
          { signal } // Pass AbortSignal to cancel stale requests
        );
        const apiCallEndTime = performance.now();
        console.log(`[PRODUCTS PAGE] ⏱️ API call completed in: ${(apiCallEndTime - apiCallStartTime).toFixed(2)}ms`);

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          const stateUpdateStartTime = performance.now();
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
          const stateUpdateEndTime = performance.now();
          console.log(`[PRODUCTS PAGE] ⏱️ State updates took: ${(stateUpdateEndTime - stateUpdateStartTime).toFixed(2)}ms`);
          console.log(`[PRODUCTS PAGE] ✅ Total page load time: ${(stateUpdateEndTime - pageStartTime).toFixed(2)}ms`);
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
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
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
    setCurrentPage(page);
    // Scroll to top of product list smoothly
    if (productListRef.current) {
      productListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

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
            loading={loading}
            user={user}
            formatCurrency={formatCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
            filters={filters}
            onCreateClick={handleCreateClick}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            onPageChange={handlePageChange}
            loading={loading}
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
