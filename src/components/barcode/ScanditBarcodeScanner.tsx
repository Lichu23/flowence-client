"use client";

import {
  BarcodeCapture,
  barcodeCaptureLoader,
  BarcodeCaptureSettings,
  Symbology,
} from "@scandit/web-datacapture-barcode";
import {
  Camera,
  DataCaptureContext,
  FrameSourceState,
} from "@scandit/web-datacapture-core";
import { useEffect, useRef, useState } from "react";

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
  const lastScannedRef = useRef<{ barcode: string; timestamp: number } | null>(
    null
  );
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [noCameraAvailable, setNoCameraAvailable] = useState(false);
  const initializationAttemptedRef = useRef(false);
  const errorReportedRef = useRef(false);

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

  // Effect to handle scanner initialization and cleanup
  useEffect(() => {
    if (!barcodeCaptureRef.current || !contextRef.current) return;

    const barcodeCapture = barcodeCaptureRef.current;
    const camera = contextRef.current.frameSource as Camera | null;

    const setupScanner = async () => {
      try {
        if (!viewRef.current && containerRef.current) {
          const { DataCaptureView } = await import(
            "@scandit/web-datacapture-core"
          );
          const view = new DataCaptureView();
          viewRef.current = view;
          view.connectToElement(containerRef.current);
          view.setContext(contextRef.current!);
        }

        // Enable barcode capture and camera
        await barcodeCapture.setEnabled(true);
        if (camera) {
          await camera.switchToDesiredState(FrameSourceState.On);
        }
      } catch (error) {
        console.error("Error setting up scanner:", error);
        onError?.(new Error("Failed to set up scanner"));
      }
    };

    setupScanner();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          await barcodeCapture.setEnabled(false);
          if (camera) {
            await camera.switchToDesiredState(FrameSourceState.Off);
          }
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      };
      cleanup();
    };
  }, [onError]);

  useEffect(() => {
    isMountedRef.current = true;

    // Prevent multiple initialization attempts
    if (initializationAttemptedRef.current) {
      return;
    }
    initializationAttemptedRef.current = true;

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

            // Skip if we don't have valid barcode data
            if (!barcode?.data || typeof barcode.data !== "string") {
              return;
            }

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
                // Don't update the local state, just call the success handler
                onScanSuccess(barcodeData);
                lastScannedRef.current = {
                  barcode: barcodeData,
                  timestamp: now,
                };
              } catch (error) {
                console.error("Error handling barcode scan:", error);
              }
            }, 300);
          },
        });

        // Get the camera and set it up
        const camera = Camera.pickBestGuess();
        if (!camera) {
          // No camera available on this device
          console.warn("No camera available on this device");
          setNoCameraAvailable(true);

          // Call onError with a specific message but don't throw (only once)
          if (!errorReportedRef.current) {
            errorReportedRef.current = true;
            const noCameraError = new Error(
              "No camera available on this device"
            );
            noCameraError.name = "NoCameraAvailableError";
            if (onError) onError(noCameraError);
          }
          return; // Exit initialization gracefully
        }

        try {
          await context.setFrameSource(camera);
          await camera.switchToDesiredState(FrameSourceState.On);
        } catch (cameraError) {
          // Handle camera access errors (permissions denied, camera in use, etc.)
          console.error("Error accessing camera:", cameraError);
          setNoCameraAvailable(true);

          // Only report error once
          if (!errorReportedRef.current) {
            errorReportedRef.current = true;
            const errorMessage =
              cameraError instanceof Error
                ? cameraError.message
                : "Unable to access camera";
            const error = new Error(errorMessage);
            error.name = "CameraAccessError";
            if (onError) onError(error);
          }
          return; // Exit initialization gracefully
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
        setNoCameraAvailable(true);

        // Only report error once
        if (!errorReportedRef.current) {
          errorReportedRef.current = true;
          if (onError) onError(error as Error);
        }
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

          // Reset initialization flags for potential re-mount
          initializationAttemptedRef.current = false;
          errorReportedRef.current = false;
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      };

      // Execute the cleanup
      cleanup().catch(console.error);
    };
  }, [onScanSuccess, onError, licenseKey]);

  return (
    <div
      className={`scandit-barcode-scanner w-full h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 relative flex items-center justify-center ${
        noCameraAvailable
          ? "bg-gray-100 text-gray-600"
          : "bg-black text-white"
      }`}
      ref={containerRef}
    >
      {noCameraAvailable ? (
        <div className="text-center p-4">
          <div className="text-2xl sm:text-3xl mb-2">📷</div>
          <div className="font-medium text-sm sm:text-base">
            No hay cámara disponible
          </div>
          <div className="text-xs sm:text-sm mt-2 opacity-70">
            Este dispositivo no tiene cámara o el acceso fue denegado
          </div>
        </div>
      ) : (
        <div className="text-center p-4">
          <div className="text-sm sm:text-base">
            Escaneando códigos de barras...
          </div>
          <div className="text-xs sm:text-sm mt-2 opacity-70">
            Apunta la cámara al código de barras
          </div>
        </div>
      )}
    </div>
  );
}
