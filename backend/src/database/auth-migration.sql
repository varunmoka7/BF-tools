-- Authentication System Migration for Waste Intelligence Platform
-- Comprehensive authentication, authorization, and audit system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===============================================
-- 1. USER PROFILES TABLE
-- ===============================================
-- User profiles extending Supabase auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'analyst', 'viewer')),
    phone TEXT,
    job_title TEXT,
    department TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 2. USER COMPANY ACCESS TABLE
-- ===============================================
-- Manages which users can access which companies and their permissions
CREATE TABLE IF NOT EXISTS user_company_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{
        "read": true,
        "write": false,
        "delete": false,
        "export": false,
        "manage_users": false,
        "view_financials": false,
        "view_opportunities": false,
        "manage_opportunities": false
    }'::jsonb,
    granted_by UUID REFERENCES user_profiles(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    access_reason TEXT,
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- ===============================================
-- 3. USER SESSIONS TABLE
-- ===============================================
-- Track user sessions for security and analytics
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    is_active BOOLEAN DEFAULT true,
    login_method TEXT DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'github', 'microsoft', 'sso')),
    login_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    logout_at TIMESTAMPTZ,
    logout_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 4. AUDIT LOGS TABLE
-- ===============================================
-- Comprehensive audit trail for all sensitive operations
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    table_name TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    execution_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 5. USER INVITATIONS TABLE
-- ===============================================
-- Manage user invitations and onboarding
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}'::jsonb,
    invitation_token TEXT UNIQUE NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES user_profiles(id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES user_profiles(id),
    reminder_sent_at TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 6. USER PREFERENCES TABLE
-- ===============================================
-- Store user preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, preference_type, preference_key)
);

-- ===============================================
-- 7. API KEYS TABLE
-- ===============================================
-- Manage API access for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions JSONB DEFAULT '{"read": true}'::jsonb,
    rate_limit INTEGER DEFAULT 1000,
    rate_limit_period TEXT DEFAULT 'hour' CHECK (rate_limit_period IN ('minute', 'hour', 'day', 'month')),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);

-- User company access indexes
CREATE INDEX IF NOT EXISTS idx_user_company_access_user_id ON user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_company_id ON user_company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_role ON user_company_access(role);
CREATE INDEX IF NOT EXISTS idx_user_company_access_is_active ON user_company_access(is_active);
CREATE INDEX IF NOT EXISTS idx_user_company_access_expires_at ON user_company_access(expires_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- User invitations indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_user_invitations_company_id ON user_invitations(company_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type_key ON user_preferences(preference_type, preference_key);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- ===============================================
-- TRIGGERS AND FUNCTIONS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to auth tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_company_access_updated_at BEFORE UPDATE ON user_company_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_invitations_updated_at BEFORE UPDATE ON user_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, email_verified, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE OR REPLACE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to log user login
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        UPDATE user_profiles
        SET
            last_login_at = NEW.last_sign_in_at,
            login_count = login_count + 1,
            failed_login_attempts = 0
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log user login
CREATE OR REPLACE TRIGGER log_user_login_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION log_user_login();

-- Function to audit table changes
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    session_id_val UUID;
BEGIN
    -- Get current user ID from context
    user_id_val := current_setting('app.current_user_id', true)::UUID;
    session_id_val := current_setting('app.current_session_id', true)::UUID;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            user_id, session_id, action, resource_type, table_name, resource_id, old_values
        ) VALUES (
            user_id_val, session_id_val, 'DELETE', TG_TABLE_NAME, TG_TABLE_NAME,
            COALESCE(OLD.id::TEXT, ''), row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            user_id, session_id, action, resource_type, table_name, resource_id, old_values, new_values
        ) VALUES (
            user_id_val, session_id_val, 'UPDATE', TG_TABLE_NAME, TG_TABLE_NAME,
            COALESCE(NEW.id::TEXT, ''), row_to_json(OLD), row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            user_id, session_id, action, resource_type, table_name, resource_id, new_values
        ) VALUES (
            user_id_val, session_id_val, 'INSERT', TG_TABLE_NAME, TG_TABLE_NAME,
            COALESCE(NEW.id::TEXT, ''), row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_companies_trigger
    AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_user_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_user_company_access_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_company_access
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_opportunities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_leads_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- ===============================================
-- USER MANAGEMENT FUNCTIONS
-- ===============================================

-- Function to invite user
CREATE OR REPLACE FUNCTION invite_user(
    p_email TEXT,
    p_invited_by UUID,
    p_company_id UUID DEFAULT NULL,
    p_role TEXT DEFAULT 'viewer',
    p_permissions JSONB DEFAULT NULL,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    invitation_id UUID;
    invitation_token TEXT;
BEGIN
    -- Generate invitation token
    invitation_token := encode(gen_random_bytes(32), 'base64');

    -- Create invitation
    INSERT INTO user_invitations (
        email, invited_by, company_id, role, permissions,
        invitation_token, message, expires_at
    ) VALUES (
        p_email, p_invited_by, p_company_id, p_role,
        COALESCE(p_permissions, '{}'::jsonb), invitation_token, p_message,
        NOW() + INTERVAL '7 days'
    ) RETURNING id INTO invitation_id;

    RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(
    p_token TEXT,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    invitation RECORD;
BEGIN
    -- Get invitation
    SELECT * INTO invitation
    FROM user_invitations
    WHERE invitation_token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update invitation status
    UPDATE user_invitations
    SET status = 'accepted', accepted_at = NOW(), accepted_by = p_user_id
    WHERE id = invitation.id;

    -- Grant company access if specified
    IF invitation.company_id IS NOT NULL THEN
        INSERT INTO user_company_access (
            user_id, company_id, role, permissions, granted_by
        ) VALUES (
            p_user_id, invitation.company_id, invitation.role,
            invitation.permissions, invitation.invited_by
        ) ON CONFLICT (user_id, company_id) DO UPDATE SET
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = NOW();
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change user role
CREATE OR REPLACE FUNCTION change_user_role(
    p_user_id UUID,
    p_company_id UUID,
    p_new_role TEXT,
    p_changed_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_company_access
    SET role = p_new_role, updated_at = NOW()
    WHERE user_id = p_user_id AND company_id = p_company_id;

    IF FOUND THEN
        -- Log the role change
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
        VALUES (
            p_changed_by, 'ROLE_CHANGE', 'user_company_access',
            p_user_id::TEXT,
            jsonb_build_object(
                'target_user_id', p_user_id,
                'company_id', p_company_id,
                'new_role', p_new_role
            )
        );
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke user access
CREATE OR REPLACE FUNCTION revoke_user_access(
    p_user_id UUID,
    p_company_id UUID,
    p_revoked_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_company_access
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id AND company_id = p_company_id;

    IF FOUND THEN
        -- Log the access revocation
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
        VALUES (
            p_revoked_by, 'ACCESS_REVOKED', 'user_company_access',
            p_user_id::TEXT,
            jsonb_build_object(
                'target_user_id', p_user_id,
                'company_id', p_company_id
            )
        );
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================
COMMENT ON TABLE user_profiles IS 'Extended user profiles with roles and preferences';
COMMENT ON TABLE user_company_access IS 'Company-level access control and permissions';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security tracking';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all operations';
COMMENT ON TABLE user_invitations IS 'User invitation and onboarding management';
COMMENT ON TABLE user_preferences IS 'User preferences and application settings';
COMMENT ON TABLE api_keys IS 'API access keys for external integrations';

-- Success message
SELECT 'Authentication migration completed successfully' as status;