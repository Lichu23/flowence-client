"use client";

/**
 * Sales Management Page (Mobile Responsive)
 * Displays all store sales with filtering, search, and statistics
 */

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useStore } from "@/contexts/StoreContext";
import { useEffect, useState, useMemo } from "react";
import { salesApi } from "@/lib/api";
import type { Sale } from "@/types";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { HelpButton } from "@/components/help/HelpModal";
import { useRouter } from "next/navigation";
import {
  SalesStats,
  SalesFilters,
  SalesList,
  SalesPagination,
} from "./components";

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

  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
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

  useEffect(() => {
    if (!currentStore) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await salesApi.list(currentStore.id, {
          page,
          limit: 20,
          payment_method: method || undefined,
          payment_status: status || undefined,
        });
        setSales(data.sales);
        setPages(data.pagination.pages);
        setTotalSales(data.pagination.total);
      } catch (e) {
        console.error(e);
        setSales([]);
        setPages(0);
        setTotalSales(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentStore, page, method, status]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Ingresa un número de ticket o código de barras");
      return;
    }
    setLoading(true);
    try {
      const result = await salesApi.searchByTicket(
        currentStore!.id,
        searchTerm.trim()
      );
      router.push(`/sales/${result.sale.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Venta no encontrada");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (saleId: string) => {
    try {
      await salesApi.downloadReceipt(currentStore!.id, saleId);
      toast.success("Recibo descargado");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Error al descargar recibo");
    }
  };

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
            setPage(1);
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        {/* Sales List */}
        <div className="glass-card">
          <SalesList
            loading={loading}
            sales={sales}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            onDownloadReceipt={handleDownloadReceipt}
            hasFilters={!!(method || status)}
            currentStoreId={currentStore.id}
          />

          {/* Pagination */}
          <SalesPagination
            page={page}
            pages={pages}
            totalSales={totalSales}
            onPageChange={setPage}
          />
        </div>
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}
