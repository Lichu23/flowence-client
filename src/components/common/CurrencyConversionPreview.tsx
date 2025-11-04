import React, { useState, useEffect, useCallback } from 'react';
import { currencyApi } from '@/lib/api';

interface CurrencyConversionPreviewProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  onRateChange?: (rate: number) => void;
}

export const CurrencyConversionPreview: React.FC<CurrencyConversionPreviewProps> = ({
  amount,
  fromCurrency,
  toCurrency,
  onRateChange
}) => {
  const [rate, setRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversionRate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await currencyApi.convertAmount(amount, fromCurrency, toCurrency);
      setRate(result.rate);
      setConvertedAmount(result.converted_amount);
      onRateChange?.(result.rate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get exchange rate');
      setRate(null);
      setConvertedAmount(null);
    } finally {
      setLoading(false);
    }
  }, [amount, fromCurrency, toCurrency, onRateChange]);

  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchConversionRate();
    } else {
      setRate(null);
      setConvertedAmount(null);
      setError(null);
    }
  }, [fromCurrency, toCurrency, fetchConversionRate]);

  if (fromCurrency === toCurrency) {
    return (
      <div className="text-sm text-gray-600">
        No conversion needed - same currency
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        Getting exchange rate...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Unable to get exchange rate: {error}
      </div>
    );
  }

  if (rate !== null && convertedAmount !== null) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm">
          <div className="font-medium text-blue-900 mb-1">Conversion Preview</div>
          <div className="text-blue-800">
            <div className="flex justify-between items-center">
              <span>Exchange Rate:</span>
              <span className="font-mono">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Sample Conversion:</span>
              <span className="font-mono">
                {amount.toFixed(2)} {fromCurrency} → {convertedAmount.toFixed(2)} {toCurrency}
              </span>
            </div>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            *Rates are updated hourly and may vary
          </div>
        </div>
      </div>
    );
  }

  return null;
};
