-- Row Level Security (RLS) Policies for Waste Intelligence Platform
-- Comprehensive security policies for authentication and data isolation

-- ===============================================
-- ENABLE RLS ON ALL AUTH TABLES
-- ===============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- HELPER FUNCTIONS FOR RLS
-- ===============================================

-- Function to get current user ID
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.current_user_id()
        AND role = 'super_admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.current_user_id()
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user role for specific company
CREATE OR REPLACE FUNCTION auth.user_company_role(company_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT uca.role
        FROM user_company_access uca
        WHERE uca.user_id = auth.current_user_id()
        AND uca.company_id = company_id
        AND uca.is_active = true
        AND (uca.expires_at IS NULL OR uca.expires_at > NOW())
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has company access
CREATE OR REPLACE FUNCTION auth.has_company_access(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admins have access to everything
    IF auth.is_super_admin() THEN
        RETURN true;
    END IF;

    -- Check company-specific access
    RETURN EXISTS (
        SELECT 1 FROM user_company_access uca
        WHERE uca.user_id = auth.current_user_id()
        AND uca.company_id = company_id
        AND uca.is_active = true
        AND (uca.expires_at IS NULL OR uca.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check specific permission for company
CREATE OR REPLACE FUNCTION auth.has_company_permission(company_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    -- Super admins have all permissions
    IF auth.is_super_admin() THEN
        RETURN true;
    END IF;

    -- Get user permissions for the company
    SELECT uca.permissions INTO user_permissions
    FROM user_company_access uca
    WHERE uca.user_id = auth.current_user_id()
    AND uca.company_id = company_id
    AND uca.is_active = true
    AND (uca.expires_at IS NULL OR uca.expires_at > NOW());

    -- Check if permission exists and is true
    RETURN COALESCE((user_permissions ->> permission)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- USER PROFILES POLICIES
-- ===============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (
        id = auth.current_user_id()
    );

-- Users can update their own profile (except role and admin fields)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
        id = auth.current_user_id()
    );

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        auth.is_super_admin()
    );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        auth.is_super_admin()
    );

-- Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles" ON user_profiles
    FOR DELETE USING (
        auth.is_super_admin()
    );

-- Admins can view profiles of users in their companies
CREATE POLICY "Admins can view company users" ON user_profiles
    FOR SELECT USING (
        auth.is_admin() AND EXISTS (
            SELECT 1 FROM user_company_access uca1
            JOIN user_company_access uca2 ON uca1.company_id = uca2.company_id
            WHERE uca1.user_id = auth.current_user_id()
            AND uca2.user_id = user_profiles.id
            AND uca1.role IN ('admin', 'owner')
            AND uca1.is_active = true
        )
    );

-- ===============================================
-- USER COMPANY ACCESS POLICIES
-- ===============================================

-- Users can view their own access records
CREATE POLICY "Users can view own access" ON user_company_access
    FOR SELECT USING (
        user_id = auth.current_user_id()
    );

-- Super admins can view all access records
CREATE POLICY "Super admins can view all access" ON user_company_access
    FOR ALL USING (
        auth.is_super_admin()
    );

-- Company admins can view access for their companies
CREATE POLICY "Company admins can view company access" ON user_company_access
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_company_access uca
            WHERE uca.user_id = auth.current_user_id()
            AND uca.company_id = user_company_access.company_id
            AND uca.role IN ('admin', 'owner')
            AND uca.is_active = true
        )
    );

-- Company admins can manage access for their companies
CREATE POLICY "Company admins can manage company access" ON user_company_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_company_access uca
            WHERE uca.user_id = auth.current_user_id()
            AND uca.company_id = user_company_access.company_id
            AND uca.role IN ('admin', 'owner')
            AND uca.is_active = true
        )
    );

-- ===============================================
-- USER SESSIONS POLICIES
-- ===============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (
        user_id = auth.current_user_id()
    );

-- Users can update their own active sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (
        user_id = auth.current_user_id()
        AND is_active = true
    );

-- Super admins can view all sessions
CREATE POLICY "Super admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        auth.is_super_admin()
    );

-- Super admins can manage all sessions
CREATE POLICY "Super admins can manage all sessions" ON user_sessions
    FOR ALL USING (
        auth.is_super_admin()
    );

-- ===============================================
-- AUDIT LOGS POLICIES
-- ===============================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (
        user_id = auth.current_user_id()
    );

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        auth.is_super_admin()
    );

-- Admins can view audit logs for their companies
CREATE POLICY "Admins can view company audit logs" ON audit_logs
    FOR SELECT USING (
        auth.is_admin() AND (
            -- Direct company access logs
            (resource_type = 'companies' AND auth.has_company_access(resource_id::UUID))
            OR
            -- User access logs for company users
            (resource_type = 'user_company_access' AND EXISTS (
                SELECT 1 FROM user_company_access uca1
                JOIN user_company_access uca2 ON uca1.company_id = uca2.company_id
                WHERE uca1.user_id = auth.current_user_id()
                AND uca2.user_id = audit_logs.user_id
                AND uca1.role IN ('admin', 'owner')
                AND uca1.is_active = true
            ))
        )
    );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ===============================================
-- USER INVITATIONS POLICIES
-- ===============================================

-- Users can view invitations they sent
CREATE POLICY "Users can view sent invitations" ON user_invitations
    FOR SELECT USING (
        invited_by = auth.current_user_id()
    );

-- Users can view invitations sent to them
CREATE POLICY "Users can view received invitations" ON user_invitations
    FOR SELECT USING (
        email = (SELECT email FROM user_profiles WHERE id = auth.current_user_id())
    );

-- Super admins can view all invitations
CREATE POLICY "Super admins can view all invitations" ON user_invitations
    FOR ALL USING (
        auth.is_super_admin()
    );

-- Company admins can manage invitations for their companies
CREATE POLICY "Company admins can manage invitations" ON user_invitations
    FOR ALL USING (
        company_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM user_company_access uca
            WHERE uca.user_id = auth.current_user_id()
            AND uca.company_id = user_invitations.company_id
            AND uca.role IN ('admin', 'owner')
            AND uca.is_active = true
        )
    );

-- Users can create invitations if they have permission
CREATE POLICY "Users can create invitations" ON user_invitations
    FOR INSERT WITH CHECK (
        invited_by = auth.current_user_id()
        AND (
            auth.is_super_admin()
            OR (
                company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM user_company_access uca
                    WHERE uca.user_id = auth.current_user_id()
                    AND uca.company_id = user_invitations.company_id
                    AND uca.role IN ('admin', 'owner')
                    AND uca.is_active = true
                )
            )
        )
    );

-- ===============================================
-- USER PREFERENCES POLICIES
-- ===============================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (
        user_id = auth.current_user_id()
    );

-- Super admins can view all preferences
CREATE POLICY "Super admins can view all preferences" ON user_preferences
    FOR SELECT USING (
        auth.is_super_admin()
    );

-- ===============================================
-- API KEYS POLICIES
-- ===============================================

-- Users can manage their own API keys
CREATE POLICY "Users can manage own API keys" ON api_keys
    FOR ALL USING (
        user_id = auth.current_user_id()
    );

-- Super admins can view all API keys
CREATE POLICY "Super admins can view all API keys" ON api_keys
    FOR SELECT USING (
        auth.is_super_admin()
    );

-- ===============================================
-- COMPANY DATA POLICIES (UPDATE EXISTING)
-- ===============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on companies" ON companies;
DROP POLICY IF EXISTS "Allow all operations on waste_streams" ON waste_streams;
DROP POLICY IF EXISTS "Allow all operations on company_metrics" ON company_metrics;
DROP POLICY IF EXISTS "Allow all operations on opportunities" ON opportunities;
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;

-- Companies policies
CREATE POLICY "Users can view accessible companies" ON companies
    FOR SELECT USING (
        auth.has_company_access(id)
    );

CREATE POLICY "Users can update accessible companies" ON companies
    FOR UPDATE USING (
        auth.has_company_permission(id, 'write')
    );

CREATE POLICY "Users can delete accessible companies" ON companies
    FOR DELETE USING (
        auth.has_company_permission(id, 'delete')
    );

-- Waste streams policies
CREATE POLICY "Users can view accessible waste streams" ON waste_streams
    FOR SELECT USING (
        auth.has_company_access(company_id)
    );

CREATE POLICY "Users can update accessible waste streams" ON waste_streams
    FOR UPDATE USING (
        auth.has_company_permission(company_id, 'write')
    );

CREATE POLICY "Users can insert waste streams" ON waste_streams
    FOR INSERT WITH CHECK (
        auth.has_company_permission(company_id, 'write')
    );

CREATE POLICY "Users can delete accessible waste streams" ON waste_streams
    FOR DELETE USING (
        auth.has_company_permission(company_id, 'delete')
    );

-- Company metrics policies
CREATE POLICY "Users can view accessible company metrics" ON company_metrics
    FOR SELECT USING (
        auth.has_company_access(company_id)
    );

CREATE POLICY "Users can update accessible company metrics" ON company_metrics
    FOR UPDATE USING (
        auth.has_company_permission(company_id, 'write')
    );

CREATE POLICY "Users can insert company metrics" ON company_metrics
    FOR INSERT WITH CHECK (
        auth.has_company_permission(company_id, 'write')
    );

-- Opportunities policies
CREATE POLICY "Users can view accessible opportunities" ON opportunities
    FOR SELECT USING (
        auth.has_company_permission(company_id, 'view_opportunities')
    );

CREATE POLICY "Users can manage accessible opportunities" ON opportunities
    FOR ALL USING (
        auth.has_company_permission(company_id, 'manage_opportunities')
    );

-- Leads policies
CREATE POLICY "Users can view accessible leads" ON leads
    FOR SELECT USING (
        auth.has_company_access(company_id)
    );

CREATE POLICY "Users can manage accessible leads" ON leads
    FOR ALL USING (
        auth.has_company_permission(company_id, 'write')
    );

-- ===============================================
-- GRANT PERMISSIONS
-- ===============================================

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated, anon;

-- Grant permissions on auth tables for authenticated users
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON user_company_access TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;

-- Grant permissions for anon users (limited)
GRANT SELECT ON user_invitations TO anon;

-- Grant execute permissions on auth functions
GRANT EXECUTE ON FUNCTION auth.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_company_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_company_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_company_permission(UUID, TEXT) TO authenticated;

-- Grant execute permissions on management functions
GRANT EXECUTE ON FUNCTION invite_user(TEXT, UUID, UUID, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_invitation(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_role(UUID, UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_access(UUID, UUID, UUID) TO authenticated;

-- Success message
SELECT 'RLS policies applied successfully' as status;