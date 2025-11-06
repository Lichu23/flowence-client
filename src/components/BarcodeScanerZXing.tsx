// components/BarcodeScannerZXing.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface BarcodeScannerZXingProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  facingMode?: 'user' | 'environment';
  delayBetweenScans?: number;
  className?: string;
  style?: React.CSSProperties;
}

const BarcodeScannerZXing: React.FC<BarcodeScannerZXingProps> = ({
  onScan,
  onError,
  facingMode = 'environment',
  delayBetweenScans = 1000,
  className = '',
  style = {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const lastScanned = useRef<string>('');
  const lastScanTime = useRef<number>(0);

  // Start/stop scanner based on component mount/unmount
  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const scan = () => {
          if (!videoRef.current || !mounted) return;

          codeReader.current
            .decodeFromVideoElement(videoRef.current)
            .then((result: Result | null) => {
              if (result) {
                const now = Date.now();
                const text = result.getText();
                
                // Prevent duplicate scans
                if (text !== lastScanned.current || now - lastScanTime.current > delayBetweenScans) {
                  lastScanned.current = text;
                  lastScanTime.current = now;
                  onScan(text);
                }
              }
              
              if (mounted) {
                requestAnimationFrame(scan);
              }
            })
            .catch((error) => {
              // Ignore NotFoundException as it's thrown when no barcode is found
              if (error.name !== 'NotFoundException') {
                console.error('Barcode scan error:', error);
                onError?.(error);
              } else if (mounted) {
                requestAnimationFrame(scan);
              }
            });
        };

        setIsScanning(true);
        scan();
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraError('Could not access the camera. Please check permissions.');
        onError?.(error as Error);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      codeReader.current.reset();
    };
  }, [facingMode, delayBetweenScans, onScan, onError]);

  return (
    <div 
      className={`relative overflow-hidden bg-black ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
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
          </div>
        </div>
      )}
      
      {!isScanning && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <p>Initializing scanner...</p>
        </div>
      )}
      
      {/* Scanner frame overlay */}
      <div className="absolute inset-0 border-8 border-green-400 opacity-30 pointer-events-none" />
    </div>
  );
};

export default BarcodeScannerZXing;