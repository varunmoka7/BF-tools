/**
 * Frontend Application Index
 * 
 * Main entry point for the BF-Tools frontend application.
 * Exports all major components, hooks, and utilities.
 */

// Components
export * from './components/ui';
export * from './components/charts';
export * from './components/maps';
export * from './components/dashboard';

// Hooks
export * from './hooks';

// Utilities
export * from './lib/utils';

// Types (re-export from shared)
export type { WasteData, Company, Sector } from '../../shared/types/waste';

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
  Tabs: () => import('./components/ui/tabs'),
  Dialog: () => import('./components/ui/dialog'),
  Progress: () => import('./components/ui/progress'),
  Slider: () => import('./components/ui/slider'),
  Toast: () => import('./components/ui/toast'),
  
  // Chart Components
  ChartsSection: () => import('./components/charts/charts-section'),
  WasteTypeChart: () => import('./components/charts/waste-type-chart'),
  RegionDistributionChart: () => import('./components/charts/region-distribution-chart'),
  ComplianceTrendsChart: () => import('./components/charts/compliance-trends-chart'),
  RecyclingProgressChart: () => import('./components/charts/recycling-progress-chart'),
  
  // Map Components
  GlobalWasteMap: () => import('./components/maps/global-waste-map'),
  LeafletMap: () => import('./components/maps/leaflet-map'),
  
  // Dashboard Components
  DashboardHeader: () => import('./components/dashboard/dashboard-header'),
  KPICards: () => import('./components/dashboard/kpi-cards'),
  BlackForestDashboard: () => import('./components/BlackForestDashboard'),
  WasteDashboard: () => import('./components/WasteDashboard'),
} as const;