# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flowence Client is a Next.js 15 frontend for a multi-tenant Point of Sale (POS) system with inventory management, multi-store support, employee management, and integrated barcode scanning. The backend API runs separately (typically on port 3002).

## Development Commands

### Local Development
```bash
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Run Jest in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests (headless)
npm run test:e2e:ui      # Run E2E tests with Playwright UI (interactive)
npm run test:e2e:headed  # Run E2E tests in headed mode
npm run test:all         # Run all tests (unit + E2E)
```

### Running a Single Test
```bash
npm test -- ComponentName.test.tsx              # Specific test file
npm test -- --testNamePattern="test name"       # Specific test by name
npx playwright test e2e/auth.spec.ts            # Specific E2E test file
npx playwright test --debug e2e/auth.spec.ts    # Debug specific E2E test
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router (not Pages Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API (no Redux/Zustand)
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **API Client**: Modular API client in `src/lib/api/` (see API Communication section)
- **Code Style**: ES modules with destructured imports (see GUIDELINE.md)

### State Management Pattern

The app uses **React Context API** with five nested providers (in `src/app/layout.tsx`):

```
ToastProvider → AuthProvider → StoreProvider → SettingsProvider → CartProvider → StripeProvider
```

**Key Contexts:**

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages user authentication with JWT tokens
   - Auto-refreshes tokens every 25 minutes (tokens expire in 30 minutes)
   - Persists to localStorage: `token`, `refreshToken`, `user`
   - Network resilience: distinguishes auth errors from connectivity issues
   - Methods: `login()`, `register()`, `logout()`, `refreshUser()`

2. **StoreContext** (`src/contexts/StoreContext.tsx`)
   - Manages multi-store selection and operations
   - Persists current store selection in localStorage (`currentStoreId`)
   - CRUD operations for stores
   - Methods: `selectStore()`, `createStore()`, `updateStore()`, `deleteStore()`, `refreshStores()`

3. **SettingsContext** (`src/contexts/SettingsContext.tsx`)
   - Loads store-specific settings (currency, timezone, date/time formats)
   - Provides formatting utilities: `formatCurrency()`, `formatDate()`, `formatDateTime()`
   - Special handling for ARS (Argentine Pesos) with locale support

4. **CartContext** (`src/contexts/CartContext.tsx`)
   - In-memory shopping cart for POS operations (not persisted)
   - Methods: `addItem()`, `removeItem()`, `updateQuantity()`, `clear()`
   - Tax is calculated server-side; client-side tax is always 0

5. **ToastProvider** (`src/components/ui/Toast.tsx`)
   - Global toast notifications via `useToast()` hook

### Routing & Authentication

- **Router Type**: Next.js App Router (file-based routing in `src/app/`)
- **Route Protection**: `ProtectedRoute` component wraps authenticated pages
  - Checks `isAuthenticated` from AuthContext
  - Redirects to `/login` if not authenticated
  - Supports role-based access via `allowedRoles` prop
- **Navigation**: Uses `useRouter()` and `usePathname()` from `next/navigation`

**Key Routes:**
- `/` - Landing page (redirects authenticated users to `/dashboard`)
- `/login`, `/register` - Authentication
- `/dashboard` - Owner dashboard
- `/pos` - Point of Sale terminal
- `/products` - Product management
- `/sales` - Sales history and returns
- `/stores` - Multi-store management (owner only)
- `/employees` - Employee management (owner only)
- `/accept-invitation` - Employee invitation acceptance

### API Communication

**Location**: `src/lib/api/` (modular structure)

**Base URL**: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3002`)

**Architecture:**
The API client uses a modular structure with separate files for each domain:
- `src/lib/api/client.ts` - Core HTTP client with token management
- `src/lib/api/auth.ts` - Authentication endpoints
- `src/lib/api/stores.ts` - Store management
- `src/lib/api/invitations.ts` - Employee invitations
- `src/lib/api/products.ts` - Product CRUD and stock operations
- `src/lib/api/sales.ts` - Sales processing and returns
- `src/lib/api/dashboard.ts` - Dashboard statistics
- `src/lib/api/currency.ts` - Currency conversion
- `src/lib/api/payments.ts` - Stripe payments
- `src/lib/api/index.ts` - Central export (barrel file)

**Request Handling (client.ts):**
- Automatically adds JWT Bearer token from localStorage
- **401 Handling**: Auto-refreshes token and retries request once
- **Network Error Handling**: Distinguishes between network errors, timeouts, and CORS errors
- **Prevents cascade**: Flag prevents multiple simultaneous refresh attempts
- Exports: `apiRequest()`, `getToken()`, `getRefreshToken()`, `refreshAccessToken()`

**Import Usage:**
```typescript
// Import specific modules
import { authApi } from '@/lib/api/auth';
import { storeApi } from '@/lib/api/stores';

// Or import from barrel (recommended)
import { authApi, storeApi, productApi } from '@/lib/api';

// Import core client functions
import { apiRequest } from '@/lib/api/client';
```

**API Modules:**
- `authApi` - login, register, me, logout, refreshToken
- `storeApi` - getAll, getById, create, update, delete, getStats
- `invitationApi` - send, validate, accept, revoke, resend, getByStore, getPending, getStats
- `productApi` - getAll, getById, getByBarcode, getCategories, create, update, adjustStock, fillWarehouse, updateSalesStock, restockProduct, getStockMovements, getLowStockAlerts, delete
- `dashboardApi` - getStats, getDefectiveProducts, getGlobalSummary
- `salesApi` - processSale, getSales, getById, refundSale, createReturn, getReturns, downloadReceipt
- `currencyApi` - getExchangeRate, convertAmount, getSupportedCurrencies
- `paymentsApi` - createIntent, confirmPayment, getPaymentStatus

**Product Filtering**: Supports query params: `search`, `category`, `is_active`, `low_stock`, `page`, `limit`, `sort_by`, `sort_order`

**Backward Compatibility**: The original `src/lib/api.ts` remains as a re-export file for backward compatibility.

### Dual-Stock Management

Products have two stock types:
- `stock_venta` - Sales floor stock
- `stock_deposito` - Warehouse stock

**Stock Operations:**
- `fillWarehouse()` - Add stock to warehouse
- `updateSalesStock()` - Update sales floor stock
- `restockProduct()` - Move stock from warehouse to sales floor
- Stock movements are tracked with history endpoint

Each stock type has separate `min_stock` thresholds.

### Key Integrations

**1. Scandit Barcode Scanner**
- Component: `ScanditBarcodeScanner` (dynamically imported with `ssr: false`)
- License: `NEXT_PUBLIC_SCANDIT_LICENSE_KEY` environment variable
- Hook: `useBarcodeSearch` validates barcode format (8-14 digits)
- Used in POS for quick product lookup

**2. Stripe Payments**
- Components: `StripeProvider`, `StripeCardPayment`, `StripeQRPayment`
- API Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Flow: Create intent → Confirm payment → Check status

**3. Print System**
- Hook: `usePrintStatus` tracks print job states (pending → printing → completed/failed)
- Receipt PDFs generated server-side and auto-downloaded

### Custom Hooks

- **useBarcodeSearch** (`src/hooks/useBarcodeSearch.ts`)
  - Search products by barcode with validation
  - Uses `@/utils/validation/barcode` for validation logic
  - Returns: `product`, `loading`, `error`, `searchProduct()`, `validateBarcode()`, `clearResults()`

- **useDebounce** (`src/hooks/useDebounce.ts`)
  - Debounce values for search inputs (typical delay: 300-500ms)

- **usePrintStatus** (`src/hooks/usePrintStatus.ts`)
  - Manages print job lifecycle with retry mechanism

### Utility Functions

The project uses a modular utility structure in `src/utils/`:

**Validation Utilities** (`src/utils/validation/barcode.ts`):
- `BARCODE_REGEX` - Pattern for 8-14 digit barcodes
- `isValidBarcodeFormat(barcode: string)` - Validate barcode format
- `isValidBarcodeLength(barcode: string)` - Check length constraints
- `sanitizeBarcode(barcode: string)` - Remove non-digit characters
- `validateAndSanitizeBarcode(barcode: string)` - Combined validation

**Formatting Utilities** (`src/utils/formatting/`):
- **currency.ts**:
  - `formatCurrency(value, currency, locale?)` - Format numbers as currency
  - `formatNumber(value, decimals?, locale?)` - Format with thousands separators
  - `parseCurrency(value)` - Parse formatted currency back to number
  - `getCurrencySymbol(currency, locale?)` - Get currency symbol
- **date.ts**:
  - `getDateTimeParts(date, timeFormat?, timezone?)` - Parse date into components
  - `formatDate(date, dateFormat?, timezone?)` - Format date only
  - `formatDateTime(date, dateFormat?, timeFormat?, timezone?)` - Format date and time
  - `formatTime(date, timeFormat?, timezone?, includeSeconds?)` - Format time only
  - `getRelativeTime(date, baseDate?, locale?)` - Get "2 hours ago" style strings
  - `isToday(date, timezone?)`, `isPast(date)`, `isFuture(date)` - Date checks

**Constants** (`src/utils/constants/index.ts`):
- `API_CONFIG` - Base URL, token refresh interval, timeout
- `HTTP_STATUS` - HTTP status codes
- `ROLES` - User roles (owner, employee)
- `STORAGE_KEYS` - LocalStorage key names
- `DATE_FORMATS`, `TIME_FORMATS` - Format patterns
- `CURRENCIES` - Supported currency codes
- `PAGINATION` - Default pagination settings
- `TOAST_DURATION` - Notification durations
- `PRINT_STATUS` - Print job statuses
- `STOCK_THRESHOLDS` - Low stock thresholds
- `TIMEZONES` - Common timezone strings
- `FEATURES` - Feature flags based on env vars

**Import Usage:**
```typescript
// Import specific utilities
import { isValidBarcodeFormat } from '@/utils/validation/barcode';
import { formatCurrency, formatDate } from '@/utils/formatting/currency';
import { API_CONFIG, HTTP_STATUS } from '@/utils/constants';

// Or import from barrel
import { isValidBarcodeFormat, formatCurrency, API_CONFIG } from '@/utils';
```

### Testing Setup

**Unit Tests (Jest):**
- Test environment: `jsdom` (browser simulation)
- Module alias: `@/*` maps to `src/*`
- Coverage thresholds: 70% (branches, functions, lines, statements)
- Custom utilities in `src/test-utils/index.tsx`:
  - `render()` - Wraps components with all providers
  - Mock data: `mockOwnerUser`, `mockEmployeeUser`, `mockStore`, `mockProduct`, `mockSale`
  - Helpers: `waitForLoadingToFinish()`, `createMockApiResponse()`, `createMockApiError()`

**E2E Tests (Playwright):**
- Tests in `e2e/` directory
- Browsers: Chromium, Firefox, WebKit, Mobile (Pixel 5, iPhone 12)
- Base URL: `http://localhost:3000`
- CI: 2 retries, serial workers
- Dev: Parallel workers, reuse existing server

**Test Files:**
- Unit: `src/components/ui/__tests__/*.test.tsx`
- E2E: `e2e/auth.spec.ts`, `e2e/multi-store.spec.ts`, `e2e/pos.spec.ts`, `e2e/products.spec.ts`

### Environment Variables

Required variables:
```
NEXT_PUBLIC_API_URL                 # Backend API URL (default: http://localhost:3002)
NEXT_PUBLIC_SCANDIT_LICENSE_KEY     # Scandit barcode scanner license
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Stripe public key
```

Create `.env.local` from `.env.local.example` if available.

### Project Structure

```
src/
├── app/                          # Next.js App Router pages
├── components/                   # React components
│   ├── barcode/                  # Scandit scanner integration
│   ├── common/                   # Shared components (Stripe, Scanner button)
│   ├── dashboard/                # Dashboard-specific components
│   ├── help/                     # Help/modal components
│   ├── print/                    # Print-related components
│   ├── ui/                       # Reusable UI components (Card, Toast, etc.)
│   │   └── __tests__/            # UI component tests
│   ├── ProtectedRoute.tsx
│   ├── Navbar.tsx
│   └── StoreSelector.tsx
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── SettingsContext.tsx
│   ├── StoreContext.tsx
│   └── index.ts                  # Barrel export for all contexts
├── hooks/                        # Custom React hooks
│   ├── useBarcodeSearch.ts
│   ├── useDebounce.ts
│   └── usePrintStatus.ts
├── lib/                          # Libraries and utilities
│   ├── api/                      # Modular API client
│   │   ├── client.ts             # Core HTTP client
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── stores.ts             # Store endpoints
│   │   ├── invitations.ts        # Invitation endpoints
│   │   ├── products.ts           # Product endpoints
│   │   ├── sales.ts              # Sales endpoints
│   │   ├── dashboard.ts          # Dashboard endpoints
│   │   ├── currency.ts           # Currency endpoints
│   │   ├── payments.ts           # Payment endpoints
│   │   └── index.ts              # Barrel export
│   └── api.ts                    # Backward compatibility re-export
├── types/                        # TypeScript type definitions
│   ├── index.ts
│   └── quagga.d.ts
├── utils/                        # Utility functions
│   ├── validation/
│   │   └── barcode.ts            # Barcode validation utilities
│   ├── formatting/
│   │   ├── currency.ts           # Currency formatting
│   │   └── date.ts               # Date/time formatting
│   ├── constants/
│   │   └── index.ts              # Global constants (API config, HTTP status, etc.)
│   └── index.ts                  # Barrel export for all utils
└── test-utils/                   # Test utilities
    └── index.tsx
```

### Project-Specific Patterns

1. **Spanish-first UI**: Many labels and error messages are in Spanish (e.g., "Caja" for POS, "Tiendas" for Stores)

2. **Multi-tenant Design**: Single user can own/work multiple stores with per-store settings

3. **Error Resilience**: Network errors don't logout user; 401 triggers automatic token refresh + retry

4. **Dynamic Imports**: Scandit scanner uses `dynamic()` with `ssr: false` to avoid SSR issues

5. **Receipt System**: PDFs generated server-side, auto-downloaded with filename from response headers

6. **Defective Product Tracking**: Dashboard shows defective product metrics and monetary loss from returns

7. **Invitation System**: Store owners invite employees via email with token-based links

## Code Style Guidelines

The project follows ES module best practices as defined in `GUIDELINE.md`:

1. **Use ES Modules**: Always use `import/export`, never `require()` or `module.exports`
2. **Destructured Imports**: Prefer `import { foo } from './module'` over default imports
3. **React Imports**: Use `import { FC, useState } from 'react'` instead of `import React from 'react'`
4. **Type Imports**: Use `import type { ... }` for type-only imports
5. **Barrel Exports**: Use index.ts files to re-export related modules

**Examples:**
```typescript
// Good
import { FC, useState, useEffect } from 'react';
import { authApi, storeApi } from '@/lib/api';
import { formatCurrency, isValidBarcodeFormat } from '@/utils';
import type { Product, Store } from '@/types';

// Avoid
import React from 'react';
import * as api from '@/lib/api';
```

## Important Notes

- **Module Alias**: Use `@/*` for imports instead of relative paths (e.g., `import { authApi } from '@/lib/api'`)
- **TypeScript**: All new code should be in TypeScript with proper types
- **Strict Mode**: TypeScript strict mode is enabled
- **No Direct Bash for File Ops**: Use Read/Edit/Write tools instead of cat/sed/echo
- **Image Optimization**: Next.js Image component allows `cdn.jsdelivr.net` as remote pattern
- **Code Organization**: Follow the modular structure - use `src/utils/` for utilities, `src/lib/api/` for API modules
- **Barrel Exports**: Available for contexts (`@/contexts`), utils (`@/utils`), and API (`@/lib/api`)

## Backend Relationship

The frontend expects a backend API running on port 3002 (configurable via `NEXT_PUBLIC_API_URL`). The backend handles:
- Authentication (JWT tokens)
- Store management
- Product CRUD and stock operations
- Sales processing and returns
- Employee invitations
- Receipt PDF generation
- Tax calculations

When developing, ensure the backend server is running in a separate terminal.


# Code style
Implementation Guidance for Code Style with Web Interface Guidelines
1.  Use ES Modules (import/export)
-   Always use import/export.
-   Avoid require() and module.exports.
-   Encourages tree-shaking and smaller bundles.
2.  Prefer Destructured Imports import { foo } from ‘./module.js’
-   Leads to clearer, more explicit imports.
-   Improves maintainability and performance.
3.  How This Supports the Web Interface Guidelines
-   Interaction helpers (focus, keyboard navigation) can be separate ESM
    utilities.
-   Animation utilities can be isolated modules.
-   Layout constants (spacing, hit targets, safe areas) can be shared
    ESM modules.
-   Forms and validation rules benefit from reusable ESM modules.
-   Performance improves due to tree-shaking and smaller dependency
    graphs.
4.  Recommended Module Structure src/ components/ interactions/
    animations/ layout/ forms/ utils/
5.  Summary Using ES modules with destructured imports supports
    accessibility, performance, modularity, and maintainability across
    all Web Interface Guidelines.

### 2. FULL VISUAL BALANCE GUIDELINES (MUST BE ENFORCED VIA TAILWIND TOKENS)

Balance contrast in lockups. When text & icons sit side by side, adjust weight, size, spacing, or color so they don’t clash. For example, a thin-stroke icon may need a bolder stroke next to medium-weight text.
Layered shadows. Mimic ambient + direct light with at least two layers.
Crisp borders. Combine borders & shadows; semi-transparent borders improve edge clarity.
Nested radii. Child radius ≤ parent radius & concentric so curves align.
Hue consistency. On non-neutral backgrounds, tint borders/shadows/text toward the same hue.
Minimum contrast. Prefer APCA over WCAG 2 for more accurate perceptual contrast.
Interactions increase contrast. :hover, :active, :focus have more contrast than rest state.
Optical alignment. Adjust ±1px when perception beats geometry.
Text anti-aliasing & transforms. Scaling text can change smoothing. Prefer animating a wrapper instead of the text node. If artifacts persist set translateZ(0) or will-change: transform to promote to its own layer.

text### 3. ENFORCEMENT RULES (TAILWIND-LEVEL)

For **every balance rule**, define **dedicated design tokens** in `tailwind.config.ts` that **fail at build time** if misused.

| Guideline | Token Strategy | Example |
|---------|----------------|-------|
| **Balance contrast in lockups** | `theme.extend.textIconPair` → `{ weight: '500', iconStroke: '2', gap: '0.5rem' }` | `class="text-icon-pair-medium"` |
| **Layered shadows** | `theme.extend.boxShadow.lg = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'` | `shadow-lg-ambient` |
| **Crisp borders** | `theme.extend.borderColor.DEFAULT = 'rgba(0,0,0,0.08)'` | `border border-crisp` |
| **Nested radii** | `theme.extend.borderRadius.xl = '1rem'`, `theme.extend.borderRadius.lg = '0.75rem'` | `rounded-xl rounded-lg` (child ≤ parent) |
| **Hue consistency** | `theme.extend.colors.primary.tint = 'oklch(70% 0.15 250)'` | `border-primary-tint` |
| **APCA contrast** | Custom plugin `@apply` that checks `perceptualContrast()` ≥ 60 | `text-apca-pass` |
| **Interaction contrast boost** | `theme.extend.backgroundColor.hover = { DEFAULT: 'oklch(30% 0.2 250)' }` | `hover:bg-hover` |
| **Optical ±1px** | `theme.extend.spacing['optical-n1'] = '-1px'`, `optical-p1 = '1px'` | `top-[optical-p1]` |
| **Text anti-aliasing** | `theme.extend.willChange.text = 'transform'` | `will-change-text` |

### 4. OUTPUT CONTRACT

Return **only one file**:
tailwind.config.ts
textMust include:
- Full `module.exports = { ... }`
- `content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}']`
- `theme.extend` with **all balance tokens above**
- **Custom plugin** `apcaContrastEnforcer` that throws build error if contrast < Lc 60
- **Custom plugin** `nestedRadiusValidator` that warns if child radius > parent
- **Custom plugin** `textIconPair` that generates `text-icon-pair-{size}` utilities
- **Dark mode** `class` strategy
- **APCA color palette** using `oklch()` for perceptual uniformity
- **Inline comments** referencing guideline (e.g., `// GUIDELINE: Balance contrast in lockups`)

### 5. USAGE IN FRONTEND (EXAMPLE CLASSES)

After config, these classes **must work** and **enforce balance**:

```html
<!-- Text + Icon pair (balanced) -->
<!-- <div class="text-icon-pair-medium flex items-center gap-[var(--pair-gap)]">
  <svg class="w-5 h-5 stroke-[var(--pair-icon-stroke)]" /> 
  <span class="font-medium">Settings</span>
</div> -->

<!-- Layered shadow -->
<div class="shadow-lg-ambient shadow-lg-direct rounded-xl">

<!-- Crisp border -->
<div class="border border-crisp">

<!-- Nested radius -->
<div class="rounded-xl p-4">
  <div class="rounded-lg bg-card p-3"> <!-- ≤ parent -->
  </div>
</div>

<!-- APCA-safe text -->
<p class="text-apca-pass text-foreground">Accessible text</p>

<!-- Optical nudge -->
<img class="relative top-[optical-p1]" />