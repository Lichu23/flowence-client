// src/app/pos/components/BarcodeScanner.tsx

import { FC, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";
import { Camera, StopCircle } from "lucide-react";

// Dynamically import the scanner to avoid SSR issues
const ScanditBarcodeScanner = dynamic(
  () =>
    import("@/components/barcode/ScanditBarcodeScanner").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (error: Error) => void;
  onActivate?: () => void;
  autoHideOnScan?: boolean;
}

export const BarcodeScanner: FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onError,
  onActivate,
  autoHideOnScan = true,
}) => {
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerErrorShownRef = useRef<Set<string>>(new Set());
  const deactivateButtonRef = useRef<HTMLButtonElement>(null);

  const handleActivate = () => {
    setIsActive(true);
    setScannerError(null);
    scannerErrorShownRef.current.clear();
    onActivate?.();

    // Focus on deactivate button after camera activates
    setTimeout(() => {
      deactivateButtonRef.current?.focus();
    }, 100);
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setScannerError(null);
  };

  const handleScanSuccess = (barcode: string) => {
    onScanSuccess(barcode);

    // Auto-hide scanner after successful scan
    if (autoHideOnScan) {
      setTimeout(() => {
        setIsActive(false);
        setScannerError(null);
      }, 500);
    }
  };

  const handleError = (error: Error) => {
    // Only handle errors when scanner is active
    if (!isActive) return;

    console.error("Scanner error:", error);

    // Prevent showing the same error multiple times
    const errorKey = error.name || "UnknownError";
    if (scannerErrorShownRef.current.has(errorKey)) {
      return;
    }
    scannerErrorShownRef.current.add(errorKey);

    // Handle different error types
    if (error.name === "NoCameraAvailableError") {
      setScannerError("No hay cámara disponible en este dispositivo");
      toast.error("No hay cámara disponible");
    } else if (error.name === "CameraAccessError") {
      setScannerError(
        "No se pudo acceder a la cámara. Verifica los permisos."
      );
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
    } else {
      setScannerError(
        "Error al inicializar el escáner. Intenta de nuevo."
      );
      toast.error("Error al inicializar el escáner");
    }

    // Call custom error handler if provided
    onError?.(error);
  };

  if (!isActive) {
    return (
      <div className="scanner-inline">
        <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 relative flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
          <div className="flex flex-col items-center gap-4 px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/50 dark:to-fuchsia-900/50 flex items-center justify-center">
              <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base font-medium text-foreground mb-1">
                Escáner de códigos de barras
              </p>
              <p className="text-xs sm:text-sm text-foreground-muted">
                Presiona para escanear códigos de barras
              </p>
            </div>
            <button
              onClick={handleActivate}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-medium rounded-lg shadow-purple hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Activar cámara para escanear códigos de barras"
            >
              <Camera className="w-5 h-5" />
              <span>Activar Cámara</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-inline">
      <div className="relative">
        <ScanditBarcodeScanner
          onScanSuccess={handleScanSuccess}
          onError={handleError}
          isActive={isActive}
        />
        <div className="mt-3 flex flex-col gap-2">
          <button
            ref={deactivateButtonRef}
            onClick={handleDeactivate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Detener cámara"
          >
            <StopCircle className="w-5 h-5" />
            <span>Detener Cámara</span>
          </button>
          {scannerError && (
            <div className="text-xs text-error text-center p-2 bg-error/10 rounded border border-error/20">
              {scannerError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
