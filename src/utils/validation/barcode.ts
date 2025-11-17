/**
 * Barcode Validation Utilities
 * Reusable barcode validation functions and patterns
 */

/**
 * Regular expression for validating barcode format
 * Must be 8-14 digits
 */
export const BARCODE_REGEX = /^[0-9]{8,14}$/;

/**
 * Minimum barcode length
 */
export const BARCODE_MIN_LENGTH = 8;

/**
 * Maximum barcode length
 */
export const BARCODE_MAX_LENGTH = 14;

/**
 * Validates barcode format
 * @param barcode - The barcode string to validate
 * @returns true if barcode format is valid, false otherwise
 */
export function isValidBarcodeFormat(barcode: string): boolean {
  return BARCODE_REGEX.test(barcode);
}

/**
 * Validates barcode length
 * @param barcode - The barcode string to validate
 * @returns true if barcode length is within valid range
 */
export function isValidBarcodeLength(barcode: string): boolean {
  const length = barcode.length;
  return length >= BARCODE_MIN_LENGTH && length <= BARCODE_MAX_LENGTH;
}

/**
 * Sanitizes barcode input by removing non-digit characters
 * @param barcode - The barcode string to sanitize
 * @returns Sanitized barcode containing only digits
 */
export function sanitizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, '');
}

/**
 * Validates and sanitizes barcode
 * @param barcode - The barcode string to process
 * @returns Object with validation result and sanitized barcode
 */
export function validateAndSanitizeBarcode(barcode: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeBarcode(barcode);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Barcode cannot be empty'
    };
  }

  if (!isValidBarcodeLength(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: `Barcode must be between ${BARCODE_MIN_LENGTH} and ${BARCODE_MAX_LENGTH} digits`
    };
  }

  if (!isValidBarcodeFormat(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: 'Invalid barcode format. Must contain only digits.'
    };
  }

  return {
    isValid: true,
    sanitized
  };
}
