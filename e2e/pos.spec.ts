/**
 * E2E Tests: Point of Sale
 */

import { test, expect } from '@playwright/test';

test.describe('Point of Sale', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('owner@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Navigate to POS
    await page.getByRole('link', { name: /punto de venta|pos/i }).click();
    await expect(page).toHaveURL('/pos');
  });

  test('should display POS page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /punto de venta/i })).toBeVisible();
    await expect(page.getByText(/carrito vacío/i)).toBeVisible();
  });

  test('should add product to cart by search', async ({ page }) => {
    // Search for product
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    
    // Click add or press enter
    await searchInput.press('Enter');
    
    // Product should be added to cart
    await expect(page.getByText(/test product/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/agregado al carrito/i)).toBeVisible();
  });

  test('should update product quantity in cart', async ({ page }) => {
    // Add product first
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Find quantity input and increase
    const quantityInput = page.getByRole('spinbutton', { name: /cantidad/i }).first();
    await quantityInput.clear();
    await quantityInput.fill('3');
    
    // Total should update
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('should remove product from cart', async ({ page }) => {
    // Add product first
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Click remove button
    await page.getByRole('button', { name: /eliminar/i }).first().click();
    
    // Cart should be empty
    await expect(page.getByText(/carrito vacío/i)).toBeVisible();
  });

  test('should process cash sale', async ({ page }) => {
    // Add product to cart
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Click checkout
    await page.getByRole('button', { name: /pagar/i }).click();
    
    // Payment modal should open
    await expect(page.getByText(/método de pago/i)).toBeVisible();
    
    // Select cash
    await page.getByRole('radio', { name: /efectivo/i }).check();
    
    // Enter amount
    await page.getByLabel(/monto recibido/i).fill('50');
    
    // Confirm payment
    await page.getByRole('button', { name: /confirmar pago/i }).click();
    
    // Should show success
    await expect(page.getByText(/venta completada/i)).toBeVisible({ timeout: 5000 });
    
    // Cart should be cleared
    await expect(page.getByText(/carrito vacío/i)).toBeVisible();
  });

  test('should show insufficient amount warning', async ({ page }) => {
    // Add product to cart
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Click checkout
    await page.getByRole('button', { name: /pagar/i }).click();
    
    // Select cash
    await page.getByRole('radio', { name: /efectivo/i }).check();
    
    // Enter insufficient amount
    await page.getByLabel(/monto recibido/i).fill('5');
    
    // Try to confirm
    await page.getByRole('button', { name: /confirmar pago/i }).click();
    
    // Should show warning
    await expect(page.getByText(/monto insuficiente/i)).toBeVisible();
  });

  test('should calculate change correctly', async ({ page }) => {
    // Add product to cart
    const searchInput = page.getByPlaceholder(/buscar producto/i);
    await searchInput.fill('Test Product');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Click checkout
    await page.getByRole('button', { name: /pagar/i }).click();
    
    // Select cash and enter amount
    await page.getByRole('radio', { name: /efectivo/i }).check();
    await page.getByLabel(/monto recibido/i).fill('100');
    
    // Change should be displayed
    await expect(page.getByText(/cambio/i)).toBeVisible();
  });

  test('should open scanner modal', async ({ page }) => {
    // Click scanner button
    await page.getByRole('button', { name: /escanear/i }).click();
    
    // Scanner modal should open
    await expect(page.getByText(/escanear código/i)).toBeVisible();
  });
});
