/**
 * E2E Tests: Authentication Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Flowence/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i });
    await loginButton.click();
    
    // Form should not submit with empty fields
    await expect(page).toHaveURL('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.getByLabel(/email/i).fill('owner@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText(/bienvenido/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@test.com');
    await page.getByLabel(/contraseña/i).fill('wrongpassword');
    
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    // Should show error toast
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /registrarse/i }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.getByLabel(/nombre/i).fill('New User');
    await page.getByLabel(/email/i).fill('newuser@test.com');
    await page.getByLabel(/contraseña/i).first().fill('password123');
    await page.getByLabel(/confirmar contraseña/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel(/email/i).fill('owner@test.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Logout
    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/');
  });
});
