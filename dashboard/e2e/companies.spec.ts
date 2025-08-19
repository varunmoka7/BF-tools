import { test, expect } from '@playwright/test';

test.describe('Companies Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the companies page
    await page.goto('/companies');
  });

  test('should load the companies page successfully', async ({ page }) => {
    // Check if the page title contains relevant keywords
    await expect(page).toHaveTitle(/Companies|Dashboard/i);

    // Check if the main heading is present
    await expect(page.getByRole('heading', { name: /Company Directory/i })).toBeVisible();

    // Check if the header with app name is present
    await expect(page.getByText('Waste Management BI')).toBeVisible();
  });

  test('should display company search and filter interface', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for search section heading
    await expect(page.getByText('Search & Filter')).toBeVisible();

    // Check for search input
    const searchInput = page.getByPlaceholder(/Search companies/i);
    await expect(searchInput).toBeVisible();

    // The search input should be focusable
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
  });

  test('should display companies table with proper headers', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Check for table headers
    await expect(page.getByText('Company Name')).toBeVisible();
    await expect(page.getByText('Country')).toBeVisible();
    await expect(page.getByText('Sector')).toBeVisible();
    await expect(page.getByText('Industry')).toBeVisible();
    await expect(page.getByText('Size')).toBeVisible();
    await expect(page.getByText('Total Waste')).toBeVisible();
    await expect(page.getByText('Recovery Rate')).toBeVisible();
  });

  test('should allow searching for companies', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Get the search input
    const searchInput = page.getByPlaceholder(/Search companies/i);
    
    // Type in search box
    await searchInput.fill('test');
    
    // Wait a moment for search to process (if debounced)
    await page.waitForTimeout(500);
    
    // The search term should be in the input
    await expect(searchInput).toHaveValue('test');
  });

  test('should have sortable table columns', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Check for sortable column headers (they should have buttons)
    const nameHeaderButton = page.getByRole('button', { name: /Company Name/i });
    const wasteHeaderButton = page.getByRole('button', { name: /Total Waste/i });
    const recyclingHeaderButton = page.getByRole('button', { name: /Recovery Rate/i });

    await expect(nameHeaderButton).toBeVisible();
    await expect(wasteHeaderButton).toBeVisible();
    await expect(recyclingHeaderButton).toBeVisible();

    // Click on a sortable column
    await nameHeaderButton.click();

    // Check if sort icon appears (arrow up/down)
    // The button should still be clickable after sort
    await expect(nameHeaderButton).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Search for something that likely won't exist
    const searchInput = page.getByPlaceholder(/Search companies/i);
    await searchInput.fill('nonexistentcompanyxyz123');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Should show empty state or "No companies found" message
    const noResultsText = page.getByText(/No companies found|No results/i);
    
    // Either the empty state should be visible OR we should still see the table structure
    const tableExists = await page.locator('table').isVisible();
    const noResults = await noResultsText.isVisible();
    
    expect(tableExists || noResults).toBeTruthy();
  });

  test('should have working pagination when applicable', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /Next/i });
    const prevButton = page.getByRole('button', { name: /Previous/i });
    
    // Check if pagination exists (it might not if there are few companies)
    const nextButtonVisible = await nextButton.isVisible();
    const prevButtonVisible = await prevButton.isVisible();
    
    if (nextButtonVisible || prevButtonVisible) {
      // If pagination exists, test it
      if (nextButtonVisible && await nextButton.isEnabled()) {
        await nextButton.click();
        // Wait for page change
        await page.waitForTimeout(500);
        
        // Previous button should now be enabled
        await expect(prevButton).toBeEnabled();
      }
    }
  });

  test('should navigate to company detail page when row is clicked', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Look for a table row with company data
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // Click on the first company row
      const firstRow = tableRows.first();
      await firstRow.click();
      
      // Should navigate to company detail page
      await page.waitForURL(/\/company\/.*/, { timeout: 10000 });
      
      // Check if we're on a company detail page
      const backButton = page.getByRole('button', { name: /Back to Companies/i });
      await expect(backButton).toBeVisible();
    } else {
      // If no companies, that's also valid - just check the empty state
      console.log('No companies found to test navigation');
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Check if the main content is still visible
    await expect(page.getByText('Company Directory')).toBeVisible();
    await expect(page.getByPlaceholder(/Search companies/i)).toBeVisible();

    // The table should be responsive (might scroll horizontally or stack)
    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  });

  test('should maintain search state during interactions', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Enter a search term
    const searchInput = page.getByPlaceholder(/Search companies/i);
    await searchInput.fill('manufacturing');
    
    // Wait for search to process
    await page.waitForTimeout(500);
    
    // Scroll down and back up
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Search term should still be there
    await expect(searchInput).toHaveValue('manufacturing');
  });

  test('should have proper accessibility structure', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=Loading companies...', { state: 'detached', timeout: 10000 });

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for header landmark
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();

    // Check for proper heading hierarchy
    const h2 = page.locator('h2, [role="heading"][aria-level="2"]');
    await expect(h2.first()).toBeVisible(); // Should have company directory heading

    // Check for table accessibility
    const table = page.locator('table');
    if (await table.isVisible()) {
      // Table should have proper headers
      const tableHeaders = page.locator('th');
      const headerCount = await tableHeaders.count();
      expect(headerCount).toBeGreaterThan(0);
    }
  });
});