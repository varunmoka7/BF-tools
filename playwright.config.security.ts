/**
 * Playwright Configuration for Security E2E Testing
 * End-to-end security testing configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e/security',

  // Global test timeout
  timeout: 60000,

  // Test execution settings
  fullyParallel: false, // Security tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker for security tests

  // Test output
  reporter: [
    ['html', { outputFolder: 'test-results/security-e2e' }],
    ['junit', { outputFile: 'test-results/security-e2e-results.xml' }],
    ['json', { outputFile: 'test-results/security-e2e-results.json' }]
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-security-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-security-teardown.ts'),

  // Use setup files
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Browser settings
    headless: true,
    viewport: { width: 1280, height: 720 },

    // Security-focused settings
    ignoreHTTPSErrors: false, // Fail on HTTPS errors
    acceptDownloads: false,   // Disable downloads for security

    // Tracing
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Extra HTTP headers
    extraHTTPHeaders: {
      'X-Test-Type': 'security-e2e'
    }
  },

  // Test projects for different scenarios
  projects: [
    // Chrome - Main security tests
    {
      name: 'chrome-security',
      use: {
        ...devices['Desktop Chrome'],
        // Additional security headers
        extraHTTPHeaders: {
          'X-Test-Browser': 'chrome',
          'X-Security-Test': 'true'
        }
      },
    },

    // Firefox - Cross-browser security validation
    {
      name: 'firefox-security',
      use: {
        ...devices['Desktop Firefox'],
        extraHTTPHeaders: {
          'X-Test-Browser': 'firefox',
          'X-Security-Test': 'true'
        }
      },
    },

    // Mobile - Mobile security testing
    {
      name: 'mobile-security',
      use: {
        ...devices['iPhone 13'],
        extraHTTPHeaders: {
          'X-Test-Browser': 'mobile-safari',
          'X-Security-Test': 'true'
        }
      },
    },

    // Security-specific test configurations
    {
      name: 'auth-security',
      testMatch: '**/auth-security.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined, // No authentication state
      },
    },

    {
      name: 'authenticated-security',
      testMatch: '**/authenticated-security.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth/user.json', // Pre-authenticated state
      },
      dependencies: ['auth-security'], // Run after auth tests
    },

    {
      name: 'admin-security',
      testMatch: '**/admin-security.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth/admin.json', // Admin authenticated state
      },
      dependencies: ['auth-security'],
    }
  ],

  // Web server configuration
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      // Security test environment variables
      ENABLE_TEST_ROUTES: 'true',
      DISABLE_RATE_LIMITING: 'false', // Keep rate limiting for security tests
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
      JWT_SECRET: 'test-jwt-secret-for-security-testing-only',
    }
  },

  // Global test configuration
  expect: {
    // Strict assertions for security tests
    timeout: 10000,
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 }
  }
});