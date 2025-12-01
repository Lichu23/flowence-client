

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Lichu23/flowence-client.git
cd flowence-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3002

# Scandit Barcode Scanner
NEXT_PUBLIC_SCANDIT_LICENSE_KEY=your_scandit_license_key_here

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 4. Start the Backend

Ensure the backend API is running before starting the frontend. Refer to the backend repository for setup instructions.

---

## 🏃 Running the Project

### Development Mode

Start the development server with Turbopack:

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests (headless) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run test:e2e:headed` | Run E2E tests in headed mode |
| `npm run test:all` | Run all tests (unit + E2E) |

---

## 🧪 Testing

### Unit Tests

Run Jest unit tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

Run specific test file:

```bash
npm test -- ComponentName.test.tsx
```

Run specific test by name:

```bash
npm test -- --testNamePattern="test name"
```

### End-to-End Tests

Run Playwright E2E tests:

```bash
npm run test:e2e
```

Interactive UI mode:

```bash
npm run test:e2e:ui
```

Debug specific test:

```bash
npx playwright test --debug e2e/auth.spec.ts
```

### Test Files

- **Unit Tests**: `src/components/ui/__tests__/*.test.tsx`
- **E2E Tests**:
  - `e2e/auth.spec.ts` - Authentication flows
  - `e2e/multi-store.spec.ts` - Multi-store functionality
  - `e2e/pos.spec.ts` - Point of Sale operations
  - `e2e/products.spec.ts` - Product management

---

## 📁 Project Structure

```
flowence-client/
├── .claude/                    # Claude Code agent configurations
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── accept-invitation/  # Employee invitation acceptance
│   │   ├── dashboard/          # Owner dashboard
│   │   ├── employees/          # Employee management
│   │   ├── login/              # Login page
│   │   ├── pos/                # Point of Sale terminal
│   │   │   └── components/     # POS-specific components
│   │   ├── products/           # Product management
│   │   │   └── components/     # Product-specific components
│   │   ├── register/           # Registration page
│   │   ├── sales/              # Sales history and returns
│   │   │   └── [id]/           # Individual sale details
│   │   ├── stores/             # Store management
│   │   │   └── [id]/settings/  # Store settings
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable components
│   │   ├── barcode/            # Barcode scanner components
│   │   ├── common/             # Shared components (Stripe, Scanner)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── help/               # Help modals
│   │   ├── landing/            # Landing page components
│   │   ├── print/              # Print-related components
│   │   ├── ui/                 # UI components (Card, Toast, etc.)
│   │   │   └── __tests__/      # Component tests
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── ProtectedRoute.tsx  # Route protection HOC
│   │   └── StoreSelector.tsx   # Store selection dropdown
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── CartContext.tsx     # Shopping cart state
│   │   ├── SettingsContext.tsx # Store settings
│   │   └── StoreContext.tsx    # Multi-store state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useBarcodeSearch.ts # Barcode product search
│   │   ├── useDebounce.ts      # Debounce utility
│   │   └── usePrintStatus.ts   # Print job tracking
│   ├── lib/                    # Libraries and utilities
│   │   ├── api/                # Modular API client
│   │   │   ├── auth.ts         # Auth endpoints
│   │   │   ├── client.ts       # Core HTTP client
│   │   │   ├── currency.ts     # Currency endpoints
│   │   │   ├── dashboard.ts    # Dashboard endpoints
│   │   │   ├── invitations.ts  # Invitation endpoints
│   │   │   ├── payments.ts     # Payment endpoints
│   │   │   ├── products.ts     # Product endpoints
│   │   │   ├── sales.ts        # Sales endpoints
│   │   │   ├── stores.ts       # Store endpoints
│   │   │   └── index.ts        # Barrel export
│   │   └── api.ts              # Legacy API re-export
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   ├── constants/          # Global constants
│   │   ├── formatting/         # Formatting utilities
│   │   │   ├── currency.ts     # Currency formatting
│   │   │   └── date.ts         # Date/time formatting
│   │   └── validation/         # Validation utilities
│   │       └── barcode.ts      # Barcode validation
│   └── test-utils/             # Testing utilities
│       └── index.tsx
├── .env.local                  # Environment variables (not in git)
├── .env.local.example          # Environment variables template
├── .gitignore
├── CLAUDE.md                   # Claude Code project documentation
├── eslint.config.mjs           # ESLint configuration
├── jest.config.js              # Jest configuration
├── next.config.ts              # Next.js configuration
├── package.json
├── playwright.config.ts        # Playwright configuration
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # This file
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🔐 Environment Variables

The application requires the following environment variables:

### Required

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3002` |
| `NEXT_PUBLIC_SCANDIT_LICENSE_KEY` | Scandit barcode scanner license key | - |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for payments | - |

### Optional

No optional environment variables at this time.

### Example `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SCANDIT_LICENSE_KEY=AQlRwg0QNlqQEIlqFQYbCg46PjI3LitpFQYbCg5hYg56...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51J...
```

---

## 🏗️ Architecture

### State Management

The application uses **React Context API** with six nested providers:

```
ToastProvider → AuthProvider → StoreProvider → SettingsProvider → CartProvider → StripeProvider
```

#### Key Contexts

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - JWT token management with auto-refresh (25-minute intervals)
   - User authentication state
   - Methods: `login()`, `register()`, `logout()`, `refreshUser()`
   - Persists to localStorage

2. **StoreContext** (`src/contexts/StoreContext.tsx`)
   - Multi-store management
   - Current store selection
   - CRUD operations for stores
   - Methods: `selectStore()`, `createStore()`, `updateStore()`, `deleteStore()`

3. **SettingsContext** (`src/contexts/SettingsContext.tsx`)
   - Store-specific settings (currency, timezone, formats)
   - Formatting utilities: `formatCurrency()`, `formatDate()`, `formatDateTime()`
   - Locale support

4. **CartContext** (`src/contexts/CartContext.tsx`)
   - In-memory shopping cart for POS
   - Methods: `addItem()`, `removeItem()`, `updateQuantity()`, `clear()`
   - Not persisted (session-only)

5. **ToastProvider** (`src/components/ui/Toast.tsx`)
   - Global toast notifications
   - `useToast()` hook for success/error/warning/info messages

6. **StripeProvider** (`src/components/common/StripeProvider.tsx`)
   - Stripe Elements integration
   - Card and QR payment support

### API Architecture

The API client is modular with separate files for each domain:

- **Core Client** (`src/lib/api/client.ts`):
  - Automatic JWT token handling
  - 401 auto-refresh and retry
  - Network error handling
  - Request/response interceptors

- **Domain Modules**:
  - `auth.ts` - Authentication
  - `stores.ts` - Store management
  - `products.ts` - Product CRUD and stock operations
  - `sales.ts` - Sales processing and returns
  - `dashboard.ts` - Analytics and statistics
  - `invitations.ts` - Employee invitations
  - `currency.ts` - Currency conversion
  - `payments.ts` - Stripe payment processing

### Routing

- **Type**: Next.js App Router (file-based routing)
- **Protection**: `ProtectedRoute` HOC wraps authenticated pages
- **Navigation**: `useRouter()` and `usePathname()` from `next/navigation`
- **Role-based Access**: Supports owner/employee role restrictions

### Key Features

#### Dual-Stock Management

Products have two independent stock types:

- **stock_venta**: Sales floor stock (visible to customers)
- **stock_deposito**: Warehouse stock (backstock)

Operations:
- `fillWarehouse()` - Add stock to warehouse
- `updateSalesStock()` - Update sales floor directly
- `restockProduct()` - Move stock from warehouse to sales floor
- Stock movement history tracking

#### Barcode Scanner

- **Integration**: Scandit Web SDK 8.0.0
- **Manual Camera Toggle**: NEW! Camera activation on-demand for better performance
- **Supported Formats**: EAN13, EAN8, UPC-E, Code128, Code39, QR
- **Validation**: 8-14 digit barcode format validation
- **Auto-hide**: Camera automatically stops after successful scan (500ms delay)
- **Error Handling**: Permission errors, no camera available, camera in use

#### Payment Processing

**Cash Payments**:
- Amount received input
- Automatic change calculation
- Immediate completion

**Card Payments**:
- Manual confirmation (no external API)
- Employee confirms payment completion
- Simple confirmation dialog

**Stripe Integration** (optional):
- Card payment intent creation
- QR code payment support
- Payment status tracking

#### Receipt System

- Server-side PDF generation
- Automatic download with filename from response headers
- Reprint functionality with print queue monitoring
- Print job state tracking: pending → printing → completed/failed

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use TypeScript with strict mode
- Follow ES module best practices (destructured imports)
- Use Tailwind CSS for styling (no inline styles)
- Add proper TypeScript types (no `any`)
- Write unit tests for new components
- Follow accessibility guidelines (WCAG)
- Ensure responsive design (mobile-first)

### Commit Convention

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding tests
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `chore:` - Build process or auxiliary tool changes

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For questions or issues:

- **GitHub Issues**: [Create an issue](https://github.com/Lichu23/flowence-client/issues)
- **Email**: lisandroxarenax@gmail.com

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Scandit** - Barcode scanning technology
- **Stripe** - Payment processing
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Hosting and deployment

---

## 📊 Project Status

**Current Version**: 0.1.0 (Beta)

### Recent Updates

- ✅ Manual camera toggle for barcode scanner (performance improvement)
- ✅ Card payment support in POS
- ✅ Component refactoring (POS and Products pages)
- ✅ Landing page improvements
- ✅ Comprehensive testing suite

### Roadmap

- [ ] Offline mode support (PWA)
- [ ] Advanced analytics dashboard
- [ ] Customer loyalty program
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Email receipt delivery
- [ ] Advanced reporting

---

**Built with ❤️ by the Flowence Team**
