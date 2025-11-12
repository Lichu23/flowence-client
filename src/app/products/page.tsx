'use client';

/**
 * Products Management Page (Mobile Responsive)
 */

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { productApi } from '@/lib/api';
import { Product, UpdateProductData, ProductFormData } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/Toast';
import { HelpButton } from '@/components/help/HelpModal';

function ProductsContent() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { formatCurrency } = useSettings();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total_products: 0, total_value: 0, low_stock_count: 0, out_of_stock_count: 0, categories_count: 0 });
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // 500ms delay
  const [showActive] = useState<boolean | undefined>(undefined);
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    store_id: currentStore?.id || '',
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0, // Legacy
    stock_deposito: 0, // Warehouse stock
    stock_venta: 0, // Sales floor stock
    min_stock: 5, // Legacy
    min_stock_deposito: 10, // Min warehouse stock
    min_stock_venta: 5, // Min sales floor stock
    unit: 'unit',
    is_active: true,
  });
  
  // Helper functions for number input handling
  const handleNumberChange = (field: string, value: string) => {
    if (value === '') {
      // Allow empty values while editing
      setFormData({ ...formData, [field]: '' });
    } else {
      const numValue = field === 'price' || field === 'cost' ? parseFloat(value) : parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData({ ...formData, [field]: numValue });
      }
    }
  };
  
  const getDisplayValue = (value: number | string) => {
    return value === '' ? '' : String(value);
  };
  
  // Helper to ensure numeric values for API calls
  const ensureNumber = (value: number | string | undefined, fallback: number): number => {
    if (value === '' || value === undefined || value === null) {
      return fallback;
    }
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
      
      // Extract unique categories from products
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
      setStats(result.stats || { total_products: 0, total_value: 0, low_stock_count: 0, out_of_stock_count: 0, categories_count: 0 });
    } catch (error) {
      console.error('Failed to load products:', error);
      // Reset to empty state on error
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
      setStats({ total_products: 0, total_value: 0, low_stock_count: 0, out_of_stock_count: 0, categories_count: 0 });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setFormError('');
    setFormLoading(true);

    try {
      // Ensure numeric fields have proper values before sending
      const processedData = {
        ...formData,
        store_id: currentStore.id,
        price: ensureNumber(formData.price, 0),
        cost: ensureNumber(formData.cost, 0),
        stock: ensureNumber(formData.stock, 0), // Legacy
        stock_deposito: ensureNumber(formData.stock_deposito, 0),
        stock_venta: ensureNumber(formData.stock_venta, 0),
        min_stock: ensureNumber(formData.min_stock, 5), // Legacy
        min_stock_deposito: ensureNumber(formData.min_stock_deposito, 10),
        min_stock_venta: ensureNumber(formData.min_stock_venta, 5)
      };
      
      console.log('🆕 Creating product:', processedData);
      const createdProduct = await productApi.create(processedData);
      console.log('✅ Product created successfully:', createdProduct);
      
      // Close form and reset
      setShowCreateForm(false);
      resetForm();
      
      // Show success toast
      toast.success('Producto creado exitosamente');
      
      // Force reload products and categories
      console.log('🔄 Reloading products after creation...');
      await loadProducts();
      await loadCategories();
      
      console.log('✅ Reload completed');
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !editingProduct) return;

    setFormError('');
    setFormLoading(true);

    try {
      if (user?.role === 'employee') {
        // For employees: Only update sales stock using the specific endpoint
        const newStockVenta = ensureNumber(formData.stock_venta, 0);
        const reason = 'Actualización de stock por empleado';
        
        await productApi.updateSalesStock(currentStore.id, editingProduct.id, {
          quantity: newStockVenta,
          reason: reason,
          notes: `Stock actualizado de ${editingProduct.stock_venta} a ${newStockVenta}`
        });
      } else {
        // For owners: Full product update
        const updates: UpdateProductData = {
          name: formData.name,
          description: formData.description,
          barcode: formData.barcode,
          sku: formData.sku,
          category: formData.category,
          price: ensureNumber(formData.price, 0),
          cost: ensureNumber(formData.cost, 0),
          stock: ensureNumber(formData.stock, 0), // Legacy
          stock_deposito: ensureNumber(formData.stock_deposito, 0),
          stock_venta: ensureNumber(formData.stock_venta, 0),
          min_stock: ensureNumber(formData.min_stock, 5), // Legacy
          min_stock_deposito: ensureNumber(formData.min_stock_deposito, 10),
          min_stock_venta: ensureNumber(formData.min_stock_venta, 5),
          unit: formData.unit,
          is_active: formData.is_active,
        };

        await productApi.update(currentStore.id, editingProduct.id, updates);
      }
      
      setEditingProduct(null);
      resetForm();
      toast.success('Producto actualizado exitosamente');
      loadProducts();
      loadCategories();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentStore) return;
    if (!confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;

    try {
      await productApi.delete(currentStore.id, id);
      toast.success(`Producto "${name}" eliminado`);
      loadProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar producto';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      store_id: product.store_id,
      name: product.name,
      description: product.description || '',
      barcode: product.barcode || '',
      sku: product.sku || '',
      category: product.category || '',
      price: product.price,
      cost: product.cost,
      stock: product.stock, // Legacy
      stock_deposito: product.stock_deposito || 0,
      stock_venta: product.stock_venta || 0,
      min_stock: product.min_stock, // Legacy
      min_stock_deposito: product.min_stock_deposito || 10,
      min_stock_venta: product.min_stock_venta || 5,
      unit: product.unit,
      is_active: product.is_active,
    });
    setFormError('');
  };

  const handleEmployeeEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      store_id: product.store_id,
      name: product.name,
      description: product.description || '',
      barcode: product.barcode || '',
      sku: product.sku || '',
      category: product.category || '',
      price: product.price,
      cost: product.cost,
      stock: product.stock, // Legacy
      stock_deposito: product.stock_deposito || 0,
      stock_venta: product.stock_venta || 0,
      min_stock: product.min_stock, // Legacy
      min_stock_deposito: product.min_stock_deposito || 10,
      min_stock_venta: product.min_stock_venta || 5,
      unit: product.unit,
      is_active: product.is_active,
    });
    setFormError('');
  };

  const resetForm = () => {
    setFormData({
      store_id: currentStore?.id || '',
      name: '',
      description: '',
      barcode: '',
      sku: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0, // Legacy
      stock_deposito: 0,
      stock_venta: 0,
      min_stock: 5, // Legacy
      min_stock_deposito: 10,
      min_stock_venta: 5,
      unit: 'unit',
      is_active: true,
    });
    setFormError('');
  };

  // Handle scanner product found

  const calculateProfit = (price: number, cost: number) => {
    const profit = price - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0';
    return { profit, margin };
  };

  if (!currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">Selecciona una tienda para gestionar productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventario</h2>
          
          {user?.role === 'owner' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm sm:text-base">Agregar Producto</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Productos</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_products}</p>
            {debouncedSearch && (
              <p className="text-xs text-blue-600 mt-1">({totalProducts} encontrados)</p>
            )}
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Valor Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.total_value)}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Stock Bajo</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.low_stock_count}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Sin Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.out_of_stock_count}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código de barras o SKU..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Loading indicator while debouncing */}
                  {search !== debouncedSearch && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowLowStock(!showLowStock);
                  setCurrentPage(1);
                }}
                className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  showLowStock
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}
              >
                Stock Bajo
              </button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-600 mt-4">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              {/* Mostrar diferentes mensajes según los filtros aplicados */}
              {showLowStock ? (
                // Mensaje específico para filtro de stock bajo
                <>
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm sm:text-base text-gray-600">¡Excelente! No hay productos con stock bajo</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Todos tus productos tienen stock suficiente</p>
                </>
              ) : debouncedSearch || selectedCategory ? (
                // Mensaje para cuando hay filtros de búsqueda o categoría
                <>
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm sm:text-base text-gray-600">No se encontraron productos</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    {debouncedSearch && selectedCategory 
                      ? `con "${debouncedSearch}" en la categoría "${selectedCategory}"`
                      : debouncedSearch 
                        ? `que coincidan con "${debouncedSearch}"`
                        : `en la categoría "${selectedCategory}"`
                    }
                  </p>
                </>
              ) : (
                // Mensaje cuando realmente no hay productos (sin filtros)
                <>
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">No hay productos aún</p>
                  {user?.role === 'owner' && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Crear Primer Producto
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depósito</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Venta</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const { margin } = calculateProfit(product.price, product.cost);
                      const isLowStockDeposito = (product.stock_deposito || 0) <= (product.min_stock_deposito || 10);
                      const isLowStockVenta = (product.stock_venta || 0) <= (product.min_stock_venta || 5);
                      
                      return (
                        <tr key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.category && (
                              <div className="text-xs text-gray-500">{product.category}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 font-mono">{product.barcode || '-'}</div>
                            {product.sku && (
                              <div className="text-xs text-gray-500 font-mono">SKU: {product.sku}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                            <div className="text-xs text-green-600">+{margin}%</div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(product.cost)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-medium ${isLowStockDeposito ? 'text-orange-600' : 'text-gray-900'}`}>
                              {product.stock_deposito || 0}
                            </span>
                            {isLowStockDeposito && <div className="text-xs text-orange-600">Bajo</div>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-medium ${isLowStockVenta ? 'text-orange-600' : 'text-gray-900'}`}>
                              {product.stock_venta || 0}
                            </span>
                            {isLowStockVenta && <div className="text-xs text-orange-600">Bajo</div>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              {user?.role === 'owner' ? (
                                <>
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded text-sm"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id, product.name)}
                                    className="text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded text-sm"
                                  >
                                    Eliminar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleEmployeeEdit(product)}
                                  className="text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded text-sm"
                                  title="Editar stock de venta"
                                >
                                  Editar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {products.map((product) => {
                  const { margin } = calculateProfit(product.price, product.cost);
                  const isLowStockDeposito = (product.stock_deposito || 0) <= (product.min_stock_deposito || 10);
                  const isLowStockVenta = (product.stock_venta || 0) <= (product.min_stock_venta || 5);
                  
                  return (
                    <div key={product.id} className={`p-4 ${!product.is_active ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                          {product.category && (
                            <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {(product.barcode || product.sku) && (
                        <div className="text-xs font-mono text-gray-600 mb-2">
                          {product.barcode && <div>Código: {product.barcode}</div>}
                          {product.sku && <div>SKU: {product.sku}</div>}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Precio</p>
                          <p className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</p>
                          <p className="text-xs text-green-600">Margen: {margin}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Stock Depósito</p>
                          <p className={`text-base font-bold ${isLowStockDeposito ? 'text-orange-600' : 'text-gray-900'}`}>
                            {product.stock_deposito || 0}
                          </p>
                          {isLowStockDeposito && <p className="text-xs text-orange-600">Bajo!</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Stock Piso de Ventas</p>
                          <p className={`text-base font-bold ${isLowStockVenta ? 'text-orange-600' : 'text-gray-900'}`}>
                            {product.stock_venta || 0}
                          </p>
                          {isLowStockVenta && <p className="text-xs text-orange-600">Stock bajo!</p>}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        {user?.role === 'owner' ? (
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors active:scale-95"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEmployeeEdit(product)}
                            className="w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
                            title="Editar stock de venta"
                          >
                            Editar Stock de Venta
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Página {currentPage} de {totalPages} ({totalProducts} productos)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Product Modal */}
        {(showCreateForm || editingProduct) && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking outside the modal content
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
                setEditingProduct(null);
                resetForm();
              }
            }}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
                {/* Employee Notice */}
                {user?.role === 'employee' && editingProduct && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Modo Empleado</p>
                        <p className="text-xs text-blue-700 mt-1">Solo puedes editar el stock de venta. Los cambios se descontarán automáticamente del depósito.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={user?.role === 'employee' && !!editingProduct}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ej: Coca Cola 600ml"
                  />
                </div>

                {/* Barcode and SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      disabled={user?.role === 'employee' && !!editingProduct}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                        user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      placeholder="7891234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      disabled={user?.role === 'employee' && !!editingProduct}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                        user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                      placeholder="PROD-001"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Categoría
                  </label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={user?.role === 'employee' && !!editingProduct}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="Bebidas, Snacks, etc."
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Price and Cost */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Precio de Venta *
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-2.5 sm:top-3 text-sm sm:text-base ${
                        user?.role === 'employee' && !!editingProduct ? 'text-gray-400' : 'text-gray-500'
                      }`}>$</span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={getDisplayValue(formData.price)}
                        onChange={(e) => handleNumberChange('price', e.target.value)}
                        disabled={user?.role === 'employee' && !!editingProduct}
                        className={`w-full pl-7 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Costo *
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-2.5 sm:top-3 text-sm sm:text-base ${
                        user?.role === 'employee' && !!editingProduct ? 'text-gray-400' : 'text-gray-500'
                      }`}>$</span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={getDisplayValue(formData.cost)}
                        onChange={(e) => handleNumberChange('cost', e.target.value)}
                        disabled={user?.role === 'employee' && !!editingProduct}
                        className={`w-full pl-7 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Dual Stock System */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Sistema de Stock Dual</h4>
                  
                  {/* Warehouse Stock */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Stock Depósito *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={getDisplayValue(formData.stock_deposito)}
                        onChange={(e) => handleNumberChange('stock_deposito', e.target.value)}
                        disabled={user?.role === 'employee' && !!editingProduct}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.role === 'employee' && !!editingProduct ? 'Solo para propietarios' : 'Almacén/Bodega'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mínimo Depósito
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={getDisplayValue(formData.min_stock_deposito)}
                        onChange={(e) => handleNumberChange('min_stock_deposito', e.target.value)}
                        disabled={user?.role === 'employee' && !!editingProduct}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Sales Floor Stock */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Stock Piso Venta *
                        {user?.role === 'employee' && !!editingProduct && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">(Único campo editable)</span>
                        )}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={getDisplayValue(formData.stock_venta)}
                        onChange={(e) => handleNumberChange('stock_venta', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.role === 'employee' && !!editingProduct ? 'Los cambios se descontarán del depósito automáticamente' : 'Exhibición/Ventas'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mínimo Venta
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={getDisplayValue(formData.min_stock_venta)}
                        onChange={(e) => handleNumberChange('min_stock_venta', e.target.value)}
                        disabled={user?.role === 'employee' && !!editingProduct}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Unidad
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={user?.role === 'employee' && !!editingProduct}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="unit">Unidad</option>
                    <option value="kg">Kilogramo</option>
                    <option value="g">Gramo</option>
                    <option value="lb">Libra</option>
                    <option value="box">Caja</option>
                    <option value="pack">Paquete</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    disabled={user?.role === 'employee' && !!editingProduct}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      user?.role === 'employee' && editingProduct ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="Descripción opcional del producto..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={user?.role === 'employee' && !!editingProduct}
                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                      user?.role === 'employee' && !!editingProduct ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <label htmlFor="is_active" className={`ml-2 text-sm ${
                    user?.role === 'employee' && !!editingProduct ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    Producto activo para ventas
                  </label>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    {formLoading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear Producto')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

