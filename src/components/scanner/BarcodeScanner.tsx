"use client";

/**
 * BarcodeScanner Component
 * Core component that handles QuaggaJS barcode scanning functionality
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Quagga, { QuaggaJSResultObject, QuaggaJSConfigObject } from "quagga";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onError: (error: string) => void;
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  isActive?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onDetected,
  onError,
  width = 640,
  height = 480,
  facingMode = "environment", // Back camera by default
  isActive = true,
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug: Log component mount
  useEffect(() => {
    console.log("🔵 [BarcodeScanner] Component mounted");
    return () => {
      console.log("🔴 [BarcodeScanner] Component unmounted");
    };
  }, []);

  // Debouncing state to prevent multiple detections
  const lastDetectedCode = useRef<string>("");
  const detectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProcessingDetection = useRef<boolean>(false);

  const config = useMemo(
    (): QuaggaJSConfigObject => ({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current || undefined,
        constraints: {
          width: width || 1280,
          height: height || 720,
          facingMode,
          aspectRatio: {
            min: 1.77,
            max: 1.78
          }, // 16:9 aspect ratio (16/9 ≈ 1.777...)
        },
        area: {
          top: "0%",
          right: "0%",
          left: "0%",
          bottom: "0%",
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader",
        ] as string[],
        debug: {
          showCanvas: true,
          showPatches: true,
          showFoundPatches: false,
          showSkeleton: false,
          showLabels: false,
          showPatchLabels: false,
          showRemainingPatchLabels: false,
          boxFromPatches: {
            showTransformed: true,
            showTransformedBox: true,
            showBB: true,
          },
        },
      },
      locator: {
        patchSize: "medium" as const,
        halfSample: true,
      },
      numOfWorkers: Math.min(4, navigator.hardwareConcurrency || 4),
      frequency: 10,
      locate: true,
    }),
    [facingMode, width, height]
  );

  // Handle barcode detection with debouncing
  const handleDetected = useCallback(
    (result: QuaggaJSResultObject) => {
      console.log(
        "[handleDetected] Callback invoked, isActive:",
        isActive,
        "isInitialized:",
        isInitialized
      );
      const code = result.codeResult.code;

      console.log("📷 [Scanner] Barcode detected:", {
        code,
        format: result.codeResult.format,
        confidence: result.codeResult.decodedCodes?.[0]?.error,
        length: code?.length,
      });

      // Basic validation
      if (!code || code.length < 8) {
        console.warn("⚠️ [Scanner] Invalid code detected - too short:", code);
        return;
      }

      // Prevent multiple detections of the same code
      if (isProcessingDetection.current || lastDetectedCode.current === code) {
        console.log("🔄 [Scanner] Duplicate detection ignored:", code);
        return;
      }

      console.log("✅ [Scanner] Valid barcode accepted:", code);

      // Set processing flag and remember the code
      isProcessingDetection.current = true;
      lastDetectedCode.current = code;
      setIsProcessing(true);

      // Clear any existing timeout
      if (detectionTimeout.current) {
        clearTimeout(detectionTimeout.current);
      }

      // Pause scanner briefly to prevent rapid re-detection
      try {
        Quagga.pause();
        console.log("⏸️ [Scanner] Scanner paused for processing");
      } catch (err) {
        console.warn("❌ [Scanner] Error pausing scanner:", err);
      }

      // Call the detection handler
      console.log("📤 [Scanner] Sending code to parent handler:", code);
      onDetected(code);

      // Reset detection state after a delay
      detectionTimeout.current = setTimeout(() => {
        console.log("🔓 [Scanner] Cooldown period ended, ready for next scan");
        isProcessingDetection.current = false;
        lastDetectedCode.current = "";
        setIsProcessing(false);

        // Resume scanning if still active
        if (isActive && isInitialized) {
          try {
            Quagga.start();
            console.log("▶️ [Scanner] Scanner resumed");
          } catch (err) {
            console.warn("❌ [Scanner] Error resuming scanner:", err);
          }
        }
      }, 2000); // 2 second cooldown period
    },
    [onDetected, isActive, isInitialized]
  );

  // Debug: Log handleDetected changes
  useEffect(() => {
    console.log("🔄 [DEBUG] handleDetected dependency changed");
  }, [handleDetected]);

  // Initialize scanner with better error handling
  const initializeScanner = useCallback(async () => {
    if (!scannerRef.current) {
      console.log("🛑 [Scanner] Scanner ref not ready");
      return;
    }

    if (isInitialized) {
      console.log("🔄 [Scanner] Scanner already initialized");
      return;
    }

    console.log("🚀 [Scanner] Starting scanner initialization...");

    try {
      // First check camera permissions
      console.log("🔍 [Scanner] Checking camera permissions...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream as we just needed to check permissions
      stream.getTracks().forEach((track) => track.stop());
      console.log("✅ [Scanner] Camera access granted");

      // Update config with the actual target element
      const updatedConfig = {
        ...config,
        inputStream: {
          ...config.inputStream,
          target: scannerRef.current,
        },
      };

      // Initialize Quagga
      await new Promise<void>((resolve, reject) => {
        console.log("🔧 [Scanner] Initializing Quagga...");
        Quagga.init(updatedConfig, (err) => {
          if (err) {
            console.error("❌ [Scanner] Quagga initialization error:", err);
            reject(err);
            return;
          }
          console.log("✅ [Scanner] Quagga initialized successfully");
          resolve();
        });
      });

      // Set up event handlers
      Quagga.onDetected(handleDetected);

      // Debug: Log processed frames
      if (process.env.NODE_ENV === "development") {
        Quagga.onProcessed((result) => {
          if (result?.boxes?.length) {
            console.log(
              "📊 [Scanner] Processing frame with",
              result.boxes.length,
              "detection boxes"
            );
          }
        });
      }

      // Start scanning
      console.log("🚀 [Scanner] Starting scanner...");
      Quagga.start();

      setIsInitialized(true);
      setError(null);
      console.log("✅ [Scanner] Scanner started successfully");
    } catch (err: unknown) {
      console.error("❌ [Scanner] Initialization failed:", err);

      let errorMessage = "Failed to initialize scanner";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Camera access was denied. Please allow camera permissions.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else {
          errorMessage = `Scanner error: ${err.message || "Unknown error"}`;
        }
      }

      setError(errorMessage);
      onError(errorMessage);
    }
  }, [config, facingMode, handleDetected, isInitialized, onError]);

  // Debug: Log initializeScanner changes
  useEffect(() => {
    console.log("🔄 [DEBUG] initializeScanner dependency changed");
  }, [initializeScanner]);

  // Start scanner
  useEffect(() => {
    if (isActive && scannerRef.current && !isInitialized && !error) {
      console.log("⏳ [Scanner] Waiting 100ms for DOM to be ready...");
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        console.log("🚀 [Scanner] DOM ready, initializing scanner");
        initializeScanner();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isActive, initializeScanner, isInitialized, error]);

  // Debug: Log initialization effect
  useEffect(() => {
    console.log(
      "📊 [DEBUG] Initialization effect - isActive:",
      isActive,
      "isInitialized:",
      isInitialized,
      "error:",
      error
    );
  }, [isActive, isInitialized, error]);

  // Cleanup on unmount or when inactive
  useEffect(() => {
    return () => {
      console.log("🧹 [Scanner] Cleanup triggered");

      // Clear detection timeout
      if (detectionTimeout.current) {
        clearTimeout(detectionTimeout.current);
        detectionTimeout.current = null;
        console.log("⏹️ [Scanner] Detection timeout cleared");
      }

      // Reset detection state
      isProcessingDetection.current = false;
      lastDetectedCode.current = "";
      setIsProcessing(false);

      if (isInitialized) {
        try {
          Quagga.offDetected(handleDetected);
          Quagga.offProcessed(() => {}); // Remove all processed handlers
          Quagga.stop();
          console.log("⏹️ [Scanner] Scanner stopped and cleaned up");
        } catch (err) {
          console.warn("❌ [Scanner] Error stopping scanner:", err);
        }
        setIsInitialized(false);
      }
    };
  }, [isActive, isInitialized, handleDetected]);

  // Debug: Log cleanup effect dependencies
  useEffect(() => {
    console.log(
      "📊 [DEBUG] Cleanup effect - isActive:",
      isActive,
      "isInitialized:",
      isInitialized,
      "handleDetected:",
      !!handleDetected
    );
  }, [isActive, isInitialized, handleDetected]);

  // Handle pause/resume
  useEffect(() => {
    if (!isInitialized) return;

    if (isActive) {
      console.log("▶️ [Scanner] Activating scanner");
      // Reset detection state when resuming
      if (isProcessingDetection.current) {
        isProcessingDetection.current = false;
        lastDetectedCode.current = "";
        setIsProcessing(false);
        if (detectionTimeout.current) {
          clearTimeout(detectionTimeout.current);
          detectionTimeout.current = null;
        }
        console.log("🔄 [Scanner] Detection state reset on resume");
      }

      try {
        Quagga.start();
        console.log("✅ [Scanner] Scanner started successfully");
      } catch (err) {
        console.warn("❌ [Scanner] Error starting scanner:", err);
      }
    } else {
      console.log("⏸️ [Scanner] Deactivating scanner");
      // Clear detection state when pausing
      isProcessingDetection.current = false;
      lastDetectedCode.current = "";
      setIsProcessing(false);
      if (detectionTimeout.current) {
        clearTimeout(detectionTimeout.current);
        detectionTimeout.current = null;
      }

      try {
        Quagga.pause();
        console.log("✅ [Scanner] Scanner paused successfully");
      } catch (err) {
        console.warn("❌ [Scanner] Error pausing scanner:", err);
      }
    }
  }, [isActive, isInitialized]);

  // Debug: Log pause/resume effect
  useEffect(() => {
    console.log(
      "📊 [DEBUG] Pause/resume effect - isActive:",
      isActive,
      "isInitialized:",
      isInitialized
    );
  }, [isActive, isInitialized]);

  // Calculate aspect ratio class
  const aspectRatio =
    width && height
      ? `aspect-[${width}/${Math.min(height, 480)}]`
      : "aspect-video";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative w-full">
        {/* Scanner container */}
        <div
          ref={scannerRef}
          className={`relative w-full ${aspectRatio} bg-black rounded-lg overflow-hidden ${
            error ? "border-2 border-dashed border-red-500" : ""
          }`}
        >
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black bg-opacity-80">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                <p className="text-red-800 font-medium mb-2">
                  <svg
                    className="w-6 h-6 inline-block mr-2 -mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Scanner Error
                </p>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={initializeScanner}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Scanner overlay */}
          {!error && isActive && (
            <div className="absolute inset-0">
              {/* Scanner frame */}
              <div className="absolute inset-0 border-4 border-blue-400 rounded-lg m-2">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br"></div>

                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 animate-scan rounded-full"></div>
              </div>

              {/* Status indicator */}
              <div
                className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-md ${
                  isProcessing ? "bg-blue-500" : "bg-green-500"
                } flex items-center`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    isProcessing ? "bg-white" : "animate-pulse bg-white"
                  }`}
                ></span>
                {isProcessing
                  ? "Processing..."
                  : isInitialized
                  ? "Ready to scan"
                  : "Initializing..."}
              </div>
            </div>
          )}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-medium mb-1">Debug Info:</p>
            <div className="grid grid-cols-2 gap-1">
              <span>
                Status:{" "}
                <span className="font-mono">
                  {isInitialized ? "Initialized" : "Initializing..."}
                </span>
              </span>
              <span>
                Active:{" "}
                <span className="font-mono">{isActive ? "Yes" : "No"}</span>
              </span>
              <span>
                Processing:{" "}
                <span className="font-mono">{isProcessing ? "Yes" : "No"}</span>
              </span>
              <span>
                Workers:{" "}
                <span className="font-mono">
                  {navigator.hardwareConcurrency || "N/A"}
                </span>
              </span>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-xs">
                Error: {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!error && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            {isProcessing
              ? "Processing barcode..."
              : "Position barcode within the frame to scan"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports: EAN, UPC, Code 128, Code 39, and more
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
