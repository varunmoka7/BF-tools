/**
 * Supabase connection and database utilities for Waste Intelligence Platform
 * Provides both direct PostgreSQL and Supabase client connections
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database types
export interface WasteCompany {
  id: string;
  company_name: string;
  country: string;
  sector: string;
  industry: string;
  employees?: number;
  year_of_disclosure: number;
  ticker?: string;
  exchange?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WasteStream {
  id: string;
  company_id: string;
  reporting_period: number;
  metric: string;
  hazardousness: string;
  treatment_method: string;
  value: number;
  unit: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyMetrics {
  id: string;
  company_id: string;
  reporting_period: number;
  total_waste_generated: number;
  total_waste_recovered: number;
  total_waste_disposed: number;
  recovery_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface Opportunity {
  id: string;
  company_id: string;
  opportunity_type: string;
  title: string;
  description?: string;
  potential_value: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'qualified' | 'in_progress' | 'completed' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

class SupabaseConnection {
  private static instance: SupabaseConnection;
  private supabaseClient: SupabaseClient | null = null;
  private pgPool: Pool | null = null;
  
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly supabaseServiceKey: string;
  private readonly databaseUrl: string;

  private constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.databaseUrl = process.env.DATABASE_URL || '';

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Missing required Supabase environment variables');
    }
  }

  public static getInstance(): SupabaseConnection {
    if (!SupabaseConnection.instance) {
      SupabaseConnection.instance = new SupabaseConnection();
    }
    return SupabaseConnection.instance;
  }

  /**
   * Get Supabase client for real-time and auth features
   */
  public getSupabaseClient(useServiceRole = false): SupabaseClient {
    if (!this.supabaseClient) {
      const key = useServiceRole ? this.supabaseServiceKey : this.supabaseAnonKey;
      this.supabaseClient = createClient(this.supabaseUrl, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    }
    return this.supabaseClient;
  }

  /**
   * Get PostgreSQL connection pool for direct SQL operations
   */
  public async getPostgresPool(): Promise<Pool> {
    if (!this.pgPool) {
      if (!this.databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      this.pgPool = new Pool({
        connectionString: this.databaseUrl,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test connection
      try {
        const client = await this.pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ PostgreSQL connection established');
      } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        throw error;
      }
    }
    return this.pgPool;
  }

  /**
   * Execute SQL query with parameters
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pool = await this.getPostgresPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute single SQL statement and return first row
   */
  public async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute SQL with transaction support
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = await this.getPostgresPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Initialize database schema
   */
  public async initializeSchema(): Promise<void> {
    try {
      // Read and execute schema file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const schemaPath = path.join(process.cwd(), 'src/database/supabase-schema.sql');
      const schemaSQL = await fs.readFile(schemaPath, 'utf-8');
      
      await this.query(schemaSQL);
      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
      throw error;
    }
  }

  /**
   * Company-related operations
   */
  public async getCompanies(filters?: {
    country?: string;
    sector?: string;
    limit?: number;
    offset?: number;
  }): Promise<WasteCompany[]> {
    let sql = `
      SELECT id, company_name, country, sector, industry, employees, 
             year_of_disclosure, ticker, exchange, created_at, updated_at
      FROM companies
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.country) {
      sql += ` AND country = $${++paramCount}`;
      params.push(filters.country);
    }

    if (filters?.sector) {
      sql += ` AND sector = $${++paramCount}`;
      params.push(filters.sector);
    }

    sql += ` ORDER BY company_name`;

    if (filters?.limit) {
      sql += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${++paramCount}`;
      params.push(filters.offset);
    }

    return this.query<WasteCompany>(sql, params);
  }

  /**
   * Get company metrics with aggregations
   */
  public async getCompanyMetrics(companyId?: string): Promise<CompanyMetrics[]> {
    const sql = companyId 
      ? `SELECT * FROM company_metrics WHERE company_id = $1 ORDER BY reporting_period DESC`
      : `SELECT * FROM company_metrics ORDER BY reporting_period DESC, total_waste_generated DESC`;
    
    const params = companyId ? [companyId] : [];
    return this.query<CompanyMetrics>(sql, params);
  }

  /**
   * Get dashboard summary data
   */
  public async getDashboardSummary(): Promise<any> {
    return this.queryOne(`SELECT * FROM dashboard_summary`);
  }

  /**
   * Search companies by name
   */
  public async searchCompanies(searchTerm: string, limit = 10): Promise<WasteCompany[]> {
    const sql = `
      SELECT id, company_name, country, sector, industry, employees, 
             year_of_disclosure, ticker, exchange
      FROM companies
      WHERE company_name ILIKE $1
      ORDER BY company_name
      LIMIT $2
    `;
    return this.query<WasteCompany>(sql, [`%${searchTerm}%`, limit]);
  }

  /**
   * Get sector leaderboard
   */
  public async getSectorLeaderboard(): Promise<any[]> {
    return this.query(`SELECT * FROM sector_leaderboard LIMIT 20`);
  }

  /**
   * Get country leaderboard
   */
  public async getCountryLeaderboard(): Promise<any[]> {
    return this.query(`SELECT * FROM country_leaderboard LIMIT 20`);
  }

  /**
   * Get top opportunities
   */
  public async getTopOpportunities(limit = 50): Promise<any[]> {
    return this.query(`SELECT * FROM top_opportunities LIMIT $1`, [limit]);
  }

  /**
   * Refresh materialized views for performance
   */
  public async refreshMaterializedViews(): Promise<void> {
    await this.query(`SELECT refresh_dashboard_summary()`);
    console.log('✅ Materialized views refreshed');
  }

  /**
   * Import CSV data
   */
  public async importCompanyFromCSV(data: any): Promise<string> {
    const sql = `
      INSERT INTO companies (
        id, isin, lei, figi, ticker, mic_code, exchange, perm_id,
        company_name, country, sector, industry, employees, year_of_disclosure,
        document_id, document_urls, source_names, source_urls
      ) VALUES (
        COALESCE($1, uuid_generate_v4()), $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        country = EXCLUDED.country,
        sector = EXCLUDED.sector,
        industry = EXCLUDED.industry,
        updated_at = NOW()
      RETURNING id
    `;

    const result = await this.queryOne<{ id: string }>(sql, [
      data.company_id || null,
      data.isin || null,
      data.lei || null, 
      data.figi || null,
      data.ticker || null,
      data.mic_code || null,
      data.exchange || null,
      data.permid || null,
      data.company_name,
      data.country,
      data.sector,
      data.industry,
      data.employees ? parseInt(data.employees) : null,
      parseInt(data.year_of_disclosure),
      data.document_id || null,
      data.document_urls ? JSON.parse(data.document_urls) : [],
      data.source_names ? JSON.parse(data.source_names) : [],
      data.source_urls ? JSON.parse(data.source_urls) : []
    ]);

    return result?.id || '';
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = null;
      console.log('✅ PostgreSQL pool closed');
    }
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{ postgres: boolean; supabase: boolean }> {
    const result = { postgres: false, supabase: false };

    try {
      await this.query('SELECT 1');
      result.postgres = true;
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
    }

    try {
      const { data, error } = await this.getSupabaseClient()
        .from('companies')
        .select('count')
        .limit(1);
      result.supabase = !error;
    } catch (error) {
      console.error('Supabase health check failed:', error);
    }

    return result;
  }
}

export default SupabaseConnection;