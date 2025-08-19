import { supabase } from '@/lib/supabase';
import { 
  WasteData, 
  Company, 
  CompanyDetailed,
  CompanyMetrics,
  WasteStream,
  WasteAnalytics, 
  DashboardMetrics,
  ApiResponse,
  PaginatedResponse,
  CompanyQueryParams,
  WasteStreamQueryParams,
  ChartData,
  KPIData
} from '@/types/waste';

export class WasteService {
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly MAX_PAGE_SIZE = 100;

  /**
   * Enhanced getAllCompanies with search, sort, and pagination
   */
  static async getAllCompanies(params: CompanyQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Company>>> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, returning empty data');
        return {
          success: false,
          error: 'Database not configured',
          data: {
            data: [],
            count: 0,
            total: 0,
            page: params.page || 1,
            limit: params.limit || this.DEFAULT_PAGE_SIZE,
            totalPages: 0
          }
        };
      }

      const {
        search,
        industry,
        size,
        location,
        sortBy = 'created_at',
        sortOrder = 'desc',
        page = 1,
        limit = this.DEFAULT_PAGE_SIZE
      } = params;

      // Ensure limit doesn't exceed maximum
      const pageSize = Math.min(limit, this.MAX_PAGE_SIZE);
      const offset = (page - 1) * pageSize;

      // Build base query with joins for metrics
      let query = supabase
        .from('companies')
        .select(`
          *,
          metrics:company_metrics(
            total_waste,
            recycling_rate,
            carbon_footprint,
            period_start,
            period_end
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (industry) {
        query = query.eq('industry', industry);
      }
      
      if (size) {
        query = query.eq('size', size);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Apply sorting
      const ascending = sortOrder === 'asc';
      if (sortBy === 'total_waste' || sortBy === 'recycling_rate') {
        // Sort by metrics - this requires a more complex query
        query = query.order('created_at', { ascending });
      } else {
        query = query.order(sortBy, { ascending });
      }

      // Apply pagination
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching companies:', error);
        return {
          success: false,
          error: error.message,
          data: {
            data: [],
            count: 0,
            total: 0,
            page,
            limit: pageSize,
            totalPages: 0
          }
        };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          data: data || [],
          count: data?.length || 0,
          total,
          page,
          limit: pageSize,
          totalPages
        }
      };

    } catch (error) {
      console.error('Unexpected error fetching companies:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: {
          data: [],
          count: 0,
          total: 0,
          page: params.page || 1,
          limit: params.limit || this.DEFAULT_PAGE_SIZE,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Get company by ID with detailed metrics and recent activity
   */
  static async getCompanyById(id: string): Promise<ApiResponse<CompanyDetailed | null>> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        return {
          success: false,
          error: 'Database not configured',
          data: null
        };
      }

      // Fetch company with metrics and recent waste streams
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select(`
          *,
          metrics:company_metrics(*),
          waste_streams:waste_streams(*)
        `)
        .eq('id', id)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Company not found',
            data: null
          };
        }
        console.error('Error fetching company:', companyError);
        return {
          success: false,
          error: companyError.message,
          data: null
        };
      }

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity, error: activityError } = await supabase
        .from('waste_streams')
        .select('*')
        .eq('company_id', id)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: false })
        .limit(10);

      if (activityError) {
        console.warn('Error fetching recent activity:', activityError);
      }

      const result: CompanyDetailed = {
        ...company,
        recent_activity: recentActivity || []
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Unexpected error fetching company:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null
      };
    }
  }

  /**
   * Get company metrics with fallback logic
   */
  static async getCompanyMetrics(companyId: string, periodStart?: string, periodEnd?: string): Promise<ApiResponse<CompanyMetrics>> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        return {
          success: false,
          error: 'Database not configured',
          data: this.getDefaultMetrics(companyId)
        };
      }

      // First, try to get metrics from company_metrics table
      let metricsQuery = supabase
        .from('company_metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('period_end', { ascending: false });

      if (periodStart && periodEnd) {
        metricsQuery = metricsQuery
          .gte('period_start', periodStart)
          .lte('period_end', periodEnd);
      }

      const { data: existingMetrics, error: metricsError } = await metricsQuery.limit(1).single();

      // If metrics exist and are recent (within last 7 days), return them
      if (existingMetrics && !metricsError) {
        const lastUpdate = new Date(existingMetrics.updated_at);
        const now = new Date();
        const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7) {
          return {
            success: true,
            data: existingMetrics
          };
        }
      }

      // Fallback: Calculate metrics from waste_streams
      const calculatedMetrics = await this.calculateMetricsFromWasteStreams(companyId, periodStart, periodEnd);
      
      if (calculatedMetrics.success && calculatedMetrics.data) {
        // Try to upsert the calculated metrics back to the database
        try {
          await supabase
            .from('company_metrics')
            .upsert(calculatedMetrics.data, { onConflict: 'company_id,period_start,period_end' });
        } catch (upsertError) {
          console.warn('Failed to cache calculated metrics:', upsertError);
        }
      }

      return calculatedMetrics;

    } catch (error) {
      console.error('Unexpected error fetching company metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: this.getDefaultMetrics(companyId)
      };
    }
  }

  /**
   * Calculate metrics from waste_streams table
   */
  private static async calculateMetricsFromWasteStreams(
    companyId: string, 
    periodStart?: string, 
    periodEnd?: string
  ): Promise<ApiResponse<CompanyMetrics>> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Database not configured',
          data: this.getDefaultMetrics(companyId)
        };
      }

      const now = new Date();
      const defaultPeriodStart = periodStart || new Date(now.getFullYear(), 0, 1).toISOString();
      const defaultPeriodEnd = periodEnd || now.toISOString();

      let query = supabase
        .from('waste_streams')
        .select('*')
        .eq('company_id', companyId);

      if (periodStart && periodEnd) {
        query = query
          .gte('date', periodStart)
          .lte('date', periodEnd);
      }

      const { data: wasteStreams, error } = await query;

      if (error) {
        console.error('Error fetching waste streams for calculation:', error);
        return {
          success: false,
          error: error.message,
          data: this.getDefaultMetrics(companyId)
        };
      }

      if (!wasteStreams || wasteStreams.length === 0) {
        return {
          success: true,
          data: this.getDefaultMetrics(companyId, defaultPeriodStart, defaultPeriodEnd)
        };
      }

      // Calculate metrics
      const totalWaste = wasteStreams.reduce((sum, stream) => sum + (stream.quantity || 0), 0);
      const totalCost = wasteStreams.reduce((sum, stream) => sum + (stream.cost || 0), 0);
      const totalCarbonFootprint = wasteStreams.reduce((sum, stream) => sum + (stream.carbon_footprint || 0), 0);

      // Calculate recycling rate
      const recycledStreams = wasteStreams.filter(stream => 
        stream.disposal_method && 
        stream.disposal_method.toLowerCase().includes('recycle')
      );
      const recyclingRate = wasteStreams.length > 0 ? (recycledStreams.length / wasteStreams.length) * 100 : 0;

      // Calculate waste diversion rate (recycled + composted + reused)
      const divertedStreams = wasteStreams.filter(stream => {
        const method = stream.disposal_method?.toLowerCase() || '';
        return method.includes('recycle') || method.includes('compost') || method.includes('reuse');
      });
      const wasteDiversionRate = wasteStreams.length > 0 ? (divertedStreams.length / wasteStreams.length) * 100 : 0;

      // Mock calculations for complex metrics
      const previousPeriodWaste = totalWaste * 1.1; // Assume 10% increase from previous period
      const wasteReductionPercentage = totalWaste > 0 ? ((previousPeriodWaste - totalWaste) / previousPeriodWaste) * 100 : 0;
      const costSavings = totalCost * 0.15; // Assume 15% savings through optimization

      const calculatedMetrics: CompanyMetrics = {
        id: crypto.randomUUID(),
        company_id: companyId,
        total_waste: totalWaste,
        waste_reduction_percentage: wasteReductionPercentage,
        cost_savings: costSavings,
        recycling_rate: recyclingRate,
        carbon_footprint: totalCarbonFootprint || totalWaste * 0.3, // Default carbon factor
        waste_diversion_rate: wasteDiversionRate,
        compliance_score: Math.min(95, 70 + (recyclingRate * 0.3)), // Mock calculation
        sustainability_score: Math.min(100, 60 + (recyclingRate * 0.4)), // Mock calculation
        period_start: defaultPeriodStart,
        period_end: defaultPeriodEnd,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      return {
        success: true,
        data: calculatedMetrics
      };

    } catch (error) {
      console.error('Error calculating metrics from waste streams:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: this.getDefaultMetrics(companyId)
      };
    }
  }

  /**
   * Get waste streams with advanced filtering and pagination
   */
  static async getWasteStreams(params: WasteStreamQueryParams = {}): Promise<ApiResponse<PaginatedResponse<WasteStream>>> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        return {
          success: false,
          error: 'Database not configured',
          data: {
            data: [],
            count: 0,
            total: 0,
            page: params.page || 1,
            limit: params.limit || this.DEFAULT_PAGE_SIZE,
            totalPages: 0
          }
        };
      }

      const {
        company_id,
        waste_type,
        date_from,
        date_to,
        disposal_method,
        location,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        limit = this.DEFAULT_PAGE_SIZE
      } = params;

      const pageSize = Math.min(limit, this.MAX_PAGE_SIZE);
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from('waste_streams')
        .select('*', { count: 'exact' });

      // Apply filters
      if (company_id) query = query.eq('company_id', company_id);
      if (waste_type) query = query.ilike('waste_type', `%${waste_type}%`);
      if (date_from) query = query.gte('date', date_from);
      if (date_to) query = query.lte('date', date_to);
      if (disposal_method) query = query.ilike('disposal_method', `%${disposal_method}%`);
      if (location) query = query.ilike('location', `%${location}%`);

      // Apply sorting and pagination
      const ascending = sortOrder === 'asc';
      query = query
        .order(sortBy, { ascending })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching waste streams:', error);
        return {
          success: false,
          error: error.message,
          data: {
            data: [],
            count: 0,
            total: 0,
            page,
            limit: pageSize,
            totalPages: 0
          }
        };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          data: data || [],
          count: data?.length || 0,
          total,
          page,
          limit: pageSize,
          totalPages
        }
      };

    } catch (error) {
      console.error('Unexpected error fetching waste streams:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: {
          data: [],
          count: 0,
          total: 0,
          page: params.page || 1,
          limit: params.limit || this.DEFAULT_PAGE_SIZE,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Get analytics with enhanced calculations
   */
  static async getAnalytics(companyId?: string): Promise<ApiResponse<WasteAnalytics>> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        return {
          success: false,
          error: 'Database not configured',
          data: this.getDefaultAnalytics()
        };
      }

      if (companyId) {
        // Get analytics for specific company
        const metricsResponse = await this.getCompanyMetrics(companyId);
        if (metricsResponse.success && metricsResponse.data) {
          const metrics = metricsResponse.data;
          return {
            success: true,
            data: {
              totalWaste: metrics.total_waste,
              wasteReduction: metrics.waste_reduction_percentage,
              costSavings: metrics.cost_savings,
              recyclingRate: metrics.recycling_rate,
              carbonFootprint: metrics.carbon_footprint,
              wasteDiversionRate: metrics.waste_diversion_rate,
              complianceScore: metrics.compliance_score,
              sustainabilityScore: metrics.sustainability_score
            }
          };
        }
      }

      // Get aggregated analytics across all companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          company_metrics(*)
        `);

      if (companiesError) {
        console.error('Error fetching companies for analytics:', companiesError);
        return {
          success: false,
          error: companiesError.message,
          data: this.getDefaultAnalytics()
        };
      }

      // Aggregate metrics
      const allMetrics = companies
        ?.flatMap(company => company.company_metrics || [])
        .filter(Boolean) || [];

      if (allMetrics.length === 0) {
        return {
          success: true,
          data: this.getDefaultAnalytics()
        };
      }

      const totalWaste = allMetrics.reduce((sum, m) => sum + (m.total_waste || 0), 0);
      const avgWasteReduction = allMetrics.reduce((sum, m) => sum + (m.waste_reduction_percentage || 0), 0) / allMetrics.length;
      const totalCostSavings = allMetrics.reduce((sum, m) => sum + (m.cost_savings || 0), 0);
      const avgRecyclingRate = allMetrics.reduce((sum, m) => sum + (m.recycling_rate || 0), 0) / allMetrics.length;
      const totalCarbonFootprint = allMetrics.reduce((sum, m) => sum + (m.carbon_footprint || 0), 0);
      const avgWasteDiversionRate = allMetrics.reduce((sum, m) => sum + (m.waste_diversion_rate || 0), 0) / allMetrics.length;
      const avgComplianceScore = allMetrics.reduce((sum, m) => sum + (m.compliance_score || 0), 0) / allMetrics.length;
      const avgSustainabilityScore = allMetrics.reduce((sum, m) => sum + (m.sustainability_score || 0), 0) / allMetrics.length;

      return {
        success: true,
        data: {
          totalWaste,
          wasteReduction: avgWasteReduction,
          costSavings: totalCostSavings,
          recyclingRate: avgRecyclingRate,
          carbonFootprint: totalCarbonFootprint,
          wasteDiversionRate: avgWasteDiversionRate,
          complianceScore: avgComplianceScore,
          sustainabilityScore: avgSustainabilityScore
        }
      };

    } catch (error) {
      console.error('Unexpected error calculating analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: this.getDefaultAnalytics()
      };
    }
  }

  /**
   * Get dashboard data with all components
   */
  static async getDashboardData(companyId?: string): Promise<ApiResponse<DashboardMetrics>> {
    try {
      const [companiesResponse, wasteDataResponse, analyticsResponse] = await Promise.all([
        this.getAllCompanies({ limit: 10 }),
        this.getWasteStreams({ company_id: companyId, limit: 50 }),
        this.getAnalytics(companyId)
      ]);

      return {
        success: true,
        data: {
          companies: companiesResponse.data?.data || [],
          wasteData: wasteDataResponse.data?.data || [],
          analytics: analyticsResponse.data || this.getDefaultAnalytics()
        }
      };

    } catch (error) {
      console.error('Unexpected error fetching dashboard data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: {
          companies: [],
          wasteData: [],
          analytics: this.getDefaultAnalytics()
        }
      };
    }
  }

  /**
   * Data transformation utilities for charts
   */
  static transformToChartData(data: WasteStream[], groupBy: 'waste_type' | 'date' | 'disposal_method'): ChartData {
    const grouped = data.reduce((acc, item) => {
      let key: string;
      
      switch (groupBy) {
        case 'waste_type':
          key = item.waste_type || 'Unknown';
          break;
        case 'date':
          key = new Date(item.date).toLocaleDateString();
          break;
        case 'disposal_method':
          key = item.disposal_method || 'Unknown';
          break;
        default:
          key = 'Unknown';
      }

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.quantity || 0;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(grouped).sort();
    const values = labels.map(label => grouped[label]);

    return {
      labels,
      datasets: [{
        label: 'Waste Quantity',
        data: values,
        backgroundColor: this.generateColors(labels.length),
        borderColor: this.generateColors(labels.length, 0.8),
        borderWidth: 1
      }]
    };
  }

  /**
   * Transform data to KPI format
   */
  static transformToKPIs(analytics: WasteAnalytics): KPIData[] {
    return [
      {
        title: 'Total Waste',
        value: analytics.totalWaste.toLocaleString(),
        unit: 'tons',
        change: analytics.wasteReduction,
        changeType: analytics.wasteReduction > 0 ? 'decrease' : 'increase',
        trend: analytics.wasteReduction > 0 ? 'down' : 'up',
        color: analytics.wasteReduction > 0 ? 'success' : 'warning'
      },
      {
        title: 'Recycling Rate',
        value: `${analytics.recyclingRate.toFixed(1)}%`,
        target: 85,
        change: 2.5,
        changeType: 'increase',
        trend: 'up',
        color: analytics.recyclingRate >= 50 ? 'success' : 'warning'
      },
      {
        title: 'Cost Savings',
        value: `$${analytics.costSavings.toLocaleString()}`,
        change: 15.2,
        changeType: 'increase',
        trend: 'up',
        color: 'success'
      },
      {
        title: 'Carbon Footprint',
        value: analytics.carbonFootprint.toLocaleString(),
        unit: 'CO2e tons',
        change: -8.3,
        changeType: 'decrease',
        trend: 'down',
        color: 'success'
      }
    ];
  }

  // Private utility methods
  private static getDefaultMetrics(
    companyId: string = '', 
    periodStart?: string, 
    periodEnd?: string
  ): CompanyMetrics {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      company_id: companyId,
      total_waste: 0,
      waste_reduction_percentage: 0,
      cost_savings: 0,
      recycling_rate: 0,
      carbon_footprint: 0,
      waste_diversion_rate: 0,
      compliance_score: 0,
      sustainability_score: 0,
      period_start: periodStart || new Date(now.getFullYear(), 0, 1).toISOString(),
      period_end: periodEnd || now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
  }

  private static getDefaultAnalytics(): WasteAnalytics {
    return {
      totalWaste: 0,
      wasteReduction: 0,
      costSavings: 0,
      recyclingRate: 0,
      carbonFootprint: 0,
      wasteDiversionRate: 0,
      complianceScore: 0,
      sustainabilityScore: 0
    };
  }

  private static generateColors(count: number, alpha: number = 0.6): string[] {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
      `rgba(199, 199, 199, ${alpha})`,
      `rgba(83, 102, 255, ${alpha})`,
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }
}