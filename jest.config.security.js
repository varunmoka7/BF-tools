/**
 * Jest Configuration for Security Testing
 * Comprehensive testing setup for authentication and security features
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/security/**/*.test.{js,ts}',
    '**/tests/auth/**/*.test.{js,ts}',
    '**/backend/src/**/*.security.test.{js,ts}',
    '**/backend/src/**/*.auth.test.{js,ts}'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/security-setup.js'
  ],

  // Module paths
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'backend/src'],

  // File transformations
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage/security',
  collectCoverageFrom: [
    'backend/src/middleware/auth-middleware.ts',
    'backend/src/middleware/security-middleware.ts',
    'backend/src/services/auth-service.ts',
    'backend/src/database/supabase-connection.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './backend/src/middleware/auth-middleware.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './backend/src/services/auth-service.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Test timeout
  testTimeout: 30000,

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          module: 'commonjs',
          target: 'es2020',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }
    }
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Detect open handles
  detectOpenHandles: true,
  detectLeaks: true,

  // Test reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'security-test-results.xml',
        suiteName: 'Security Tests'
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results',
        filename: 'security-test-report.html',
        pageTitle: 'Security Test Report'
      }
    ]
  ],

  // Environment variables for testing
  setupFiles: ['<rootDir>/tests/setup/env.js']
};