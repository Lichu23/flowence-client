"use client";

/**
 * Sales Management Page (Mobile Responsive)
 * Displays all store sales with filtering, search, and statistics
 */

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useStore } from "@/contexts/StoreContext";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { salesApi } from "@/lib/api";
import type { Sale } from "@/types";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { HelpButton } from "@/components/help/HelpModal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SalesStats,
  SalesFilters,
  SalesList,
  SalesPagination,
} from "./components";

// Type for sales list response
interface SalesListResponse {
  sales: Sale[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

// Generate cache key for client-side caching
function getCacheKey(
  storeId: string,
  page: number,
  method: string,
  status: string
): string {
  return JSON.stringify({
    storeId,
    page,
    method,
    status,
  });
}

export default function SalesPage() {
  return (
    <ProtectedRoute>
      <SalesContent />
    </ProtectedRoute>
  );
}

function SalesContent() {
  const { currentStore } = useStore();
  const { formatCurrency, formatDateTime } = useSettings();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const salesListRef = useRef<HTMLDivElement>(null);

  // Client-side cache for pages (Map preserves insertion order)
  const cacheRef = useRef<Map<string, SalesListResponse>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // State management
  const [sales, setSales] = useState<Sale[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [method, setMethod] = useState<"cash" | "card" | "mixed" | "">("");
  const [status, setStatus] = useState<
    "completed" | "refunded" | "cancelled" | "pending" | ""
  >("");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate stats from current sales data
  const stats = useMemo(() => {
    // Calculate revenue: only include non-refunded sales (completed, pending, cancelled)
    const totalRevenue = sales.reduce((sum, sale) => {
      const amount = Number(sale.total || 0);
      // Exclude refunded sales completely from revenue calculation
      if (sale.payment_status === "refunded") {
        return sum; // Don't add refunded sales
      }
      return sum + amount; // Add all other sales
    }, 0);

    const completedSales = sales.filter(
      (s) => s.payment_status === "completed"
    );
    const cashSales = sales.filter((s) => s.payment_method === "cash").length;
    const cardSales = sales.filter((s) => s.payment_method === "card").length;

    return {
      totalRevenue,
      totalSales: sales.length,
      completedSales: completedSales.length,
      cashSales,
      cardSales,
    };
  }, [sales]);

  // Sync URL → state (single direction, no loop)
  // URL is the single source of truth for page number
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(pageFromUrl);
  }, [searchParams]); // ← ONLY depend on searchParams, NOT currentPage

  // Clear cache when filters change (not page)
  useEffect(() => {
    cacheRef.current.clear();
  }, [method, status, currentStore?.id]);

  // Load sales with cache-first strategy
  useEffect(() => {
    if (!currentStore) return;

    const cacheKey = getCacheKey(currentStore.id, currentPage, method, status);

    // Check cache first - instant load for visited pages
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      // Instant update from cache (zero flicker)
      setSales(cached.sales || []);
      setTotalSales(cached.pagination?.total || 0);
      setTotalPages(cached.pagination?.pages || 0);
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

    const loadSales = async () => {
      try {
        const result = await salesApi.list(currentStore.id, {
          page: currentPage,
          limit: 10,
          payment_method: method || undefined,
          payment_status: status || undefined,
        });

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          // Cache the result
          cacheRef.current.set(cacheKey, result);

          setSales(result.sales || []);
          setTotalSales(result.pagination?.total || 0);
          setTotalPages(result.pagination?.pages || 0);
          setIsInitialLoad(false);
        }
      } catch (error) {
        // Ignore abort errors (normal when filters change rapidly)
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        // Only update error state if request wasn't aborted
        if (!signal.aborted) {
          console.error("Failed to load sales:", error);
          setSales([]);
          setTotalSales(0);
          setTotalPages(0);
          setIsInitialLoad(false);
        }
      }
    };

    loadSales();

    // Cleanup: abort request if dependencies change before completion
    return () => {
      controller.abort();
    };
  }, [currentStore, currentPage, method, status]);

  // Handlers - memoized to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (page: number) => {
      // Update URL directly (state will sync via useEffect)
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(`/sales${newUrl}`, { scroll: false });

      // Scroll to top of sales list smoothly
      if (salesListRef.current) {
        salesListRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast.error("Ingresa un número de ticket o código de barras");
      return;
    }
    try {
      const result = await salesApi.searchByTicket(
        currentStore!.id,
        searchTerm.trim()
      );
      router.push(`/sales/${result.sale.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Venta no encontrada");
    }
  }, [searchTerm, currentStore, toast, router]);

  const handleDownloadReceipt = useCallback(
    async (saleId: string) => {
      try {
        await salesApi.downloadReceipt(currentStore!.id, saleId);
        toast.success("Recibo descargado");
      } catch (error) {
        console.error("Failed to download receipt:", error);
        toast.error("Error al descargar recibo");
      }
    },
    [currentStore, toast]
  );

  if (!currentStore) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-foreground-muted">
            Selecciona una tienda para ver las ventas
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ventas
          </h2>
        </div>

        {/* Stats Cards */}
        <SalesStats
          totalSales={totalSales}
          stats={stats}
          formatCurrency={formatCurrency}
          hasFilters={!!(method || status)}
        />

        {/* Search and Filters */}
        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          method={method}
          onMethodChange={(value) => {
            setMethod(value);
            handlePageChange(1); // Reset to page 1 when filter changes
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            handlePageChange(1); // Reset to page 1 when filter changes
          }}
        />

        {/* Sales List */}
        <div className="glass-card" ref={salesListRef}>
          <SalesList
            loading={isInitialLoad}
            sales={sales}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            onDownloadReceipt={handleDownloadReceipt}
            hasFilters={!!(method || status)}
            currentStoreId={currentStore.id}
          />

          {/* Pagination - never show loading state to prevent flicker */}
          <SalesPagination
            page={currentPage}
            pages={totalPages}
            totalSales={totalSales}
            onPageChange={handlePageChange}
            loading={false}
          />
        </div>
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}
