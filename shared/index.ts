/**
 * Shared Resources Index
 * 
 * Barrel export for all shared types, utilities, and constants
 * used across frontend and backend applications.
 */

// Types
export * from './types/waste';
export * from './types/api';
export * from './types/auth';
export * from './types/common';

// Utilities
export * from './utils/validation';
export * from './utils/formatting';
export * from './utils/calculations';

// Constants
export * from './constants/api';
export * from './constants/waste';
export * from './constants/ui';

// Schemas
export * from './schemas/waste.schema';
export * from './schemas/api.schema';

/**
 * Package Information
 */
export const SHARED_PACKAGE_INFO = {
  name: '@bf-tools/shared',
  version: '1.0.0',
  description: 'Shared types, utilities, and constants for BF-Tools platform',
} as const;

/**
 * Re-export commonly used types for convenience
 */
export type {
  // Core entities
  WasteData,
  Company,
  Sector,
  
  // API types
  ApiResponse,
  ApiRequest,
  PaginatedResponse,
  
  // Auth types
  User,
  AuthToken,
  UserRole,
  
  // Common types
  ID,
  Timestamp,
  Optional,
  Nullable,
} from './types';

/**
 * Re-export commonly used constants
 */
export {
  // Waste constants
  WASTE_TYPES,
  WASTE_UNITS,
  COMPANY_SIZES,
  SECTOR_CATEGORIES,
  
  // API constants
  HTTP_STATUS,
  API_ENDPOINTS,
  REQUEST_LIMITS,
  
  // UI constants
  CHART_COLORS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
} from './constants';

/**
 * Re-export commonly used utilities
 */
export {
  // Validation
  isValidEmail,
  isValidWasteQuantity,
  isValidDateRange,
  isWasteData,
  isCompany,
  
  // Formatting
  formatWasteQuantity,
  formatCurrency,
  formatPercentage,
  formatDate,
  
  // Calculations
  calculateRecyclingRate,
  calculateGHGEmissions,
  calculateComplianceScore,
  calculateWasteReduction,
} from './utils';

/**
 * Configuration objects for easy access
 */
export const SHARED_CONFIG = {
  validation: {
    enabled: true,
    strictMode: true,
    throwOnError: false,
  },
  formatting: {
    locale: 'en-US',
    currency: 'USD',
    timezone: 'UTC',
  },
  calculations: {
    precision: 2,
    roundingMode: 'round' as const,
  },
} as const;

/**
 * Type utility helpers
 */
export type ValueOf<T> = T[keyof T];
export type KeysOf<T> = keyof T;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Error types
 */
export class SharedValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'SharedValidationError';
    Object.setPrototypeOf(this, SharedValidationError.prototype);
  }
}

export class SharedCalculationError extends Error {
  constructor(
    message: string,
    public operation?: string,
    public inputs?: any[]
  ) {
    super(message);
    this.name = 'SharedCalculationError';
    Object.setPrototypeOf(this, SharedCalculationError.prototype);
  }
}

/**
 * Version compatibility check
 */
export const isCompatibleVersion = (requiredVersion: string): boolean => {
  const current = SHARED_PACKAGE_INFO.version;
  const required = requiredVersion;
  
  // Simple semver check - implement proper semver comparison if needed
  return current >= required;
};

/**
 * Environment detection utilities
 */
export const ENV_UTILS = {
  isBrowser: typeof window !== 'undefined',
  isNode: typeof process !== 'undefined' && process.versions?.node,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;