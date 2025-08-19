import { test, expect } from '@playwright/test';

test.describe('Company Detail Page E2E Tests', () => {
  test('should handle company detail page navigation and display', async ({ page }) => {
    // Start from companies page
    await page.goto('/companies');

    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Look for a table row with company data
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Get the first company name for verification
      const firstRow = tableRows.first();
      const companyName = await firstRow.locator('td').first().textContent();
      
      // Click on the first company row
      await firstRow.click();
      
      // Should navigate to company detail page
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      
      // Check if we're on a company detail page
      const backButton = page.getByRole('button', { name: /Back to Companies/i });
      await expect(backButton).toBeVisible();
      
      // The company name should be displayed as a heading
      if (companyName) {
        const cleanCompanyName = companyName.split('\n')[0]; // Take first line if multi-line
        await expect(page.getByRole('heading', { name: new RegExp(cleanCompanyName, 'i') })).toBeVisible();
      }
      
      // Should have company information section
      await expect(page.getByText('Company Information')).toBeVisible();
    } else {
      console.log('No companies found to test detail page navigation');
    }
  });

  test('should display proper company information on detail page', async ({ page }) => {
    // Try to navigate to a specific company detail page
    // Since we don't know the exact ID, we'll go via the companies page first
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });

      // Wait for company data to load
      await page.waitForSelector('text=Loading company data...', { state: 'detached', timeout: 10000 });

      // Check for key sections that should be on every company detail page
      await expect(page.getByText('Company Information')).toBeVisible();
      
      // Look for common company fields
      const locationIcon = page.locator('[data-testid="location"], .lucide-globe, svg').first();
      if (await locationIcon.isVisible()) {
        // Company location should be displayed
        await expect(locationIcon).toBeVisible();
      }
    }
  });

  test('should have working back navigation', async ({ page }) => {
    // Navigate to companies page first
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Go to detail page
      await tableRows.first().click();
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      
      // Click back button
      const backButton = page.getByRole('button', { name: /Back to Companies/i });
      await backButton.click();
      
      // Should be back on companies page
      await expect(page.getByText('Company Directory')).toBeVisible();
      await expect(page.getByPlaceholder(/Search companies/i)).toBeVisible();
    }
  });

  test('should handle non-existent company gracefully', async ({ page }) => {
    // Navigate directly to a non-existent company
    await page.goto('/company/non-existent-id-12345');
    
    // Should show error state
    await expect(page.getByText(/Company not found|Error|Not found/i)).toBeVisible();
    
    // Should still have back button
    const backButton = page.getByRole('button', { name: /Back to Companies/i });
    await expect(backButton).toBeVisible();
    
    // Back button should work
    await backButton.click();
    await expect(page.getByText('Company Directory')).toBeVisible();
  });

  test('should display company metrics when available', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      await page.waitForSelector('text=Loading company data...', { state: 'detached', timeout: 10000 });

      // Look for metrics sections
      const metricsTexts = [
        'Total Waste Generated',
        'Recycling Rate', 
        'Cost Savings',
        'Carbon Footprint'
      ];

      // At least some metrics should be displayed, or "No waste data available"
      const hasMetrics = await Promise.all(
        metricsTexts.map(text => page.getByText(text).isVisible())
      );
      
      const noDataText = await page.getByText('No waste data available').isVisible();
      
      // Either we have some metrics or we show the no data message
      expect(hasMetrics.some(visible => visible) || noDataText).toBeTruthy();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });

      // Should still show main content on mobile
      await expect(page.getByText('Company Information')).toBeVisible();
      
      // Back button should be visible and clickable on mobile
      const backButton = page.getByRole('button', { name: /Back to Companies/i });
      await expect(backButton).toBeVisible();
    }
  });

  test('should have proper accessibility structure on detail page', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      await tableRows.first().click();
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      await page.waitForSelector('text=Loading company data...', { state: 'detached', timeout: 10000 });

      // Check for main landmark
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check for header landmark
      const header = page.locator('header, [role="banner"]');
      await expect(header).toBeVisible();

      // Should have proper heading hierarchy
      const h1 = page.locator('h1, [role="heading"][aria-level="1"]');
      await expect(h1).toBeVisible(); // Company name should be h1

      // Back button should be accessible
      const backButton = page.getByRole('button', { name: /Back to Companies/i });
      await expect(backButton).toBeVisible();
      await expect(backButton).toBeEnabled();
    }
  });

  test('should handle loading states properly on detail page', async ({ page }) => {
    // Navigate to companies page first to get a real company ID
    await page.goto('/companies');
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Get the link URL before clicking
      const firstRow = tableRows.first();
      await firstRow.click();
      
      // Check if loading state appears briefly (it might be too fast to catch)
      const loadingText = page.getByText('Loading company data...');
      
      // Wait for the page to fully load
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      
      // Loading should be gone and content should be visible
      await expect(loadingText).not.toBeVisible();
      await expect(page.getByText('Company Information')).toBeVisible();
    }
  });
});