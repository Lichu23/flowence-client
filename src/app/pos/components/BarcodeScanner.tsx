// src/app/pos/components/BarcodeScanner.tsx

import { FC, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";

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
}

export const BarcodeScanner: FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onError,
}) => {
  const toast = useToast();
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerErrorShownRef = useRef<Set<string>>(new Set());

  const handleError = (error: Error) => {
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
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
    } else {
      setScannerError(
        "Error al inicializar el escáner. Por favor, recarga la página."
      );
      toast.error("Error al inicializar el escáner");
    }

    // Call custom error handler if provided
    onError?.(error);
  };

  return (
    <div className="scanner-inline">
      <ScanditBarcodeScanner
        onScanSuccess={onScanSuccess}
        onError={handleError}
      />
      {scannerError && (
        <div className="mt-2 text-xs text-error text-center">
          {scannerError}
        </div>
      )}
    </div>
  );
};
