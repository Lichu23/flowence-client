/**
 * API Client for Flowence Backend
 *
 * This file now re-exports all API modules from the modular structure in src/lib/api/
 * for backward compatibility. All new code should import from '@/lib/api' or '@/lib/api/[module]'.
 *
 * @deprecated Individual API modules have been extracted to src/lib/api/
 * @see src/lib/api/index.ts for the new modular structure
 */

// Re-export everything from the new modular API structure
export * from "./api/index";
