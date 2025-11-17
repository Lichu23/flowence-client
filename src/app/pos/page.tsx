"use client";

import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartProduct, useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useStore } from "@/contexts/StoreContext";
import { productApi, salesApi } from "@/lib/api";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

// Import types
import { ProductFilters } from "@/types";

// Dynamically import the scanner to avoid SSR issues
const ScanditBarcodeScanner = dynamic(
  () =>
    import("@/components/barcode/ScanditBarcodeScanner").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr">(
    "cash"
  );
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerErrorShownRef = useRef<Set<string>>(new Set());
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

      // For cash payments, process immediately
      setLoading(true);
      try {
        const payload = {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
          })),
          payment_method: paymentMethod,
        } as const;

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
    } else if (paymentMethod === "card" || paymentMethod === "qr") {
      // For card/QR payments, we'll handle this in a future implementation
      // For now, just show a message
      toast.info(
        `Pago con ${
          paymentMethod === "card" ? "tarjeta" : "QR"
        } estará disponible pronto`
      );
      setShowPayment(false);
    }
  };

  // Payment method handlers will be implemented when payment integration is added

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

  // Removed unused handleScannerProductFound

  if (!user || !currentStore) return null;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <Navbar />
      <main className="max-w-5xl mx-auto p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          {settingsStore?.logo_url && (
            <Image
              src={settingsStore.logo_url}
              alt="Store logo"
              width={32}
              height={32}
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain rounded flex-shrink-0"
            />
          )}
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
            Caja - {currentStore.name}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-foreground-subtle mb-4 sm:mb-6 truncate">
          Usuario: {user.name} (
          {user.role === "owner" ? "Propietario" : "Empleado"})
        </p>

        <div className="glass-card p-3 sm:p-4">
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="input-field flex-1 text-sm sm:text-base"
            />
            <div className="flex gap-2">
              <button
                onClick={addBySearch}
                disabled={adding || !search.trim()}
                className="btn-primary flex-1 sm:flex-initial disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
              >
                {adding ? "Agregando..." : "Agregar"}
              </button>
            </div>
          </div>

          {/* Inline Scanner in Cart */}
          <div className="mt-4 p-4 glass-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">
                Escanear producto
              </h3>
            </div>
            <div className="scanner-inline">
              <ScanditBarcodeScanner
                onScanSuccess={handleBarcodeScan}
                onError={(error) => {
                  console.error("Scanner error:", error);

                  // Prevent showing the same error multiple times
                  const errorKey = error.name || "UnknownError";
                  if (scannerErrorShownRef.current.has(errorKey)) {
                    return;
                  }
                  scannerErrorShownRef.current.add(errorKey);

                  // Handle different error types
                  if (error.name === "NoCameraAvailableError") {
                    // Don't show intrusive error for no camera - the scanner component already shows a message
                    setScannerError(null);
                  } else if (error.name === "CameraAccessError") {
                    setScannerError(
                      "No se pudo acceder a la cámara. Verifica los permisos."
                    );
                    toast.error(
                      "No se pudo acceder a la cámara. Verifica los permisos."
                    );
                  } else {
                    setScannerError(
                      "Error al inicializar el escáner. Por favor, recarga la página."
                    );
                    toast.error("Error al inicializar el escáner");
                  }
                }}
              />
            </div>
            {scannerError && (
              <div className="mt-2 text-xs text-error text-center">
                {scannerError}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Carrito Temporal</h2>
            <span className="text-sm text-foreground-muted">
              Artículos: {totalItems}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center text-foreground-subtle py-10">
              Escanea o agrega productos para comenzar
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="py-3 flex items-center gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate text-sm sm:text-base">
                      {product.name}
                    </div>
                    <div className="text-xs text-foreground-subtle truncate">
                      {product.barcode || "s/código"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="btn-secondary px-2 py-1 text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-8 text-center text-sm text-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="btn-secondary px-2 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-error text-xs sm:text-sm flex-shrink-0 hover:text-error/80 transition-colors"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-foreground-muted">
              Subtotal: {formatCurrency(subtotal)} · Total:{" "}
              {formatCurrency(total)}
            </div>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || loading}
              className="btn-primary w-full sm:w-auto disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
            >
              {loading ? "Validando..." : "Cobrar"}
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="glass-card max-w-sm sm:max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Cobrar (
                {paymentMethod === "cash"
                  ? "Efectivo"
                  : paymentMethod === "card"
                  ? "Tarjeta"
                  : "QR"}
                )
              </h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-foreground-subtle hover:text-foreground text-xl sm:text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Impuesto</span>
                <span>Incluido por backend</span>
              </div>
              <div className="flex justify-between font-semibold text-sm sm:text-base">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                Método de pago
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />{" "}
                  Efectivo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />{" "}
                  Tarjeta
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                  />{" "}
                  QR
                </label>
              </div>
            </div>
            {paymentMethod === "cash" && (
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5">
                  Monto recibido
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field w-full text-base sm:text-lg"
                  placeholder="0.00"
                  step="0.01"
                />
                {amount && parseFloat(amount) > 0 && (
                  <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 glass-card rounded-lg">
                    <div className="flex justify-between text-foreground font-semibold text-sm sm:text-base">
                      <span>Cambio a devolver:</span>
                      <span>{formatCurrency(change)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mb-3 sm:mb-4">
                <div className="p-4 glass-card rounded">
                  <p className="text-center text-foreground-muted mb-4">
                    Integración de pago con tarjeta
                  </p>
                  <button
                    disabled={loading}
                    onClick={() => {
                      toast.info("Integración de pago con tarjeta pendiente");
                    }}
                    className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Completar pago
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="mb-3 sm:mb-4">
                <div className="p-4 glass-card rounded">
                  <p className="text-center text-foreground-muted mb-4">
                    Integración de pago con QR
                  </p>
                  <button
                    disabled={loading}
                    onClick={() => {
                      toast.info("Integración de pago con QR pendiente");
                    }}
                    className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mostrar código QR
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPayment(false)}
                  className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPayment}
                  disabled={loading || items.length === 0}
                  className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base disabled:opacity-50"
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPayment(false)}
                  className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPayment(false)}
                  className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Button */}
      {/* <HelpButton /> */}
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
