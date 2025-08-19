export interface WasteData {
  id: string;
  company_id: string;
  waste_type: string;
  quantity: number;
  unit: string;
  date: string;
  location: string;
  disposal_method: string;
  cost: number;
  created_at: string;
}

export interface WasteStream {
  id: string;
  company_id: string;
  waste_type: string;
  quantity: number;
  unit: string;
  date: string;
  location: string;
  disposal_method: string;
  cost: number;
  carbon_footprint?: number;
  recycling_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  sector?: string;
  country?: string;
  size: 'small' | 'medium' | 'large';
  location: string;
  created_at: string;
  description?: string;
  employee_count?: number;
  website?: string;
  contact_email?: string;
}

export interface CompanyWithMetrics extends Company {
  latest_year?: number;
  total_waste?: number;
  recovery_rate?: number;
}

export interface CompanyDetailed extends Company {
  metrics?: CompanyMetrics;
  waste_streams?: WasteStream[];
  recent_activity?: WasteStream[];
}

export interface CompanyMetrics {
  id: string;
  company_id: string;
  total_waste: number;
  waste_reduction_percentage: number;
  cost_savings: number;
  recycling_rate: number;
  carbon_footprint: number;
  waste_diversion_rate?: number;
  compliance_score?: number;
  sustainability_score?: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface WasteAnalytics {
  totalWaste: number;
  wasteReduction: number;
  costSavings: number;
  recyclingRate: number;
  carbonFootprint: number;
  wasteDiversionRate?: number;
  complianceScore?: number;
  sustainabilityScore?: number;
}

export interface DashboardMetrics {
  companies: Company[];
  wasteData: WasteData[];
  analytics: WasteAnalytics;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Parameters
export interface CompanyQueryParams {
  search?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large';
  location?: string;
  sortBy?: 'name' | 'created_at' | 'total_waste' | 'recycling_rate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface WasteStreamQueryParams {
  company_id?: string;
  waste_type?: string;
  date_from?: string;
  date_to?: string;
  disposal_method?: string;
  location?: string;
  sortBy?: 'date' | 'quantity' | 'cost';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface KPIData {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  color?: 'success' | 'warning' | 'danger' | 'info';
}

// Loading and Error States
export interface LoadingState {
  companies: boolean;
  companyDetail: boolean;
  metrics: boolean;
  wasteStreams: boolean;
  analytics: boolean;
}

export interface ErrorState {
  companies: string | null;
  companyDetail: string | null;
  metrics: string | null;
  wasteStreams: string | null;
  analytics: string | null;
}