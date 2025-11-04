/**
 * E2E Tests: Product Management
 */

import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner
    await page.goto('/');
    await page.getByLabel(/email/i).fill('owner@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Navigate to products page
    await page.getByRole('link', { name: /productos/i }).click();
    await expect(page).toHaveURL('/products');
  });

  test('should display products page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible();
  });

  test('should open create product form', async ({ page }) => {
    await page.getByRole('button', { name: /agregar producto/i }).click();
    await expect(page.getByRole('heading', { name: /nuevo producto/i })).toBeVisible();
  });

  test('should create new product', async ({ page }) => {
    // Open form
    await page.getByRole('button', { name: /agregar producto/i }).click();
    
    // Fill form
    await page.getByLabel(/nombre/i).fill('Test Product E2E');
    await page.getByLabel(/código de barras/i).fill('1234567890123');
    await page.getByLabel(/precio/i).fill('19.99');
    await page.getByLabel(/costo/i).fill('10.00');
    await page.getByLabel(/stock depósito/i).fill('100');
    await page.getByLabel(/stock venta/i).fill('20');
    
    // Submit
    await page.getByRole('button', { name: /crear producto/i }).click();
    
    // Should show success toast
    await expect(page.getByText(/producto creado/i)).toBeVisible({ timeout: 5000 });
    
    // Product should appear in list
    await expect(page.getByText('Test Product E2E')).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar/i);
    await searchInput.fill('Test');
    
    // Wait for debounce and results
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    await expect(page.getByText(/test/i).first()).toBeVisible();
  });

  test('should edit product', async ({ page }) => {
    // Find and click edit button for first product
    const editButton = page.getByRole('button', { name: /editar/i }).first();
    await editButton.click();
    
    // Form should open with product data
    await expect(page.getByRole('heading', { name: /editar producto/i })).toBeVisible();
    
    // Change name
    const nameInput = page.getByLabel(/nombre/i);
    await nameInput.clear();
    await nameInput.fill('Updated Product Name');
    
    // Submit
    await page.getByRole('button', { name: /actualizar/i }).click();
    
    // Should show success toast
    await expect(page.getByText(/producto actualizado/i)).toBeVisible({ timeout: 5000 });
  });

  test('should delete product', async ({ page }) => {
    // Find and click delete button
    const deleteButton = page.getByRole('button', { name: /eliminar/i }).first();
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    await deleteButton.click();
    
    // Should show success toast
    await expect(page.getByText(/producto.*eliminado/i)).toBeVisible({ timeout: 5000 });
  });

  test('should filter by category', async ({ page }) => {
    // Select a category from filter
    const categorySelect = page.getByLabel(/categoría/i);
    await categorySelect.selectOption({ index: 1 }); // Select first non-empty option
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Products should be filtered
    const productCount = await page.getByRole('row').count();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should show low stock products', async ({ page }) => {
    // Click low stock filter
    await page.getByRole('checkbox', { name: /stock bajo/i }).check();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Should show only low stock products
    await expect(page.getByText(/stock bajo/i)).toBeVisible();
  });
});
