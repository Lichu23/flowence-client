'use client';

/**
 * BarcodeScanner Component
 * Core component that handles QuaggaJS barcode scanning functionality
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Quagga, { QuaggaJSResultObject, QuaggaJSConfigObject } from 'quagga';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onError: (error: string) => void;
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  isActive?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onDetected,
  onError,
  width = 640,
  height = 480,
  facingMode = 'environment', // Back camera by default
  isActive = true
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Debug: Log component mount
  useEffect(() => {
    console.log('🔵 [BarcodeScanner] Component mounted');
    return () => {
      console.log('🔴 [BarcodeScanner] Component unmounted');
    };
  }, []);
  
  // Debouncing state to prevent multiple detections
  const lastDetectedCode = useRef<string>('');
  const detectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProcessingDetection = useRef<boolean>(false);

  const config = useMemo((): QuaggaJSConfigObject => ({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: scannerRef.current || undefined,
      constraints: {
        width: width,
        height: height,
        facingMode: facingMode
      }
    },
    decoder: {
      readers: [
        'code_128_reader',
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'code_39_vin_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
        'i2of5_reader'
      ] as string[]
    },
    locator: {
      patchSize: 'small',  // Reduced from 'medium' for better detection of distant/small barcodes
      halfSample: false    // Disabled to use full resolution for better accuracy
    },
    numOfWorkers: 2,
    frequency: 10,
    locate: true
  }), [width, height, facingMode]);

  // Handle barcode detection with debouncing
  const handleDetected = useCallback((result: QuaggaJSResultObject) => {
    console.log('[handleDetected] Callback invoked, isActive:', isActive, 'isInitialized:', isInitialized);
    const code = result.codeResult.code;
    
    console.log('📷 [Scanner] Barcode detected:', {
      code,
      format: result.codeResult.format,
      confidence: result.codeResult.decodedCodes?.[0]?.error,
      length: code?.length
    });
    
    // Basic validation
    if (!code || code.length < 8) {
      console.warn('⚠️ [Scanner] Invalid code detected - too short:', code);
      return;
    }
    
    // Prevent multiple detections of the same code
    if (isProcessingDetection.current || lastDetectedCode.current === code) {
      console.log('🔄 [Scanner] Duplicate detection ignored:', code);
      return;
    }
    
    console.log('✅ [Scanner] Valid barcode accepted:', code);
    
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
      console.log('⏸️ [Scanner] Scanner paused for processing');
    } catch (err) {
      console.warn('❌ [Scanner] Error pausing scanner:', err);
    }
    
    // Call the detection handler
    console.log('📤 [Scanner] Sending code to parent handler:', code);
    onDetected(code);
    
    // Reset detection state after a delay
    detectionTimeout.current = setTimeout(() => {
      console.log('🔓 [Scanner] Cooldown period ended, ready for next scan');
      isProcessingDetection.current = false;
      lastDetectedCode.current = '';
      setIsProcessing(false);
      
      // Resume scanning if still active
      if (isActive && isInitialized) {
        try {
          Quagga.start();
          console.log('▶️ [Scanner] Scanner resumed');
        } catch (err) {
          console.warn('❌ [Scanner] Error resuming scanner:', err);
        }
      }
    }, 2000); // 2 second cooldown period
    
  }, [onDetected, isActive, isInitialized]);
  
  // Debug: Log handleDetected changes
  useEffect(() => {
    console.log('🔄 [DEBUG] handleDetected dependency changed');
  }, [handleDetected]);

  // Initialize scanner
  const initializeScanner = useCallback(() => {
    if (!scannerRef.current || isInitialized) {
      console.log('⏭️ [Scanner] Skipping initialization:', {
        hasRef: !!scannerRef.current,
        alreadyInitialized: isInitialized
      });
      return;
    }

    console.log('🔧 [Scanner] Initializing scanner...', {
      facingMode,
      width,
      height
    });

    const updatedConfig = {
      ...config,
      inputStream: {
        ...config.inputStream,
        target: scannerRef.current
      }
    };

    Quagga.init(updatedConfig, (err) => {
      if (err) {
        console.error('❌ [Scanner] QuaggaJS initialization error:', err);
        const errorMessage = err.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : `Scanner initialization failed: ${err.message || 'Unknown error'}`;
        
        console.error('❌ [Scanner] Error message:', errorMessage);
        setError(errorMessage);
        onError(errorMessage);
        return;
      }

      console.log('✅ [Scanner] Scanner initialized successfully');
      setIsInitialized(true);
      setError(null);
      
      // Start scanning
      Quagga.start();
      console.log('▶️ [Scanner] Scanner started');
      
      // Set up detection handler
      Quagga.onDetected(handleDetected);
      console.log('👂 [Scanner] Detection handler registered');
      
      // Add onProcessed for frame-by-frame debugging
      Quagga.onProcessed((result) => {
        if (result && result.boxes && result.boxes.length > 0) {
          console.log('📊 [Scanner] Frame processed - boxes found:', result.boxes.length, 'codeResult:', !!result.codeResult);
        }
        if (result && result.codeResult) {
          console.log('🔍 [Scanner] Code result in frame:', result.codeResult.code, 'format:', result.codeResult.format);
        }
      });
    });
  }, [handleDetected, onError, isInitialized, config, facingMode, width, height]);
  
  // Debug: Log initializeScanner changes
  useEffect(() => {
    console.log('🔄 [DEBUG] initializeScanner dependency changed');
  }, [initializeScanner]);

  // Start scanner
  useEffect(() => {
    if (isActive && scannerRef.current && !isInitialized && !error) {
      console.log('⏳ [Scanner] Waiting 100ms for DOM to be ready...');
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        console.log('🚀 [Scanner] DOM ready, initializing scanner');
        initializeScanner();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isActive, initializeScanner, isInitialized, error]);
  
  // Debug: Log initialization effect
  useEffect(() => {
    console.log('📊 [DEBUG] Initialization effect - isActive:', isActive, 'isInitialized:', isInitialized, 'error:', error);
  }, [isActive, isInitialized, error]);

  // Cleanup on unmount or when inactive
  useEffect(() => {
    return () => {
      console.log('🧹 [Scanner] Cleanup triggered');
      
      // Clear detection timeout
      if (detectionTimeout.current) {
        clearTimeout(detectionTimeout.current);
        detectionTimeout.current = null;
        console.log('⏹️ [Scanner] Detection timeout cleared');
      }
      
      // Reset detection state
      isProcessingDetection.current = false;
      lastDetectedCode.current = '';
      setIsProcessing(false);
      
      if (isInitialized) {
        try {
          Quagga.offDetected(handleDetected);
          Quagga.offProcessed(() => {}); // Remove all processed handlers
          Quagga.stop();
          console.log('⏹️ [Scanner] Scanner stopped and cleaned up');
        } catch (err) {
          console.warn('❌ [Scanner] Error stopping scanner:', err);
        }
        setIsInitialized(false);
      }
    };
  }, [isActive, isInitialized, handleDetected]);
  
  // Debug: Log cleanup effect dependencies
  useEffect(() => {
    console.log('📊 [DEBUG] Cleanup effect - isActive:', isActive, 'isInitialized:', isInitialized, 'handleDetected:', !!handleDetected);
  }, [isActive, isInitialized, handleDetected]);

  // Handle pause/resume
  useEffect(() => {
    if (!isInitialized) return;

    if (isActive) {
      console.log('▶️ [Scanner] Activating scanner');
      // Reset detection state when resuming
      if (isProcessingDetection.current) {
        isProcessingDetection.current = false;
        lastDetectedCode.current = '';
        setIsProcessing(false);
        if (detectionTimeout.current) {
          clearTimeout(detectionTimeout.current);
          detectionTimeout.current = null;
        }
        console.log('🔄 [Scanner] Detection state reset on resume');
      }
      
      try {
        Quagga.start();
        console.log('✅ [Scanner] Scanner started successfully');
      } catch (err) {
        console.warn('❌ [Scanner] Error starting scanner:', err);
      }
    } else {
      console.log('⏸️ [Scanner] Deactivating scanner');
      // Clear detection state when pausing
      isProcessingDetection.current = false;
      lastDetectedCode.current = '';
      setIsProcessing(false);
      if (detectionTimeout.current) {
        clearTimeout(detectionTimeout.current);
        detectionTimeout.current = null;
      }
      
      try {
        Quagga.pause();
        console.log('✅ [Scanner] Scanner paused successfully');
      } catch (err) {
        console.warn('❌ [Scanner] Error pausing scanner:', err);
      }
    }
  }, [isActive, isInitialized]);
  
  // Debug: Log pause/resume effect
  useEffect(() => {
    console.log('📊 [DEBUG] Pause/resume effect - isActive:', isActive, 'isInitialized:', isInitialized);
  }, [isActive, isInitialized])

  return (
    <div className="relative">
      <div
        ref={scannerRef}
        className={`relative overflow-hidden rounded-lg ${
          error ? 'bg-gray-100 border-2 border-dashed border-gray-300' : 'bg-black'
        }`}
        style={{ width: '100%', height: '100%', maxWidth: width, maxHeight: height }}
      >
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">Scanner Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!error && isActive && (
          <>
            {/* Scanner overlay */}
            <div className="absolute inset-0 border-2 border-transparent">
              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-green-400"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-green-400"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-green-400"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-green-400"></div>
              
              {/* Center guide line */}
              <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-red-400 opacity-60 transform -translate-y-1/2"></div>
            </div>
            
            {/* Status indicator */}
            <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded ${
              isProcessing ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {isProcessing 
                ? 'Code Detected!' 
                : isInitialized 
                  ? 'Scanning...' 
                  : 'Initializing...'
              }
            </div>
          </>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">
          {error 
            ? 'Please check camera permissions and try again'
            : isProcessing
              ? 'Code detected! Processing...'
              : 'Point the camera at a barcode to scan'
          }
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
