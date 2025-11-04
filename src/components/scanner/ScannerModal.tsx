'use client';

/**
 * ScannerModal Component
 * Main modal that combines barcode scanning and manual entry functionality
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, Camera, Keyboard, RefreshCw } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import ManualEntry from './ManualEntry';
import { useBarcodeSearch } from '@/hooks/useBarcodeSearch';
import { Product } from '@/types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
  storeId: string;
  title?: string;
}

type ScannerMode = 'scanner' | 'manual';

const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
  storeId,
  title = "Escanear Producto"
}) => {
  const [mode, setMode] = useState<ScannerMode>('scanner');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const { product, loading, error, searchProduct, clearResults } = useBarcodeSearch();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      console.log('📱 [ScannerModal] Modal opened');
      setMode('scanner');
      setScannerError(null);
      clearResults();
    } else {
      console.log('📱 [ScannerModal] Modal closed');
    }
  }, [isOpen, clearResults]);

  // Handle successful product search
  useEffect(() => {
    if (product) {
      console.log('✅ [ScannerModal] Product found, notifying parent:', product);
      onProductFound(product);
      onClose();
    }
  }, [product, onProductFound, onClose]);

  const handleBarcodeDetected = useCallback(async (code: string) => {
    console.log('📥 [ScannerModal] Barcode received from scanner:', code);
    console.log('🔍 [ScannerModal] Searching product in store:', storeId);
    await searchProduct(storeId, code);
  }, [storeId, searchProduct]);

  const handleManualSubmit = useCallback(async (code: string) => {
    console.log('⌨️ [ScannerModal] Manual entry submitted:', code);
    console.log('🔍 [ScannerModal] Searching product in store:', storeId);
    await searchProduct(storeId, code);
  }, [storeId, searchProduct]);

  const handleScannerError = useCallback((errorMessage: string) => {
    console.error('❌ [ScannerModal] Scanner error received:', errorMessage);
    setScannerError(errorMessage);
    // Auto-switch to manual mode if scanner fails
    console.log('⏰ [ScannerModal] Switching to manual mode in 1 second...');
    setTimeout(() => {
      setMode('manual');
      console.log('🔄 [ScannerModal] Switched to manual mode');
    }, 1000);
  }, []);

  const handleModeToggle = () => {
    const newMode = mode === 'scanner' ? 'manual' : 'scanner';
    console.log(`🔄 [ScannerModal] Mode toggle: ${mode} → ${newMode}`);
    setMode(newMode);
    setScannerError(null);
    clearResults();
  };

  const handleRetryScanner = () => {
    console.log('🔄 [ScannerModal] Retrying scanner...');
    setScannerError(null);
    setMode('scanner');
    clearResults();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Mode Toggle */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('scanner')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'scanner'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Camera size={16} className="mr-2" />
                Escáner
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'manual'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Keyboard size={16} className="mr-2" />
                Manual
              </button>
            </div>

            {/* Scanner Mode */}
            {mode === 'scanner' && (
              <div className="text-center">
                {scannerError ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium mb-2">Error del Escáner</p>
                      <p className="text-red-600 text-sm mb-4">{scannerError}</p>
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={handleRetryScanner}
                          className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Reintentar
                        </button>
                        <button
                          onClick={handleModeToggle}
                          className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Entrada Manual
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <BarcodeScanner
                    onDetected={handleBarcodeDetected}
                    onError={handleScannerError}
                    width={400}
                    height={300}
                    isActive={mode === 'scanner' && !scannerError}
                  />
                )}
              </div>
            )}

            {/* Manual Mode */}
            {mode === 'manual' && (
              <ManualEntry
                onSubmit={handleManualSubmit}
                onCancel={onClose}
                placeholder="Ingresa código de barras (8-14 dígitos)"
              />
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-600 text-sm">Buscando producto...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-1">Producto No Encontrado</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
