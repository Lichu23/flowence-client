"use client";

import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, CartProduct } from "@/contexts/CartContext";
import { useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useStore } from "@/contexts/StoreContext";
import { productApi, salesApi } from "@/lib/api";
import { ScanBarcode, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

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
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-lg sm:text-2xl font-bold truncate">
            Caja - {currentStore.name}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 truncate">
          Usuario: {user.name} (
          {user.role === "owner" ? "Propietario" : "Empleado"})
        </p>

        <div className="bg-white rounded-lg border p-3 sm:p-4">
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="flex-1 px-3 py-2 border rounded text-sm sm:text-base"
            />
            <div className="flex gap-2">
              <button
                onClick={addBySearch}
                disabled={adding || !search.trim()}
                className="flex-1 sm:flex-initial px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
              >
                {adding ? "Agregando..." : "Agregar"}
              </button>
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center text-sm"
                type="button"
              >
                <ScanBarcode className="w-4 h-4 mr-2" />
                {showScanner ? "Ocultar Escáner" : "Escanear"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Carrito Temporal</h2>
            <span className="text-sm text-gray-600">
              Artículos: {totalItems}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Escanea o agrega productos para comenzar
            </div>
          ) : (
            <ul className="divide-y">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="py-3 flex items-center gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {product.barcode || "s/código"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-8 text-center text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-600 text-xs sm:text-sm flex-shrink-0"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700">
              Subtotal: {formatCurrency(subtotal)} · Total:{" "}
              {formatCurrency(total)}
            </div>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || loading}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
            >
              {loading ? "Validando..." : "Cobrar"}
            </button>
          </div>
        </div>
      </main>

      {/* Scanner Overlay - Single instance of the scanner */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Escanear Código de Barras
              </h3>
              <button
                onClick={() => setShowScanner(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Cerrar escáner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scanner Error Message */}
            {scannerError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{scannerError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 flex-1 overflow-auto">
              <div className="h-full w-full">
                <ScanditBarcodeScanner
                  onScanSuccess={handleBarcodeScan}
                  onError={(error) => {
                    console.error("Scanner error:", error);
                    setScannerError(
                      "Error al inicializar el escáner. Por favor, recarga la página."
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm sm:max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold">
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
                className="text-gray-500 text-xl sm:text-2xl"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                  Monto recibido
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="0.00"
                  step="0.01"
                />
                {amount && parseFloat(amount) > 0 && (
                  <div className="mt-2 sm:mt-3 p-2.5 sm:p-3  rounded-lg">
                    <div className="flex justify-between text-black font-semibold text-sm sm:text-base">
                      <span>Cambio a devolver:</span>
                      <span>{formatCurrency(change)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mb-3 sm:mb-4">
                <div className="p-4 border rounded bg-gray-50">
                  <p className="text-center text-gray-600 mb-4">
                    Integración de pago con tarjeta
                  </p>
                  <button
                    disabled={loading}
                    onClick={() => {
                      toast.info("Integración de pago con tarjeta pendiente");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Completar pago
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="mb-3 sm:mb-4">
                <div className="p-4 border rounded bg-gray-50">
                  <p className="text-center text-gray-600 mb-4">
                    Integración de pago con QR
                  </p>
                  <button
                    disabled={loading}
                    onClick={() => {
                      toast.info("Integración de pago con QR pendiente");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPayment}
                  disabled={loading || items.length === 0}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border rounded"
                >
                  Cancelar
                </button>
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border rounded"
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
