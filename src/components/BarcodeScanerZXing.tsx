"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  Result,
  NotFoundException,
} from "@zxing/library";

interface BarcodeScannerZXingProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  facingMode?: "user" | "environment";
  delayBetweenScans?: number;
  scanDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  formats?: string[];
}

const BarcodeScannerZXing: React.FC<BarcodeScannerZXingProps> = ({
  onScan,
  onError,
  facingMode = "environment",
  delayBetweenScans = 1000,
  scanDelay = 100,
  className = "",
  style = {},
  formats = [
    "QR_CODE",
    "EAN_13",
    "CODE_128",
    "CODE_39",
    "UPC_A",
    "UPC_E",
    "EAN_8",
  ],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const codeReader = useRef(new BrowserMultiFormatReader());
  const lastScanned = useRef<string>("");
  const lastScanTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      return videoDevices;
    } catch (error) {
      console.error("Error getting video devices:", error);
      return [];
    }
  }, []);

  // Start the barcode scanning
  const startScanner = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          facingMode: devices.length === 0 ? facingMode : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, min: 15 },
          aspectRatio: { ideal: 16/9 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();


      codeReader.current = new BrowserMultiFormatReader(undefined, scanDelay);

      const scan = () => {
        if (!videoRef.current) return;

        codeReader.current
          .decodeFromVideoElement(videoRef.current)
          .then((result: Result | null) => {
            if (result) {
              const now = Date.now();
              const text = result.getText();

              // Prevent duplicate scans
              if (
                text !== lastScanned.current ||
                now - lastScanTime.current > delayBetweenScans
              ) {
                lastScanned.current = text;
                lastScanTime.current = now;
                onScan(text);
              }
            }

            if (videoRef.current) {
              animationFrameId.current = requestAnimationFrame(scan);
            }
          })
          .catch((error: unknown) => {
            if (error instanceof NotFoundException) {
              // This is expected when no barcode is found
              if (videoRef.current) {
                animationFrameId.current = requestAnimationFrame(scan);
              }
            } else {
              console.error("Barcode scan error:", error);
              onError?.(
                error instanceof Error ? error : new Error(String(error))
              );
            }
          });
      };

      setIsScanning(true);
      setCameraError(null);
      scan();
    } catch (error) {
      console.error("Camera access error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to access camera";
      setCameraError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  },
  [
    selectedDevice,
    facingMode,
    delayBetweenScans,
    scanDelay,
    onScan,
    onError,
    devices.length,
  ]);

  // Initialize component
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await getVideoDevices();
      if (mounted) {
        startScanner();
      }
    };

    init();

    return () => {
      mounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      codeReader.current.reset();
    };
  }, [getVideoDevices, startScanner]);

  // Handle device change
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  // Toggle between front and back camera
  const toggleCamera = () => {
    setSelectedDevice((prevDevice) => {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === prevDevice
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      return devices[nextIndex]?.deviceId || "";
    });
  };

  return (
    <div
      className={`relative overflow-hidden bg-black ${className}`}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />

      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
          <div>
            <p className="text-red-400 font-medium mb-2">Camera Error</p>
            <p className="text-sm">{cameraError}</p>
            <button
              onClick={startScanner}
              className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isScanning && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <p>Initializing scanner...</p>
        </div>
      )}

      {/* Device selector */}
      {devices.length > 1 && (
        <div className="absolute top-2 right-2 z-10">
          <select
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="bg-black bg-opacity-70 text-white p-1 text-xs rounded"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Toggle camera button (for mobile) */}
      {devices.length > 1 && (
        <button
          onClick={toggleCamera}
          className="absolute bottom-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full"
          aria-label="Switch camera"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {/* Scanner frame overlay */}
      <div className="absolute inset-0 border-8 border-green-400 opacity-30 pointer-events-none" />
    </div>
  );
};

export default BarcodeScannerZXing;
