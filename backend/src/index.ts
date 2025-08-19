/**
 * Backend Application Index
 * 
 * Main entry point for the BF-Tools backend API.
 * Exports all services, middleware, and utilities.
 */

// API Layer
export * from './api/routes';
export * from './api/middleware';

// Services
export * from './services/analytics';
export * from './services/company';
export * from './services/dataImport';

// Database
export * from './database/connection';
export * from './database/schema';

// Types (re-export from shared)
export type { WasteData, Company, Sector } from '../../shared/types/waste';

// Utilities
export * from './utils';

/**
 * Application Configuration Interface
 */
export interface BackendConfig {
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  databaseUrl: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  jwtSecret: string;
  apiKey: string;
  corsOrigin: string | string[];
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableSwagger: boolean;
  enableMetrics: boolean;
}

/**
 * Default Backend Configuration
 */
export const defaultBackendConfig: Partial<BackendConfig> = {
  port: 3001,
  nodeEnv: 'development',
  corsOrigin: '*',
  logLevel: 'info',
  enableSwagger: true,
  enableMetrics: false,
};

/**
 * Environment Configuration Helper
 */
export const getBackendConfig = (): BackendConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  apiKey: process.env.API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || '*',
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
});

/**
 * API Routes Configuration
 */
export const API_ROUTES = {
  // Base paths
  BASE: '/api',
  V1: '/api/v1',
  
  // Resource endpoints
  WASTE_DATA: '/api/waste-data',
  COMPANIES: '/api/companies',
  ANALYTICS: '/api/analytics',
  DASHBOARD: '/api/dashboard',
  UPLOAD: '/api/upload',
  EXPORT: '/api/export',
  IMPORT: '/api/import',
  
  // Auth endpoints
  AUTH: '/api/auth',
  USERS: '/api/users',
  
  // System endpoints
  HEALTH: '/api/health',
  METRICS: '/api/metrics',
  DOCS: '/api/docs',
} as const;

/**
 * Database Table Names
 */
export const DB_TABLES = {
  WASTE_DATA: 'waste_data',
  COMPANIES: 'companies',
  SECTORS: 'sectors',
  REGIONS: 'regions',
  COMPLIANCE: 'compliance',
  USERS: 'users',
  UPLOADS: 'uploads',
  AUDIT_LOG: 'audit_log',
} as const;

/**
 * Service Names
 */
export const SERVICES = {
  ANALYTICS: 'analytics',
  COMPANY: 'company',
  DATA_IMPORT: 'dataImport',
  AUTH: 'auth',
  NOTIFICATION: 'notification',
  CACHE: 'cache',
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  
  // Server errors (5xx)
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
} as const;

/**
 * HTTP Status Messages
 */
export const STATUS_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'Bad Request',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized',
  [ERROR_CODES.FORBIDDEN]: 'Forbidden',
  [ERROR_CODES.NOT_FOUND]: 'Not Found',
  [ERROR_CODES.CONFLICT]: 'Conflict',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation Error',
  [ERROR_CODES.RATE_LIMITED]: 'Too Many Requests',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal Server Error',
  [ERROR_CODES.NOT_IMPLEMENTED]: 'Not Implemented',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [ERROR_CODES.TIMEOUT]: 'Gateway Timeout',
} as const;

/**
 * Validation Schemas
 */
export const VALIDATION_SCHEMAS = {
  WASTE_DATA: 'wasteDataSchema',
  COMPANY: 'companySchema',
  USER: 'userSchema',
  UPLOAD: 'uploadSchema',
  ANALYTICS_QUERY: 'analyticsQuerySchema',
} as const;

/**
 * Cache Keys
 */
export const CACHE_KEYS = {
  COMPANIES: 'companies',
  WASTE_DATA: 'waste_data',
  ANALYTICS: 'analytics',
  DASHBOARD: 'dashboard',
  USER_SESSION: 'user_session',
} as const;

/**
 * Event Types
 */
export const EVENT_TYPES = {
  // Data events
  WASTE_DATA_CREATED: 'waste_data.created',
  WASTE_DATA_UPDATED: 'waste_data.updated',
  WASTE_DATA_DELETED: 'waste_data.deleted',
  
  // Company events
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  
  // Import events
  IMPORT_STARTED: 'import.started',
  IMPORT_COMPLETED: 'import.completed',
  IMPORT_FAILED: 'import.failed',
  
  // System events
  SERVER_STARTED: 'server.started',
  DATABASE_CONNECTED: 'database.connected',
  HEALTH_CHECK: 'health.check',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * Middleware Names
 */
export const MIDDLEWARE = {
  AUTH: 'auth',
  VALIDATION: 'validation',
  ERROR_HANDLER: 'errorHandler',
  RATE_LIMITER: 'rateLimiter',
  CORS: 'cors',
  HELMET: 'helmet',
  COMPRESSION: 'compression',
  MORGAN: 'morgan',
} as const;

/**
 * Common Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Service Health Status
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  uptime: number;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    supabase: 'connected' | 'disconnected';
    cache?: 'connected' | 'disconnected';
  };
}

/**
 * Application Metrics
 */
export interface ApplicationMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    queries: number;
    averageQueryTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}