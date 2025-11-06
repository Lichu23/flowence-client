"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  Result,
  NotFoundException,
  ChecksumException,
  FormatException,
} from "@zxing/library";

interface BarcodeScannerZXingProps {
  /** Callback when a barcode is successfully scanned */
  onScan: (result: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Camera facing mode (front or back) */
  facingMode?: "user" | "environment";
  /** Delay between scans in milliseconds to prevent duplicate scans */
  delayBetweenScans?: number;
  /** Delay between scan attempts in milliseconds */
  scanDelay?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** List of barcode formats to scan for */
  formats?: string[];
  /** Show debug information */
  debug?: boolean;
  /** Whether to show camera selection dropdown */
  showDeviceSelector?: boolean;
  /** Whether to show camera toggle button */
  showToggleButton?: boolean;
  /** Whether to start scanning automatically when component mounts */
  autoStart?: boolean;
}

const BarcodeScannerZXing: React.FC<BarcodeScannerZXingProps> = ({
  onScan,
  onError,
  facingMode = "environment",
  delayBetweenScans = 1000,
  scanDelay = 100,
  className = "",
  style = {},
  autoStart = true,
  formats = [
    "EAN_13",
    "CODE_128",
    "CODE_39",
    "UPC_A",
    "UPC_E",
    "EAN_8",
    "CODE_93",
    "CODABAR",
    "ITF",
  ],
  debug = process.env.NODE_ENV === "development",
  showDeviceSelector = true,
  showToggleButton = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isPaused, setIsPaused] = useState(false);
  
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const lastScanned = useRef<string>("");
  const lastScanTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMounted = useRef(true);
  const scanAttempts = useRef(0);
  const maxScanAttempts = 10;

  // Cleanup function to stop all active streams and timeouts
  const cleanup = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (codeReader.current) {
      try {
        codeReader.current.reset();
      } catch (e) {
        console.warn("Error resetting code reader:", e);
      }
    }
  }, []);

  // Initialize the code reader with specified formats
  const initCodeReader = useCallback(() => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    // Create a new code reader instance with the specified scan delay
    codeReader.current = new BrowserMultiFormatReader(undefined, scanDelay);
  }, [scanDelay]);

  // Get available video devices
  const getVideoDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices API not supported in this browser');
      }
      
      // First request camera permission by getting user media
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      
      if (!isMounted.current) return [];
      
      setDevices(videoDevices);
      
      // If no device is selected and we have devices, select the first one
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (error) {
      console.error("Error getting video devices:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera devices';
      setCameraError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }, [onError, selectedDevice]);

  // Handle successful barcode scan
  const handleScan = useCallback((result: Result) => {
    if (!result) return;
    
    const now = Date.now();
    const text = result.getText().trim();
    
    // Reset scan attempts on successful scan
    scanAttempts.current = 0;
    
    // Prevent duplicate scans
    if (!text || (text === lastScanned.current && now - lastScanTime.current < delayBetweenScans)) {
      return;
    }
    
    lastScanned.current = text;
    lastScanTime.current = now;
    
    if (debug) {
      console.log('Barcode detected:', {
        text,
        format: result.getBarcodeFormat(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Call the onScan callback
    onScan(text);
  }, [delayBetweenScans, debug, onScan]);

  // Handle scan errors
  const handleScanError = useCallback((error: unknown) => {
    // These are expected errors that we can ignore
    if (error instanceof NotFoundException) {
      // No barcode detected, continue scanning
      return;
    }
    
    if (error instanceof ChecksumException || error instanceof FormatException) {
      // Barcode detected but couldn't be read, continue scanning
      return;
    }
    
    // For other errors, log them and optionally call onError
    console.error('Barcode scan error:', error);
    
    // Increment scan attempts
    scanAttempts.current++;
    
    // If we've had too many failed attempts, trigger onError
    if (scanAttempts.current >= maxScanAttempts && onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
      scanAttempts.current = 0; // Reset counter
    }
  }, [onError]);

  // Start the barcode scanning
  const startScanner = useCallback(async () => {
    if (!videoRef.current || !isMounted.current) return;
    
    // Cleanup any existing streams or timeouts
    cleanup();
    
    // Reset state
    setCameraError(null);
    setIsScanning(false);
    
    try {
      // Initialize code reader with current formats
      initCodeReader();
      
      if (!codeReader.current) {
        throw new Error('Failed to initialize barcode reader');
      }
      
      // Get video constraints
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          facingMode: devices.length === 0 ? facingMode : undefined,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, min: 10 },
          aspectRatio: { ideal: 1.777, min: 1.6, max: 1.8 },
        },
        audio: false,
      };
      
      if (debug) {
        console.log('Requesting media with constraints:', constraints);
      }
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!isMounted.current) {
        // Component was unmounted while waiting for the stream
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      
      streamRef.current = stream;
      
      // Set video source and start playing
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw new Error('Failed to start video playback');
        }
      }
      
      // Start scanning
      const scan = async () => {
        if (!videoRef.current || !codeReader.current || !isMounted.current || isPaused) {
          return;
        }
        
        try {
          const result = await codeReader.current.decodeFromVideoElement(videoRef.current);
          if (result) {
            handleScan(result);
          }
        } catch (error) {
          handleScanError(error);
        } finally {
          // Continue scanning
          if (isMounted.current) {
            animationFrameId.current = requestAnimationFrame(scan);
          }
        }
      };
      
      // Update state and start scanning
      setIsScanning(true);
      setIsInitialized(true);
      scan();
      
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMessage = error instanceof Error ? 
        error.message : 'Failed to access camera';
      
      setCameraError(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      
      // If we have devices but still get an error, try the next device
      if (devices.length > 1) {
        const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice);
        if (currentIndex >= 0) {
          const nextIndex = (currentIndex + 1) % devices.length;
          setSelectedDevice(devices[nextIndex]?.deviceId || '');
        }
      }
    }
  }, [
    selectedDevice,
    facingMode,
    devices,
    onError,
    debug,
    cleanup,
    initCodeReader,
    handleScan,
    handleScanError,
    isPaused
  ]);

  // Toggle pause/resume scanning
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Handle device change
  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDevice(event.target.value);
  };

  // Toggle between front and back camera
  const toggleCamera = useCallback(() => {
    if (devices.length <= 1) return;
    
    setSelectedDevice(prevDevice => {
      const currentIndex = devices.findIndex(device => device.deviceId === prevDevice);
      const nextIndex = (currentIndex + 1) % devices.length;
      return devices[nextIndex]?.deviceId || '';
    });
  }, [devices]);

  // Initialize component
  useEffect(() => {
    isMounted.current = true;
    
    const init = async () => {
      try {
        const availableDevices = await getVideoDevices();
        
        if (availableDevices.length > 0) {
          const deviceId = selectedDevice || availableDevices[0]?.deviceId;
          if (deviceId) {
            setSelectedDevice(deviceId);
            if (autoStart) {
              await startScanner();
            }
          }
        } else {
          setCameraError('No camera devices found');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setCameraError('Failed to access camera. Please check permissions.');
      }
    };
    
    init();
    
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [getVideoDevices, cleanup, autoStart, selectedDevice, startScanner]);
  
  // Handle device changes
  useEffect(() => {
    if (selectedDevice && isInitialized) {
      startScanner();
    }
  }, [selectedDevice, startScanner, isInitialized]);
  

  // Calculate the aspect ratio class based on the video dimensions
  const getAspectRatioClass = useCallback(() => {
    if (!videoRef.current) return 'aspect-video';
    
    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth && videoHeight) {
      const ratio = videoWidth / videoHeight;
      if (Math.abs(ratio - (16/9)) < 0.1) return 'aspect-video';
      if (Math.abs(ratio - (4/3)) < 0.1) return 'aspect-4/3';
    }
    return 'aspect-square';
  }, []);

  const aspectRatioClass = getAspectRatioClass();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className={`relative overflow-hidden bg-gray-900 rounded-lg ${className}`}
      style={{ width: "100%", maxWidth: '100%', ...style }}
    >
      <div className={`relative w-full ${aspectRatioClass} bg-black`}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
        />
        
        {/* Scanner overlay */}
        {!cameraError && isScanning && !isPaused && (
          <>
            {/* Scanner frame */}
            <div className="absolute inset-0 border-4 border-blue-400 rounded-lg m-1">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br"></div>
              
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 animate-scan rounded-full"></div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {isScanning ? 'Scanning...' : 'Paused'}
            </div>
          </>
        )}
        
        {/* Error message */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md text-center">
              <p className="text-red-800 font-medium flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                Camera Error
              </p>
              <p className="text-red-600 text-sm mt-2">{cameraError}</p>
              <button
                onClick={startScanner}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-3">
          {/* Camera selector */}
          {showDeviceSelector && devices.length > 1 && (
            <select
              value={selectedDevice}
              onChange={handleDeviceChange}
              className="bg-black bg-opacity-70 text-white text-xs p-1 rounded border border-gray-600"
              title="Select camera"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          )}
          
          {/* Toggle camera button */}
          {showToggleButton && devices.length > 1 && (
            <button
              onClick={toggleCamera}
              className="p-2 bg-black bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-colors"
              title="Switch camera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
          
          {/* Pause/Resume button */}
          <button
            onClick={togglePause}
            className="p-2 bg-black bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-colors"
            title={isPaused ? 'Resume scanning' : 'Pause scanning'}
          >
            {isPaused ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
        </div>
        
        {/* Debug info */}
        {debug && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
            <div>Status: {isScanning ? 'Scanning' : 'Idle'}</div>
            <div>Device: {selectedDevice ? selectedDevice.substring(0, 8) + '...' : 'None'}</div>
            <div>Last scanned: {lastScanned.current || 'None'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScannerZXing;
