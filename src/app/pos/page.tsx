"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartProduct, useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useStore } from "@/contexts/StoreContext";
import { productApi, salesApi } from "@/lib/api";
import { useCallback, useState, useEffect } from "react";

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
    tax,
    taxRate,
    addItem,
    clear,
    setTaxRate,
  } = useCart();
  const toast = useToast();

  // Set tax rate from store settings
  useEffect(() => {
    if (settingsStore?.tax_rate !== undefined) {
      setTaxRate(settingsStore.tax_rate);
    }
  }, [settingsStore?.tax_rate, setTaxRate]);

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
    } catch {
      toast.error("Producto no encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Stock is validated server-side when processing the sale
    // No need for client-side validation since products are already fetched when scanned
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
        const errorMessage =
          e instanceof Error ? e.message : "Error al procesar venta";
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
        const errorMessage =
          e instanceof Error ? e.message : "Error al procesar venta";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
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

          {/* Cart Items First */}
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <CartList
              items={items}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          )}

          {/* Summary and Checkout Button at Bottom */}
          <CartSummary
            totalItems={totalItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            formatCurrency={formatCurrency}
            onCheckout={handleCheckout}
            loading={loading}
            hasItems={items.length > 0}
          />
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
        tax={tax}
        taxRate={taxRate}
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
