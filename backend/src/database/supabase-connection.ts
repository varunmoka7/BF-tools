/**
 * Supabase connection and database utilities for Waste Intelligence Platform
 * Provides both direct PostgreSQL and Supabase client connections
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';
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

// Authentication types
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'analyst' | 'viewer';
  phone?: string;
  job_title?: string;
  department?: string;
  timezone?: string;
  language?: string;
  is_active: boolean;
  last_login_at?: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  login_count: number;
  failed_login_attempts: number;
  locked_until?: string;
  password_changed_at?: string;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCompanyAccess {
  id: string;
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    export: boolean;
    manage_users: boolean;
    view_financials: boolean;
    view_opportunities: boolean;
    manage_opportunities: boolean;
  };
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  access_reason?: string;
  last_accessed_at?: string;
  access_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: any;
  location_info?: any;
  is_active: boolean;
  login_method: 'email' | 'google' | 'github' | 'microsoft' | 'sso';
  login_at: string;
  last_activity_at: string;
  expires_at: string;
  logout_at?: string;
  logout_reason?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  table_name?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  execution_time_ms?: number;
  metadata?: any;
  timestamp: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  invited_by: string;
  company_id?: string;
  role: string;
  permissions: any;
  invitation_token: string;
  message?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  revoked_at?: string;
  revoked_by?: string;
  reminder_sent_at?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContext {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  companyAccess: UserCompanyAccess[];
}

class SupabaseConnection {
  private static instance: SupabaseConnection;
  private supabaseClient: SupabaseClient | null = null;
  private pgPool: Pool | null = null;
  private currentAuthContext: AuthContext | null = null;

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

  // ===============================================
  // AUTHENTICATION METHODS
  // ===============================================

  /**
   * Initialize authentication migrations
   */
  public async initializeAuthSchema(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Execute auth migration
      const authMigrationPath = path.join(process.cwd(), 'src/database/auth-migration.sql');
      const authMigrationSQL = await fs.readFile(authMigrationPath, 'utf-8');
      await this.query(authMigrationSQL);

      // Execute RLS policies
      const rlsPoliciesPath = path.join(process.cwd(), 'src/database/auth-rls-policies.sql');
      const rlsPoliciesSQL = await fs.readFile(rlsPoliciesPath, 'utf-8');
      await this.query(rlsPoliciesSQL);

      console.log('✅ Authentication schema initialized successfully');
    } catch (error) {
      console.error('❌ Authentication schema initialization failed:', error);
      throw error;
    }
  }

  /**
   * Set auth context for RLS
   */
  public async setAuthContext(userId: string, sessionId?: string): Promise<void> {
    await this.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);
    if (sessionId) {
      await this.query(`SELECT set_config('app.current_session_id', $1, true)`, [sessionId]);
    }
  }

  /**
   * Clear auth context
   */
  public async clearAuthContext(): Promise<void> {
    await this.query(`SELECT set_config('app.current_user_id', '', true)`);
    await this.query(`SELECT set_config('app.current_session_id', '', true)`);
    this.currentAuthContext = null;
  }

  /**
   * Sign up new user
   */
  public async signUp(email: string, password: string, userData?: Partial<UserProfile>): Promise<{ user: User | null; error: any }> {
    const { data, error } = await this.getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });

    if (data.user && !error) {
      // Update user profile with additional data
      if (userData) {
        await this.updateUserProfile(data.user.id, userData);
      }
    }

    return { user: data.user, error };
  }

  /**
   * Sign in user
   */
  public async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> {
    const { data, error } = await this.getSupabaseClient().auth.signInWithPassword({
      email,
      password
    });

    if (data.user && data.session && !error) {
      // Create user session record
      await this.createUserSession(data.user.id, data.session);

      // Load auth context
      await this.loadAuthContext(data.user, data.session);
    }

    return { user: data.user, session: data.session, error };
  }

  /**
   * Sign out user
   */
  public async signOut(): Promise<{ error: any }> {
    if (this.currentAuthContext?.session) {
      // Mark session as inactive
      await this.endUserSession(this.currentAuthContext.session.access_token);
    }

    const { error } = await this.getSupabaseClient().auth.signOut();
    await this.clearAuthContext();

    return { error };
  }

  /**
   * Get current user
   */
  public async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.getSupabaseClient().auth.getUser();
    return user;
  }

  /**
   * Load auth context for user
   */
  public async loadAuthContext(user: User, session: Session): Promise<AuthContext> {
    // Get user profile
    const profile = await this.getUserProfile(user.id);

    // Get company access
    const companyAccess = await this.getUserCompanyAccess(user.id);

    this.currentAuthContext = {
      user,
      session,
      profile,
      companyAccess
    };

    // Set auth context for RLS
    await this.setAuthContext(user.id, session.access_token);

    return this.currentAuthContext;
  }

  /**
   * Get current auth context
   */
  public getAuthContext(): AuthContext | null {
    return this.currentAuthContext;
  }

  // ===============================================
  // USER PROFILE OPERATIONS
  // ===============================================

  /**
   * Get user profile
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.queryOne<UserProfile>(
      `SELECT * FROM user_profiles WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [userId, ...Object.values(updates)];

    return this.queryOne<UserProfile>(
      `UPDATE user_profiles SET ${setClause}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      values
    );
  }

  /**
   * Get users by role
   */
  public async getUsersByRole(role: string): Promise<UserProfile[]> {
    return this.query<UserProfile>(
      `SELECT * FROM user_profiles WHERE role = $1 AND is_active = true ORDER BY full_name`,
      [role]
    );
  }

  /**
   * Search users
   */
  public async searchUsers(searchTerm: string, limit = 10): Promise<UserProfile[]> {
    return this.query<UserProfile>(
      `SELECT * FROM user_profiles
       WHERE (full_name ILIKE $1 OR email ILIKE $1 OR username ILIKE $1)
       AND is_active = true
       ORDER BY full_name LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
  }

  // ===============================================
  // COMPANY ACCESS OPERATIONS
  // ===============================================

  /**
   * Get user company access
   */
  public async getUserCompanyAccess(userId: string): Promise<UserCompanyAccess[]> {
    return this.query<UserCompanyAccess>(
      `SELECT uca.*, c.company_name
       FROM user_company_access uca
       JOIN companies c ON uca.company_id = c.id
       WHERE uca.user_id = $1 AND uca.is_active = true
       AND (uca.expires_at IS NULL OR uca.expires_at > NOW())
       ORDER BY c.company_name`,
      [userId]
    );
  }

  /**
   * Grant company access
   */
  public async grantCompanyAccess(
    userId: string,
    companyId: string,
    role: string,
    permissions: any,
    grantedBy: string,
    expiresAt?: string
  ): Promise<UserCompanyAccess | null> {
    return this.queryOne<UserCompanyAccess>(
      `INSERT INTO user_company_access
       (user_id, company_id, role, permissions, granted_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, company_id) DO UPDATE SET
         role = EXCLUDED.role,
         permissions = EXCLUDED.permissions,
         granted_by = EXCLUDED.granted_by,
         expires_at = EXCLUDED.expires_at,
         is_active = true,
         updated_at = NOW()
       RETURNING *`,
      [userId, companyId, role, JSON.stringify(permissions), grantedBy, expiresAt]
    );
  }

  /**
   * Revoke company access
   */
  public async revokeCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    const result = await this.query(
      `UPDATE user_company_access
       SET is_active = false, updated_at = NOW()
       WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId]
    );
    return result.length > 0;
  }

  /**
   * Get company users
   */
  public async getCompanyUsers(companyId: string): Promise<any[]> {
    return this.query(
      `SELECT up.*, uca.role, uca.permissions, uca.granted_at, uca.last_accessed_at
       FROM user_company_access uca
       JOIN user_profiles up ON uca.user_id = up.id
       WHERE uca.company_id = $1 AND uca.is_active = true
       AND up.is_active = true
       ORDER BY up.full_name`,
      [companyId]
    );
  }

  // ===============================================
  // SESSION MANAGEMENT
  // ===============================================

  /**
   * Create user session
   */
  public async createUserSession(userId: string, session: Session, metadata?: any): Promise<UserSession | null> {
    return this.queryOne<UserSession>(
      `INSERT INTO user_sessions
       (user_id, session_token, refresh_token, expires_at, device_info)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        userId,
        session.access_token,
        session.refresh_token,
        new Date(session.expires_at! * 1000).toISOString(),
        JSON.stringify(metadata || {})
      ]
    );
  }

  /**
   * Update session activity
   */
  public async updateSessionActivity(sessionToken: string): Promise<void> {
    await this.query(
      `UPDATE user_sessions
       SET last_activity_at = NOW()
       WHERE session_token = $1 AND is_active = true`,
      [sessionToken]
    );
  }

  /**
   * End user session
   */
  public async endUserSession(sessionToken: string, reason?: string): Promise<void> {
    await this.query(
      `UPDATE user_sessions
       SET is_active = false, logout_at = NOW(), logout_reason = $2
       WHERE session_token = $1`,
      [sessionToken, reason]
    );
  }

  /**
   * Get active sessions for user
   */
  public async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.query<UserSession>(
      `SELECT * FROM user_sessions
       WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
       ORDER BY last_activity_at DESC`,
      [userId]
    );
  }

  /**
   * Cleanup expired sessions
   */
  public async cleanupExpiredSessions(): Promise<void> {
    await this.query(
      `UPDATE user_sessions
       SET is_active = false, logout_reason = 'expired'
       WHERE expires_at <= NOW() AND is_active = true`
    );
  }

  // ===============================================
  // INVITATION MANAGEMENT
  // ===============================================

  /**
   * Create user invitation
   */
  public async createInvitation(
    email: string,
    invitedBy: string,
    companyId?: string,
    role = 'viewer',
    permissions?: any,
    message?: string
  ): Promise<UserInvitation | null> {
    const invitationToken = crypto.randomBytes(32).toString('base64url');

    return this.queryOne<UserInvitation>(
      `SELECT * FROM invite_user($1, $2, $3, $4, $5, $6)`,
      [email, invitedBy, companyId, role, JSON.stringify(permissions || {}), message]
    );
  }

  /**
   * Accept invitation
   */
  public async acceptInvitation(token: string, userId: string): Promise<boolean> {
    const result = await this.queryOne<{ accept_invitation: boolean }>(
      `SELECT accept_invitation($1, $2) as result`,
      [token, userId]
    );
    return result?.accept_invitation || false;
  }

  /**
   * Get pending invitations
   */
  public async getPendingInvitations(email?: string): Promise<UserInvitation[]> {
    if (email) {
      return this.query<UserInvitation>(
        `SELECT * FROM user_invitations
         WHERE email = $1 AND status = 'pending' AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [email]
      );
    }

    return this.query<UserInvitation>(
      `SELECT ui.*, up.full_name as invited_by_name, c.company_name
       FROM user_invitations ui
       JOIN user_profiles up ON ui.invited_by = up.id
       LEFT JOIN companies c ON ui.company_id = c.id
       WHERE ui.status = 'pending' AND ui.expires_at > NOW()
       ORDER BY ui.created_at DESC`
    );
  }

  // ===============================================
  // AUDIT LOGGING
  // ===============================================

  /**
   * Create audit log
   */
  public async createAuditLog(
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ): Promise<void> {
    const userId = this.currentAuthContext?.user?.id;
    const sessionId = this.currentAuthContext?.session?.access_token;

    await this.query(
      `INSERT INTO audit_logs
       (user_id, session_id, action, resource_type, resource_id, old_values, new_values, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        sessionId,
        action,
        resourceType,
        resourceId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
  }

  /**
   * Get audit logs
   */
  public async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let sql = `
      SELECT al.*, up.full_name as user_name
      FROM audit_logs al
      LEFT JOIN user_profiles up ON al.user_id = up.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.userId) {
      sql += ` AND al.user_id = $${++paramCount}`;
      params.push(filters.userId);
    }

    if (filters?.action) {
      sql += ` AND al.action = $${++paramCount}`;
      params.push(filters.action);
    }

    if (filters?.resourceType) {
      sql += ` AND al.resource_type = $${++paramCount}`;
      params.push(filters.resourceType);
    }

    if (filters?.startDate) {
      sql += ` AND al.timestamp >= $${++paramCount}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      sql += ` AND al.timestamp <= $${++paramCount}`;
      params.push(filters.endDate);
    }

    sql += ` ORDER BY al.timestamp DESC`;

    if (filters?.limit) {
      sql += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }

    if (filters?.offset) {
      sql += ` OFFSET $${++paramCount}`;
      params.push(filters.offset);
    }

    return this.query<AuditLog>(sql, params);
  }

  // ===============================================
  // PERMISSION HELPERS
  // ===============================================

  /**
   * Check if user has permission for company
   */
  public async hasCompanyPermission(userId: string, companyId: string, permission: string): Promise<boolean> {
    const result = await this.queryOne<{ has_permission: boolean }>(
      `SELECT auth.has_company_permission($1, $2) as has_permission`,
      [companyId, permission]
    );
    return result?.has_permission || false;
  }

  /**
   * Check if user can access company
   */
  public async hasCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    const result = await this.queryOne<{ has_access: boolean }>(
      `SELECT auth.has_company_access($1) as has_access`,
      [companyId]
    );
    return result?.has_access || false;
  }

  /**
   * Get user role for company
   */
  public async getUserCompanyRole(userId: string, companyId: string): Promise<string | null> {
    const result = await this.queryOne<{ role: string }>(
      `SELECT auth.user_company_role($1) as role`,
      [companyId]
    );
    return result?.role || null;
  }

  /**
   * Check if user is admin
   */
  public async isAdmin(userId: string): Promise<boolean> {
    const result = await this.queryOne<{ is_admin: boolean }>(
      `SELECT auth.is_admin() as is_admin`
    );
    return result?.is_admin || false;
  }

  /**
   * Check if user is super admin
   */
  public async isSuperAdmin(userId: string): Promise<boolean> {
    const result = await this.queryOne<{ is_super_admin: boolean }>(
      `SELECT auth.is_super_admin() as is_super_admin`
    );
    return result?.is_super_admin || false;
  }
}

export default SupabaseConnection;