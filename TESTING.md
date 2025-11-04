# Testing Guide for Flowence

## Overview

This document provides comprehensive information about testing in the Flowence application. We use Jest for unit/integration tests and Playwright for E2E tests.

## Test Structure

```
flowence-client/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── __tests__/          # Component unit tests
│   ├── test-utils/
│   │   └── index.tsx                # Test utilities and helpers
├── e2e/                              # E2E tests
│   ├── auth.spec.ts
│   ├── products.spec.ts
│   ├── pos.spec.ts
│   └── multi-store.spec.ts
├── jest.config.js                    # Jest configuration
├── jest.setup.js                     # Jest setup file
└── playwright.config.ts              # Playwright configuration
```

## Installation

First, install all testing dependencies:

```bash
npm install
```

This will install:
- **Jest** - Unit testing framework
- **React Testing Library** - React component testing
- **Playwright** - E2E testing framework
- **@testing-library/jest-dom** - Custom Jest matchers

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Run All Tests

```bash
npm run test:all
```

## Writing Unit Tests

### Component Tests

Example test for a UI component:

```typescript
import { render, screen } from '@/test-utils';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});
```

### Using Test Utilities

The `test-utils` module provides:

1. **Custom render function** - Wraps components with all providers
2. **Mock data** - Pre-defined mock objects for testing
3. **Helper functions** - Utilities for common testing scenarios

```typescript
import { render, mockOwnerUser, mockProduct } from '@/test-utils';

// Render with all providers automatically
render(<MyComponent />);

// Use mock data
const user = mockOwnerUser;
const product = mockProduct;
```

### Testing with Contexts

Components that use contexts are automatically wrapped:

```typescript
import { render, screen } from '@/test-utils';
import { MyComponent } from './MyComponent';

// AuthContext, StoreContext, etc. are automatically provided
render(<MyComponent />);
```

### Testing Async Operations

```typescript
import { render, screen, waitFor } from '@/test-utils';

it('loads data asynchronously', async () => {
  render(<MyComponent />);
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@/test-utils';

it('handles button click', () => {
  const handleClick = jest.fn();
  render(<button onClick={handleClick}>Click me</button>);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Writing E2E Tests

### Basic E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup - navigate to page, login, etc.
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByLabel('Email').fill('user@test.com');
    
    // Act
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Common E2E Patterns

#### Login Helper

```typescript
async function login(page, email, password) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
}
```

#### Waiting for Toasts

```typescript
// Wait for success toast
await expect(page.getByText(/éxito|completado/i)).toBeVisible({ timeout: 5000 });

// Wait for error toast
await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
```

#### Handling Dialogs

```typescript
// Accept confirmation dialog
page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Delete' }).click();
```

## Test Coverage

### Coverage Goals

- **Overall:** > 70%
- **Critical paths:** 100%
- **UI Components:** > 80%
- **Business logic:** > 90%

### Viewing Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed report.

## Mock Data

### Available Mocks

```typescript
import {
  mockOwnerUser,
  mockEmployeeUser,
  mockStore,
  mockProduct,
  mockSale,
} from '@/test-utils';
```

### Creating Custom Mocks

```typescript
const customProduct = {
  ...mockProduct,
  name: 'Custom Product',
  price: 29.99,
};
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   - Focus on what the component does, not how it does it
   
2. **Use descriptive test names**
   ```typescript
   it('shows error message when form is invalid')
   // Better than: it('works')
   ```

3. **Arrange-Act-Assert pattern**
   ```typescript
   // Arrange
   const user = mockOwnerUser;
   
   // Act
   render(<UserProfile user={user} />);
   
   // Assert
   expect(screen.getByText(user.name)).toBeInTheDocument();
   ```

4. **Test edge cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary conditions

5. **Keep tests isolated**
   - Each test should be independent
   - Don't rely on test execution order

### E2E Tests

1. **Test critical user flows**
   - Authentication
   - Product management
   - Sales processing
   - Multi-store operations

2. **Use realistic data**
   - Test with data similar to production

3. **Handle async operations**
   - Always wait for elements to be visible
   - Use appropriate timeouts

4. **Clean up after tests**
   - Reset state between tests
   - Use test-specific data

5. **Test across browsers**
   - Run tests on Chrome, Firefox, Safari
   - Test mobile viewports

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test -- LoadingSpinner.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders with custom text"

# Run with verbose output
npm test -- --verbose
```

### Playwright Debugging

```bash
# Run with UI mode (best for debugging)
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Debug specific test
npx playwright test --debug e2e/auth.spec.ts
```

### Common Issues

#### Tests timing out
- Increase timeout: `{ timeout: 10000 }`
- Check for async operations
- Ensure elements are visible before interacting

#### Elements not found
- Use `waitFor` for async elements
- Check selectors are correct
- Verify element is actually rendered

#### Flaky tests
- Add proper waits
- Avoid hard-coded delays
- Use `waitFor` instead of `setTimeout`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Maintenance

### When to Update Tests

1. **Feature changes** - Update tests when functionality changes
2. **Bug fixes** - Add regression tests
3. **Refactoring** - Ensure tests still pass
4. **New features** - Write tests before or alongside implementation

### Keeping Tests Fast

1. **Mock external dependencies**
2. **Use test utilities for common setup**
3. **Run tests in parallel**
4. **Keep E2E tests focused on critical paths**

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review existing tests for examples
3. Check test output for error messages
4. Use debugging tools (UI mode, headed mode)
5. Ask the team for help

---

**Remember:** Good tests give confidence in your code. Write tests that are maintainable, readable, and valuable.
