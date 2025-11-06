"use client";

import BarcodeScannerZXing from "@/components/BarcodeScannerZXing";
import { useToast } from "@/components/ui";
import { useState } from "react";

export default function BarcodeTestPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { error, success } = useToast();

  const handleScan = (code: string) => {
    console.log("Código escaneado:", code);
    setScannedCode(code);
    setIsScannerOpen(false);

    success(`¡Código escaneado! Se ha leído el código: ${code}`);
  };

  const handleError = (err: Error) => {
    console.error("Error del escáner:", err);
    error(err.message || "Ocurrió un error al escanear");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Prueba de Escáner de Códigos</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto"
          >
            Abrir Escáner
          </button>

          {scannedCode && (
            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h2 className="text-lg font-semibold mb-2">
                Último código escaneado:
              </h2>
              <p className="font-mono text-lg bg-gray-100 p-3 rounded">
                {scannedCode}
              </p>
            </div>
          )}

          {isScannerOpen && (
            <div className="w-full max-w-md mx-auto">
              <BarcodeScannerZXing  
                onScan={(result) => console.log("Scanned:", result)}
                onError={(error) => console.error("Scanner error:", error)}
                debug={process.env.NODE_ENV === "development"}
              />{" "}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cerrar Escáner
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Instrucciones:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Haz clic en Abrir Escáner para activar la cámara</li>
          <li>Enfoca un código de barras o QR dentro del área delimitada</li>
          <li>El código escaneado aparecerá automáticamente</li>
          <li>Usa el botón Cerrar Escáner para desactivar la cámara</li>
        </ul>
      </div>
    </div>
  );
}
