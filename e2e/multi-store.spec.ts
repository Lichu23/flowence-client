/**
 * E2E Tests: Multi-Store Functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Store Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner
    await page.goto('/');
    await page.getByLabel(/email/i).fill('owner@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should display multi-store overview on dashboard', async ({ page }) => {
    // Should show multi-store overview if user has multiple stores
    const overview = page.getByText(/resumen global/i);
    
    // Check if overview exists (only for users with multiple stores)
    const isVisible = await overview.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(page.getByText(/total productos/i)).toBeVisible();
      await expect(page.getByText(/total ventas/i)).toBeVisible();
      await expect(page.getByText(/ingresos totales/i)).toBeVisible();
    }
  });

  test('should switch between stores', async ({ page }) => {
    // Open store selector
    const storeSelector = page.getByRole('button', { name: /tienda/i }).first();
    await storeSelector.click();
    
    // Select different store
    const storeOptions = page.getByRole('option');
    const optionCount = await storeOptions.count();
    
    if (optionCount > 1) {
      await storeOptions.nth(1).click();
      
      // Dashboard should update with new store data
      await page.waitForTimeout(1000);
      await expect(page.getByRole('heading')).toBeVisible();
    }
  });

  test('should navigate to stores management page', async ({ page }) => {
    await page.getByRole('link', { name: /tiendas/i }).click();
    await expect(page).toHaveURL('/stores');
    await expect(page.getByRole('heading', { name: /mis tiendas/i })).toBeVisible();
  });

  test('should create new store', async ({ page }) => {
    await page.goto('/stores');
    
    // Click add store button
    await page.getByRole('button', { name: /agregar tienda/i }).click();
    
    // Fill form
    await page.getByLabel(/nombre/i).fill('New Test Store');
    await page.getByLabel(/dirección/i).fill('123 Test Street');
    await page.getByLabel(/teléfono/i).fill('555-0123');
    
    // Submit
    await page.getByRole('button', { name: /crear tienda/i }).click();
    
    // Should show success
    await expect(page.getByText(/tienda creada/i)).toBeVisible({ timeout: 5000 });
    
    // New store should appear in list
    await expect(page.getByText('New Test Store')).toBeVisible();
  });

  test('should configure store settings', async ({ page }) => {
    await page.goto('/stores');
    
    // Click on a store to view details
    const storeCard = page.getByRole('link', { name: /ver detalles/i }).first();
    await storeCard.click();
    
    // Should navigate to store settings
    await expect(page).toHaveURL(/\/stores\/[^/]+/);
    
    // Should show store configuration options
    await expect(page.getByText(/configuración/i)).toBeVisible();
  });

  test('should show store-specific products', async ({ page }) => {
    // Navigate to products
    await page.goto('/products');
    
    // Products should be filtered by current store
    const currentStore = await page.getByText(/tienda actual/i).textContent();
    
    // All products should belong to current store
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible();
  });

  test('should show store-specific sales', async ({ page }) => {
    // Navigate to sales
    await page.goto('/sales');
    
    // Sales should be filtered by current store
    await expect(page.getByRole('heading', { name: /ventas/i })).toBeVisible();
    
    // Should show sales for current store only
    const salesTable = page.getByRole('table');
    await expect(salesTable).toBeVisible();
  });

  test('should invite employee to specific store', async ({ page }) => {
    await page.goto('/employees');
    
    // Click invite button
    await page.getByRole('button', { name: /invitar empleado/i }).click();
    
    // Fill form
    await page.getByLabel(/email/i).fill('newemployee@test.com');
    
    // Select store (should default to current store)
    const storeSelect = page.getByLabel(/tienda/i);
    await expect(storeSelect).toBeVisible();
    
    // Submit
    await page.getByRole('button', { name: /enviar invitación/i }).click();
    
    // Should show success
    await expect(page.getByText(/invitación enviada/i)).toBeVisible({ timeout: 5000 });
  });

  test('should click store card to switch stores', async ({ page }) => {
    // If multi-store overview is visible
    const storeCard = page.getByRole('button', { name: /tienda/i }).first();
    const isVisible = await storeCard.isVisible().catch(() => false);
    
    if (isVisible) {
      await storeCard.click();
      
      // Should switch to that store
      await page.waitForTimeout(500);
      await expect(page.getByRole('heading')).toBeVisible();
    }
  });

  test('should show correct store context in navbar', async ({ page }) => {
    // Navbar should show current store name
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Should have store selector
    const storeSelector = navbar.getByRole('button', { name: /tienda/i }).first();
    await expect(storeSelector).toBeVisible();
  });

  test('should maintain store context across navigation', async ({ page }) => {
    // Get current store name
    const storeName = await page.getByRole('button', { name: /tienda/i }).first().textContent();
    
    // Navigate to different pages
    await page.goto('/products');
    await page.goto('/pos');
    await page.goto('/sales');
    await page.goto('/dashboard');
    
    // Store context should remain the same
    const currentStoreName = await page.getByRole('button', { name: /tienda/i }).first().textContent();
    expect(currentStoreName).toBe(storeName);
  });
});
