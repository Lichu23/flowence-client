/**
 * Flowence Frontend Types
 */

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'employee';
  created_at: string;
  updated_at: string;
}

export interface StoreListItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  role: 'owner' | 'employee';
  logo_url?: string;
}

export interface UserWithStores extends User {
  stores: StoreListItem[];
}

// Store Types
export interface Store {
  id: string;
  owner_id: string;
  name: string;
  address?: string;
  phone?: string;
  currency: string;
  tax_rate: number;
  low_stock_threshold: number; // still present in DB but not configurable here
  timezone?: string;
  date_format?: string;
  time_format?: string;
  receipt_header?: string;
  receipt_footer?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreStats {
  total_products: number;
  total_sales: number;
  total_revenue: number;
  total_employees: number;
  average_sale_amount: number;
}

// Sales Types
export interface SaleItem {
  product_id: string;
  name?: string;
  quantity: number;
  unit_price?: number;
}

export interface Sale {
  id: string;
  store_id: string;
  receipt_number: string;
  payment_method: 'cash' | 'card' | 'mixed';
  payment_status: 'completed' | 'refunded' | 'cancelled' | 'pending';
  total: number;
  discount?: number;
  created_at: string;
  items?: SaleItem[];
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  store_name: string;
  store_address?: string;
  store_phone?: string;
}

export interface AuthResponse {
  user: UserWithStores;
  token: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Create Store Types
export interface CreateStoreData {
  name: string;
  address?: string;
  phone?: string;
  currency?: string;
  tax_rate?: number;
  low_stock_threshold?: number;
}

// Update Store Types
export interface UpdateStoreData {
  name?: string;
  address?: string;
  phone?: string;
  currency?: string;
  tax_rate?: number;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  receipt_header?: string;
  receipt_footer?: string;
  logo_url?: string;
}

// Invitation Types
export interface Invitation {
  id: string;
  store_id: string;
  email: string;
  token: string;
  role: 'employee' | 'owner';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SendInvitationData {
  store_id: string;
  email: string;
  role: 'employee' | 'owner';
}

export interface AcceptInvitationData {
  token: string;
  name: string;
  password: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  revoked: number;
}

export interface InvitationValidation {
  valid: boolean;
  invitation?: Invitation;
  store?: Store;
}

// Product Types
export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  stock: number; // Legacy - mantener para compatibilidad
  stock_deposito: number; // Warehouse/storage stock
  stock_venta: number; // Sales floor stock
  min_stock: number; // Legacy
  min_stock_deposito: number; // Minimum warehouse stock
  min_stock_venta: number; // Minimum sales floor stock
  unit: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price: number;
  cost: number;
  stock?: number; // Legacy - optional
  stock_deposito: number; // Required: initial warehouse stock
  stock_venta: number; // Required: initial sales floor stock
  min_stock?: number; // Legacy - optional
  min_stock_deposito?: number; // Optional: minimum warehouse stock
  min_stock_venta?: number; // Optional: minimum sales floor stock
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

// Form data interface that allows string values for numeric fields while editing
export interface ProductFormData {
  store_id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price: number | string;
  cost: number | string;
  stock: number | string; // Legacy
  stock_deposito: number | string; // Warehouse stock
  stock_venta: number | string; // Sales floor stock
  min_stock: number | string; // Legacy
  min_stock_deposito: number | string; // Min warehouse stock
  min_stock_venta: number | string; // Min sales floor stock
  unit: string;
  image_url?: string;
  is_active: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  price?: number;
  cost?: number;
  stock?: number; // Legacy
  stock_deposito?: number; // Warehouse stock
  stock_venta?: number; // Sales floor stock
  min_stock?: number; // Legacy
  min_stock_deposito?: number; // Min warehouse stock
  min_stock_venta?: number; // Min sales floor stock
  unit?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductFilters {
  store_id: string;
  search?: string;
  category?: string;
  is_active?: boolean;
  low_stock?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'price' | 'stock' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  categories_count: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: ProductStats;
}

export interface AdjustStockData {
  adjustment: number;
  reason?: string;
}

// Stock Operation Types
export interface RestockOperation {
  quantity: number;
  notes?: string;
}

export interface FillWarehouseData {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface UpdateSalesStockData {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  store_id: string;
  movement_type: 'restock' | 'adjustment' | 'sale' | 'return';
  stock_type: 'deposito' | 'venta';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  performed_by: string;
  notes?: string;
  created_at: string;
}

// Dashboard Types
export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  revenue: number;
  employees: number;
  lowStockProducts?: number; // Only for owners
  totalValue?: number; // Only for owners (deprecated)
  recentProducts?: {
    id: string;
    name: string;
    stock: number;
    price: number;
    created_at: string;
  }[]; // Only for owners
  monthlyExpenses?: number; // Monthly product purchases
  monthlySales?: number; // Sales count for current month
  monthlyRevenue?: number; // Revenue for current month
  currentMonth?: string; // e.g., "Octubre 2025"
  totalLosses?: number; // Total losses from defective products
  refundedOrders?: number; // Total number of refunded orders
  overallRevenue?: number; // Total revenue across all time (not just monthly)
  overallExpenses?: number; // Total expenses across all time (not just monthly)
}

