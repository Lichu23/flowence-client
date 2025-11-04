'use client';

/**
 * ManualEntry Component
 * Fallback component for manual barcode entry when scanner fails or is unavailable
 */

import React, { useState, useRef, useEffect } from 'react';

interface ManualEntryProps {
  onSubmit: (code: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

const ManualEntry: React.FC<ManualEntryProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Enter barcode manually",
  className = ""
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Validate barcode format
  const validateBarcode = (value: string): boolean => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Check if it's a valid barcode length (8-14 digits for common formats)
    if (numericValue.length < 8 || numericValue.length > 14) {
      setError('Barcode must be 8-14 digits long');
      return false;
    }

    setError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setCode(numericValue);
    
    // Clear error when user starts typing
    if (error && numericValue.length > 0) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a barcode');
      return;
    }

    if (validateBarcode(code)) {
      onSubmit(code);
      setCode(''); // Clear input after submission
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Manual Entry
        </h3>
        <p className="text-gray-600 text-sm">
          Enter the barcode number manually
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="barcode-input" className="sr-only">
            Barcode
          </label>
          <input
            ref={inputRef}
            id="barcode-input"
            type="text"
            value={code}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white'
            }`}
            autoComplete="off"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
          
          {code && !error && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              {code.length} digits entered
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={!code || !!error}
            className="flex-1 px-4 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search Product
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supported formats: EAN-13, UPC, Code 128, Code 39
        </p>
      </div>
    </div>
  );
};

export default ManualEntry;
