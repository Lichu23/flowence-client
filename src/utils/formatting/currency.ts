/**
 * Currency Formatting Utilities
 * Reusable currency formatting functions
 */

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (e.g., 'USD', 'ARS', 'EUR')
 * @param locale - Optional locale for formatting (e.g., 'en-US', 'es-AR')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale?: string
): string {
  try {
    // Special formatting for Argentine Pesos
    if (currency === 'ARS') {
      return new Intl.NumberFormat(locale || 'es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(value);
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    // Fallback formatting
    if (currency === 'ARS') {
      return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    }
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Format a number with thousands separators
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Optional locale for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale?: string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    // Fallback formatting
    return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

/**
 * Parse a formatted currency string back to a number
 * @param value - The formatted currency string
 * @returns Numeric value or NaN if invalid
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and separators
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}

/**
 * Get currency symbol for a given currency code
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @param locale - Optional locale
 * @returns Currency symbol string
 */
export function getCurrencySymbol(currency: string, locale?: string): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);

    // Extract symbol by removing the number
    return formatted.replace(/\d/g, '').trim();
  } catch {
    // Fallback to common symbols
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      ARS: '$',
      BRL: 'R$',
      MXN: '$',
    };
    return symbolMap[currency] || currency;
  }
}
