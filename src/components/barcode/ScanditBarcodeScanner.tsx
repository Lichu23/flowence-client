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
  paused?: boolean;
}

type DataCaptureViewType =
  import("@scandit/web-datacapture-core").DataCaptureView & {
    context?: import("@scandit/web-datacapture-core").DataCaptureContext;
    element?: HTMLElement;
  };

export default function ScanditBarcodeScanner({
  onScanSuccess,
  onError,
  paused = false,
}: ScanditBarcodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<DataCaptureViewType | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const lastScannedRef = useRef<{ barcode: string; timestamp: number } | null>(
    null
  );
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const licenseKey = process.env.NEXT_PUBLIC_SCANDIT_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error(
      "Scandit license key is not configured. Please set NEXT_PUBLIC_SCANDIT_LICENSE_KEY in your .env.local file"
    );
  }

  const initializeScanner = useRef<(() => Promise<void>) | null>(null);

  // Keep track of the current barcode capture instance
  const barcodeCaptureRef = useRef<BarcodeCapture | null>(null);
  const contextRef = useRef<DataCaptureContext | null>(null);
  const isMountedRef = useRef(true);

  // Effect to handle pausing/resuming the scanner
  useEffect(() => {
    if (!barcodeCaptureRef.current) return;

    const barcodeCapture = barcodeCaptureRef.current;
    
    // Update the barcode capture enabled state
    const updateBarcodeCapture = async () => {
      try {
        if (paused) {
          // When paused, disable barcode capture
          await barcodeCapture.setEnabled(false);
        } else {
          // When resuming, re-enable barcode capture
          await barcodeCapture.setEnabled(true);
        }
      } catch (error) {
        console.error("Error updating barcode capture state:", error);
        onError?.(new Error("Failed to update barcode capture state"));
      }
    };

    // Handle camera state
    const updateCameraState = async () => {
      const camera = contextRef.current?.frameSource as Camera | null;
      if (camera) {
        try {
          await camera.switchToDesiredState(
            paused ? FrameSourceState.Off : FrameSourceState.On
          );
        } catch (error) {
          console.error("Error updating camera state:", error);
          onError?.(new Error("Failed to update camera state"));
        }
      }
    };

    updateBarcodeCapture();
    updateCameraState();

    return () => {
      // Cleanup function for the effect
    };
  }, [paused, onError]);

  useEffect(() => {
    isMountedRef.current = true;
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
        barcodeCaptureRef.current = barcodeCapture;
        contextRef.current = context;

        // Set up the barcode capture behavior
        barcodeCapture.addListener({
          didScan: async (barcodeCaptureMode, session) => {
            const barcode = session.newlyRecognizedBarcode;
            const now = Date.now();

            // Skip if we don't have valid barcode data or if we're already processing a scan
            if (
              !barcode?.data ||
              typeof barcode.data !== "string" ||
              scannedValue
            )
              return;

            // TypeScript now knows barcode.data is a string
            const barcodeData = barcode.data;

            // Check if this is the same barcode scanned recently
            if (
              lastScannedRef.current &&
              lastScannedRef.current.barcode === barcodeData &&
              now - lastScannedRef.current.timestamp < 2000 // 2 second cooldown for same barcode
            ) {
              return;
            }

            // Clear any pending scan
            if (scanTimeoutRef.current) {
              clearTimeout(scanTimeoutRef.current);
            }

            // Set new scan with debounce
            scanTimeoutRef.current = setTimeout(async () => {
              try {
                setScannedValue(barcodeData);
                onScanSuccess(barcodeData);
                lastScannedRef.current = {
                  barcode: barcodeData,
                  timestamp: now,
                };

                // Stop the camera after successful scan
                const camera = context?.frameSource;
                if (camera) {
                  await camera.switchToDesiredState(FrameSourceState.Off);
                }
              } catch (error) {
                console.error("Error processing barcode scan:", error);
                setScannedValue(null); // Reset to allow new scans
              }
            }, 100); // 100ms debounce delay
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
    
    // Initialize the scanner when the component mounts
    initScanner();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;

      // Clear any pending timeouts
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

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

          // Clear refs
          barcodeCaptureRef.current = null;
          contextRef.current = null;
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
