'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Load products
  const loadProducts = useCallback(async () => {
    if (!currentStore) return;

    try {
      setLoading(true);

      const result = await productApi.getAll(currentStore.id, {
        search: debouncedSearch || undefined,
        is_active: showActive,
        low_stock: showLowStock,
        category: selectedCategory || undefined,
        page: currentPage,
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      setProducts(result.products || []);
      setTotalProducts(result.pagination?.total || 0);

      // Extract unique categories
      if (result.products) {
        const uniqueCategories = Array.from(
          new Set(
            result.products
              .map(product => product.category)
              .filter(Boolean) as string[]
          )
        );
        setCategories(uniqueCategories);
      }

      setTotalPages(result.pagination?.pages || 0);
      setStats(result.stats || {
        total_products: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        categories_count: 0,
      });
    } catch (error) {
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
    } finally {
      setLoading(false);
    }
  }, [currentStore, debouncedSearch, showActive, showLowStock, selectedCategory, currentPage]);

  const loadCategories = useCallback(async () => {
    if (!currentStore) return;

    try {
      const cats = await productApi.getCategories(currentStore.id);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [currentStore]);

  useEffect(() => {
    if (currentStore) {
      loadProducts();
      loadCategories();
    }
  }, [currentStore, currentPage, debouncedSearch, selectedCategory, showActive, showLowStock, loadProducts, loadCategories]);

  // Handlers
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentStore) return;
    if (!confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;

    try {
      await productApi.delete(currentStore.id, id);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleFormSuccess = async () => {
    await loadProducts();
    await loadCategories();
    setShowCreateForm(false);
    setEditingProduct(null);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
  };

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
        <div className="glass-card">
          <ProductList
            products={products}
            loading={loading}
            user={user}
            formatCurrency={formatCurrency}
            onEdit={handleEdit}
            onDelete={handleDelete}
            filters={{
              showLowStock,
              searchTerm: debouncedSearch,
              category: selectedCategory,
            }}
            onCreateClick={() => setShowCreateForm(true)}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            onPageChange={setCurrentPage}
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
