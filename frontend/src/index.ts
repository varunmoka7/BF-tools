/**
 * Frontend Application Index
 * 
 * Main entry point for the BF-Tools frontend application.
 * Exports all major components, hooks, and utilities.
 */

// Main Components
export { BlackForestDashboard } from './components/BlackForestDashboard';
export { CompanyDetailPage } from './components/CompanyDetailPage';
export { default as TopWasteCompanies } from './components/TopWasteCompanies';

// UI Components (export individual components that exist)
export { Button } from './components/ui/button';
export { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
export { Badge } from './components/ui/badge';
export { Input } from './components/ui/input';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

// Utilities
export * from './lib/utils';

// Types
export type * from './types/waste';

/**
 * Application Configuration
 */
export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  mapApiKey?: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
}

/**
 * Default Application Configuration
 */
export const defaultAppConfig: Partial<AppConfig> = {
  environment: 'development',
  enableAnalytics: false,
  enableErrorTracking: false,
};

/**
 * Environment Variables Helper
 */
export const getEnvConfig = (): AppConfig => ({
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  mapApiKey: import.meta.env.VITE_MAP_API_KEY,
  environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
});

/**
 * Application Routes
 */
export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/analytics',
  COMPANIES: '/companies',
  MAP: '/map',
  RECYCLING: '/recycling',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USERS: '/users',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  WASTE_DATA: '/api/waste-data',
  COMPANIES: '/api/companies',
  DASHBOARD: '/api/dashboard',
  UPLOAD_CSV: '/api/upload/csv',
  ANALYTICS: '/api/analytics',
} as const;

/**
 * Chart Types
 */
export const CHART_TYPES = {
  WASTE_TYPE: 'wasteType',
  REGION_DISTRIBUTION: 'regionDistribution',
  COMPLIANCE_TRENDS: 'complianceTrends',
  RECYCLING_PROGRESS: 'recyclingProgress',
} as const;

export type ChartType = typeof CHART_TYPES[keyof typeof CHART_TYPES];

/**
 * Theme Configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontFamily: string;
}

export const defaultTheme: ThemeConfig = {
  mode: 'system',
  primaryColor: '#10B981', // Emerald
  fontFamily: 'Inter, system-ui, sans-serif',
};

/**
 * Component Export Map
 */
export const COMPONENTS = {
  // UI Components
  Button: () => import('./components/ui/button'),
  Card: () => import('./components/ui/card'),
  Input: () => import('./components/ui/input'),
  Select: () => import('./components/ui/select'),
  Badge: () => import('./components/ui/badge'),
  
  // Main Dashboard Components
  BlackForestDashboard: () => import('./components/BlackForestDashboard'),
  CompanyDetailPage: () => import('./components/CompanyDetailPage'),
  TopWasteCompanies: () => import('./components/TopWasteCompanies'),
} as const;