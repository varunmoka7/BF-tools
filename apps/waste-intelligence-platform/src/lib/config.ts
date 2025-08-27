// Production configuration and environment management
export const config = {
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
  },
  
  // Performance Configuration
  performance: {
    cacheTTL: parseInt(process.env.CACHE_TTL || '300000'), // 5 minutes
    maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE || '100'),
    enableServiceWorker: process.env.ENABLE_SERVICE_WORKER === 'true',
  },
  
  // Security Configuration
  security: {
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '100'),
    enableCSP: process.env.ENABLE_CSP !== 'false',
  },
  
  // Monitoring Configuration
  monitoring: {
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING === 'true',
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  },
  
  // Feature Flags
  features: {
    enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
    enableExportFeatures: process.env.ENABLE_EXPORT_FEATURES !== 'false',
  }
};

// Environment validation
export function validateEnvironment() {
  const requiredEnvVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_API_URL'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

// Get configuration for specific environment
export function getEnvironmentConfig() {
  if (config.isProduction) {
    return {
      ...config,
      api: {
        ...config.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://your-production-domain.com',
      },
      performance: {
        ...config.performance,
        cacheTTL: 600000, // 10 minutes in production
        maxCacheSize: 500, // Larger cache in production
      },
      security: {
        ...config.security,
        enableRateLimiting: true,
        maxRequestsPerMinute: 50, // Stricter in production
      },
      monitoring: {
        ...config.monitoring,
        enableErrorTracking: true,
        enablePerformanceMonitoring: true,
        enableAnalytics: true,
      }
    };
  }
  
  return config;
}
