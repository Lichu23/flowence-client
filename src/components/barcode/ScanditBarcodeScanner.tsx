"use client";

import { useEffect, useRef, useState } from "react";
import {
  DataCaptureContext,
  Camera,
  FrameSourceState,
} from "@scandit/web-datacapture-core";
import {
  barcodeCaptureLoader,
  BarcodeCapture,
  BarcodeCaptureSettings,
  Symbology,
} from "@scandit/web-datacapture-barcode";

interface ScanditBarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onError?: (error: Error) => void;
}

type DataCaptureViewType =
  import("@scandit/web-datacapture-core").DataCaptureView & {
    context?: import("@scandit/web-datacapture-core").DataCaptureContext;
    element?: HTMLElement;
  };

export default function ScanditBarcodeScanner({
  onScanSuccess,
  onError,
}: ScanditBarcodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<DataCaptureViewType | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const licenseKey = process.env.NEXT_PUBLIC_SCANDIT_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error(
      "Scandit license key is not configured. Please set NEXT_PUBLIC_SCANDIT_LICENSE_KEY in your .env.local file"
    );
  }

  const initializeScanner = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let context: DataCaptureContext | null = null;
    let barcodeCapture: BarcodeCapture | null = null;

    const initScanner = async () => {
      try {
        // Initialize the SDK
        context = await DataCaptureContext.forLicenseKey(licenseKey, {
          libraryLocation:
            "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@8.0.0/sdc-lib/",
          moduleLoaders: [barcodeCaptureLoader()],
        });

        // Configure which barcode types to recognize
        const settings = new BarcodeCaptureSettings();
        settings.enableSymbologies([
          Symbology.EAN13UPCA,
          Symbology.EAN8,
          Symbology.UPCE,
          Symbology.Code128,
          Symbology.Code39,
          Symbology.QR,
        ]);

        // Create barcode capture mode with the settings
        barcodeCapture = await BarcodeCapture.forContext(context, settings);

        // Set up the barcode capture behavior
        barcodeCapture.addListener({
          didScan: async (barcodeCaptureMode, session) => {
            const barcode = session.newlyRecognizedBarcode;
            if (barcode && barcode.data && !scannedValue) {
              setScannedValue(barcode.data);
              onScanSuccess(barcode.data);

              // Stop the camera after successful scan
              const camera = context?.frameSource;
              if (camera) {
                await camera.switchToDesiredState(FrameSourceState.Off);
              }
            }
          },
        });

        // Get the camera and set it up
        const camera = Camera.pickBestGuess();
        if (camera) {
          await context.setFrameSource(camera);
          await camera.switchToDesiredState(FrameSourceState.On);
        }

        // Create a view to render the camera preview
        if (containerRef.current) {
          const { DataCaptureView } = await import(
            "@scandit/web-datacapture-core"
          );
          const view = new DataCaptureView();
          viewRef.current = view;
          view.connectToElement(containerRef.current);
          view.setContext(context);
        }
      } catch (error) {
        console.error("Error initializing scanner:", error);
        if (onError) onError(error as Error);
      }
    };

    initializeScanner.current = initScanner;
    initScanner();

    // Cleanup function
    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          const view = viewRef.current;
          if (view) {
            // If the view has a context, dispose it
            if (view.context) {
              await view.context.dispose();
            }

            // Remove the view from the DOM
            if (view.element && view.element.parentNode) {
              view.element.parentNode.removeChild(view.element);
            }
          }
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      };

      // Execute the cleanup
      cleanup().catch(console.error);
    };
  }, [onScanSuccess, onError, licenseKey, scannedValue]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {scannedValue ? (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        >
          Scanned: <strong>{scannedValue}</strong>
        </div>
      ) : (
        <div className="scandit-barcode-scanner" ref={containerRef} />
      )}
      {scannedValue && (
        <button
          onClick={async () => {
            setScannedValue(null);
            // Re-initialize the scanner
            if (containerRef.current) {
              const view = viewRef.current;
              if (view) {
                // Clean up the existing view
                if (view.context) {
                  await view.context.dispose();
                }
                if (view.element && view.element.parentNode) {
                  view.element.parentNode.removeChild(view.element);
                }
              }
              if (initializeScanner.current) {
                await initializeScanner.current();
              }
            }
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            // ... rest of your styles
          }}
        >
          Scan Again
        </button>
      )}
    </div>
  );
}
