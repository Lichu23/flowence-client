"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartProduct, useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useStore } from "@/contexts/StoreContext";
import { productApi, salesApi } from "@/lib/api";
import { useCallback, useState } from "react";

// Import types
import { ProductFilters } from "@/types";

// Import extracted components
import {
  POSHeader,
  ProductSearchBar,
  BarcodeScanner,
  CartList,
  EmptyCart,
  CartSummary,
  PaymentModal,
} from "./components";

function POSContent() {
  // Hooks
  const { user } = useAuth();
  const { currentStore } = useStore();
  const { formatCurrency, store: settingsStore } = useSettings();
  const {
    items,
    updateQuantity,
    removeItem,
    totalItems,
    subtotal,
    total,
    addItem,
    clear,
  } = useCart();
  const toast = useToast();

  // State
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  // Handle barcode search
  const handleBarcodeScan = async (barcode: string) => {
    try {
      setLoading(true);
      const product = await productApi.getByBarcode(currentStore!.id, barcode);
      addItem(product, 1);
      toast.success(`Producto agregado: ${product.name}`);
    } catch (error) {
      toast.error("Producto no encontrado");
      console.error("Error fetching product by barcode:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateStock = async () => {
    if (items.length === 0) return false;

    setLoading(true);
    try {
      // Validar stock de cada producto en el carrito
      for (const item of items) {
        const product = await productApi.getById(
          currentStore!.id,
          item.product.id
        );

        // Verificar si hay suficiente stock de venta
        if (product.stock_venta < item.quantity) {
          toast.error(
            `Stock insuficiente para "${item.product.name}". Disponible: ${product.stock_venta}, Solicitado: ${item.quantity}`
          );
          return false;
        }
      }
      return true;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error validando stock: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validar stock antes de abrir modal
    const hasStock = await validateStock();
    if (!hasStock) return;

    // Si hay stock, abrir modal de pago
    setShowPayment(true);
  };

  const processPayment = async () => {
    if (items.length === 0) return;

    if (paymentMethod === "cash") {
      const received = parseFloat(amount || "0");
      if (received < total) {
        toast.warning("Monto insuficiente");
        return;
      }

      // For cash payments, process immediately with amount validation

      setLoading(true);

      try {
        const payload = {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            stock_type: "venta" as const,
          })),
          payment_method: paymentMethod,
        };

        const data = await salesApi.processSale(currentStore!.id, payload);

        toast.success(`Venta completada. Recibo: ${data.receipt_number}`);

        clear();

        setAmount("");

        setShowPayment(false);
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("[CASH PAYMENT ERROR] Error message:", e.message);
          console.error("[CASH PAYMENT ERROR] Error name:", e.name);
          console.error("[CASH PAYMENT ERROR] Error stack:", e.stack);
        }

        const errorMessage =
          e instanceof Error ? e.message : "Error al procesar venta";
        console.error(
          "[CASH PAYMENT ERROR] User-facing error message:",
          errorMessage
        );

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else if (paymentMethod === "card") {
      // For card payments, process immediately (exact same logic as cash without amount validation)
      setLoading(true);

      try {
        const payload = {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            stock_type: "venta" as const,
          })),
          payment_method: paymentMethod,
        };

   
        const data = await salesApi.processSale(currentStore!.id, payload);

        toast.success(`Venta completada. Recibo: ${data.receipt_number}`);

        clear();

        setAmount("");

        setShowPayment(false);

      } catch (e: unknown) {
        console.error("[CARD PAYMENT ERROR] Error caught in catch block");
        console.error("[CARD PAYMENT ERROR] Error object:", e);

        if (e instanceof Error) {
          console.error("[CARD PAYMENT ERROR] Error message:", e.message);
          console.error("[CARD PAYMENT ERROR] Error name:", e.name);
          console.error("[CARD PAYMENT ERROR] Error stack:", e.stack);
        }

        const errorMessage =
          e instanceof Error ? e.message : "Error al procesar venta";
        console.error(
          "[CARD PAYMENT ERROR] User-facing error message:",
          errorMessage
        );

        toast.error(errorMessage);
      } finally {
        console.log("[CARD PAYMENT] Entering finally block");
        setLoading(false);
        console.log("[CARD PAYMENT] Loading state set to false");
      }
    }
  };

  const addBySearch = useCallback(async () => {
    if (!search.trim() || !currentStore) return;
    setAdding(true);
    try {
      const result = await productApi.getAll(currentStore.id, {
        search,
        limit: 1,
      } as ProductFilters);
      const prod = result.products?.[0];
      if (!prod) {
        toast.warning("Producto no encontrado");
        return;
      }

      // Create a cart-compatible product with only necessary fields
      const cartProduct: CartProduct = {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        barcode: prod.barcode || undefined,
        sku: prod.sku || undefined,
      };

      addItem(cartProduct, 1);
      toast.success(`${prod.name} agregado al carrito`);
      setSearch("");
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "No se pudo buscar el producto";
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  }, [search, currentStore, addItem, toast, setAdding, setSearch]);

  const change = Math.max(0, (parseFloat(amount || "0") || 0) - total);

  if (!user || !currentStore) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid">
      <main className="max-w-5xl mx-auto p-3 sm:p-4">
        <POSHeader
          storeName={currentStore.name}
          logoUrl={settingsStore?.logo_url}
        />

        <div className="glass-card p-3 sm:p-4 flex flex-col gap-5">
          <ProductSearchBar
            search={search}
            onSearchChange={setSearch}
            onAddProduct={addBySearch}
            adding={adding}
          />

          {/* Inline Scanner in Cart */}
          <BarcodeScanner onScanSuccess={handleBarcodeScan} />

          <CartSummary
            totalItems={totalItems}
            subtotal={subtotal}
            total={total}
            formatCurrency={formatCurrency}
            onCheckout={handleCheckout}
            loading={loading}
            hasItems={items.length > 0}
          />

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <CartList
              items={items}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        amount={amount}
        onAmountChange={setAmount}
        subtotal={subtotal}
        total={total}
        change={change}
        formatCurrency={formatCurrency}
        onConfirmPayment={processPayment}
        loading={loading}
        hasItems={items.length > 0}
      />
    </div>
  );
}

export default function POSPage() {
  return (
    <ProtectedRoute>
      <POSContent />
    </ProtectedRoute>
  );
}
