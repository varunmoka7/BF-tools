import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
  });

  test('should load the dashboard page successfully', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Dashboard/i);

    // Check if the main heading is present
    await expect(page.getByRole('heading', { name: /Dashboard Overview/i })).toBeVisible();

    // Check if the header with app name is present
    await expect(page.getByText('Waste Management BI')).toBeVisible();
  });

  test('should display metrics cards with data', async ({ page }) => {
    // Wait for the dashboard to load (loading state should disappear)
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check if all metric cards are present
    await expect(page.getByText('Total Waste')).toBeVisible();
    await expect(page.getByText('Cost Savings')).toBeVisible();
    await expect(page.getByText('Recycling Rate')).toBeVisible();
    await expect(page.getByText('Carbon Footprint')).toBeVisible();

    // Check if metric values are displayed (these should be the mock values)
    await expect(page.getByText(/125,000 kg|125000/)).toBeVisible();
    await expect(page.getByText(/\$45,000|\$45000/)).toBeVisible();
    await expect(page.getByText(/67.8%|67.8/)).toBeVisible();
    await expect(page.getByText(/62.5/)).toBeVisible();
  });

  test('should display company and waste data information', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check for Recent Activity section
    await expect(page.getByText('Recent Activity')).toBeVisible();
    
    // Check for Companies section
    await expect(page.getByText('Companies')).toBeVisible();

    // Check for Getting Started section
    await expect(page.getByText('Getting Started')).toBeVisible();
  });

  test('should show getting started guide', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check if getting started content is visible
    await expect(page.getByText('Welcome to your Waste Management BI Dashboard!')).toBeVisible();
    await expect(page.getByText('Configure your Supabase connection in .env.local')).toBeVisible();
    await expect(page.getByText('Set up your database tables for companies and waste data')).toBeVisible();
  });

  test('should have proper page structure and accessibility', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for header landmark
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1, [role="heading"][aria-level="1"]');
    const h2 = page.locator('h2, [role="heading"][aria-level="2"]');
    
    await expect(h1).toBeVisible(); // Should have app title in header
    await expect(h2).toBeVisible(); // Should have dashboard overview
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check if the main content is still visible
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
    await expect(page.getByText('Total Waste')).toBeVisible();

    // Check if the layout adapts to mobile
    const metricsContainer = page.locator('.grid').first();
    await expect(metricsContainer).toBeVisible();
  });

  test('should handle loading states properly', async ({ page }) => {
    // Intercept the API call to simulate slow loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });

    // Navigate to page
    await page.goto('/');

    // Check if loading state is shown initially
    await expect(page.getByText('Loading dashboard...')).toBeVisible();

    // Wait for loading to complete
    await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 15000 });

    // Check if content is loaded
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test('should maintain state during page interactions', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Get initial metric values
    const totalWasteElement = page.getByText('Total Waste').locator('..').locator('..');
    const initialTotalWaste = await totalWasteElement.textContent();

    // Scroll down and back up
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));

    // Check if values are still the same
    const currentTotalWaste = await totalWasteElement.textContent();
    expect(currentTotalWaste).toBe(initialTotalWaste);
  });

  test('should display error states gracefully when data fails to load', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    // Navigate to page
    await page.goto('/');

    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Since the app falls back to mock data on error, it should still show content
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
    await expect(page.getByText('Total Waste')).toBeVisible();
  });

  test('should have working navigation elements', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading dashboard...', { state: 'detached', timeout: 10000 });

    // Check if the app name/logo is clickable (though it might not navigate anywhere)
    const appTitle = page.getByText('Waste Management BI');
    await expect(appTitle).toBeVisible();
    
    // The app title should be in the header
    const header = page.locator('header, [role="banner"]');
    await expect(header.locator('text=Waste Management BI')).toBeVisible();
  });
});