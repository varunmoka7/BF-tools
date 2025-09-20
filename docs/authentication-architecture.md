# Authentication Architecture Documentation

## Overview

The Waste Intelligence Platform implements a comprehensive authentication and authorization system built on Supabase Auth with PostgreSQL Row Level Security (RLS) for data isolation and security.

## Architecture Components

### 1. Database Schema

#### Core Tables

**user_profiles**
- Extends Supabase `auth.users` with application-specific data
- Stores roles, preferences, and security settings
- Automatically created via trigger when auth user is created

**user_company_access**
- Manages company-level access control
- Supports role-based permissions with fine-grained controls
- Includes expiration and auditing capabilities

**user_sessions**
- Tracks active user sessions for security monitoring
- Stores device info, IP addresses, and activity timestamps
- Enables session management and termination

**audit_logs**
- Comprehensive audit trail for all sensitive operations
- Automatically populated via database triggers
- Includes user context, change tracking, and metadata

**user_invitations**
- Manages user invitations to platform/companies
- Supports expiration, reminders, and status tracking
- Integrates with email notification system

#### Supporting Tables

- `user_preferences` - User settings and configurations
- `api_keys` - API access management for external integrations

### 2. Row Level Security (RLS)

#### Security Model
- **Data Isolation**: Users can only access data they have permissions for
- **Company-based Access**: All company data is filtered by user access rights
- **Role-based Controls**: Different permissions based on user roles
- **Audit Transparency**: All operations are logged and auditable

#### RLS Policies
- User profile access (own data only, admin oversight)
- Company data access (based on `user_company_access`)
- Audit log access (own logs, admin visibility)
- Invitation management (sent/received visibility)

### 3. Authentication Service Layer

#### AuthService Class
```typescript
class AuthService {
  // Core authentication
  signUp(signUpData: SignUpData)
  signIn(signInData: SignInData)
  signOut()

  // Profile management
  updateProfile(userId: string, updates: UpdateProfileData)
  changePassword(userId: string, newPassword: string)
  enableTwoFactor(userId: string)

  // Access control
  grantCompanyAccess(userId, companyId, role, permissions)
  revokeCompanyAccess(userId, companyId)
  updateUserRole(userId, companyId, newRole)

  // Invitation system
  inviteUser(inviteData: InviteUserData)
  acceptInvitation(token: string, userId: string)

  // Permission checks
  hasCompanyPermission(userId, companyId, permission)
  hasCompanyAccess(userId, companyId)
  isAdmin(userId) / isSuperAdmin(userId)
}
```

### 4. Middleware System

#### Authentication Middleware
- JWT token verification
- User context loading
- Session activity tracking
- Security policy enforcement

#### Available Middleware
```typescript
// Core authentication
authenticate - Requires valid token
optionalAuth - Optional token verification

// Role-based access
requireRole(['admin', 'manager'])
requireAdmin
requireSuperAdmin

// Company-based access
requireCompanyAccess('companyId')
requirePermission('write', 'companyId')

// Security features
rateLimit({ windowMs: 900000, maxRequests: 100 })
logRequest - Audit logging
```

### 5. Storage Management

#### Supabase Storage Buckets
- **profile-pictures**: Private user avatars (5MB limit)
- **company-logos**: Public company branding (2MB limit)
- **documents**: Private company documents (10MB limit)

#### Storage Policies
- Users can manage own profile pictures
- Company members can access company documents
- Admins have elevated storage permissions

## User Roles and Permissions

### Role Hierarchy

1. **super_admin**
   - Platform-wide access
   - User management across all companies
   - System configuration

2. **admin**
   - Company-level administration
   - User management within companies
   - Advanced features access

3. **manager**
   - Team leadership capabilities
   - Data management and reporting
   - Limited user management

4. **analyst**
   - Data analysis and reporting
   - Read/write access to assigned data
   - No user management

5. **viewer**
   - Read-only access
   - Basic reporting capabilities
   - Limited data export

### Permission Matrix

| Permission | Super Admin | Admin | Manager | Analyst | Viewer |
|------------|-------------|-------|---------|---------|--------|
| read | ✅ | ✅ | ✅ | ✅ | ✅ |
| write | ✅ | ✅ | ✅ | ✅ | ❌ |
| delete | ✅ | ✅ | ✅ | ❌ | ❌ |
| export | ✅ | ✅ | ✅ | ✅ | Limited |
| manage_users | ✅ | ✅ | ✅ | ❌ | ❌ |
| view_financials | ✅ | ✅ | ✅ | Limited | ❌ |
| manage_opportunities | ✅ | ✅ | ✅ | Limited | ❌ |

## Security Features

### 1. Password Security
- Minimum 8 characters
- Complexity requirements
- Password change tracking
- Failed attempt monitoring
- Account lockout protection

### 2. Session Management
- JWT with refresh token rotation
- Session activity tracking
- Device and location monitoring
- Concurrent session management
- Automatic session cleanup

### 3. Two-Factor Authentication
- TOTP support
- QR code generation
- Backup codes
- Admin override capabilities

### 4. Audit Logging
- All sensitive operations logged
- User context preservation
- Change value tracking
- IP and device information
- Performance metrics

### 5. Rate Limiting
- Per-user request limits
- IP-based restrictions
- Escalating penalties
- Admin exemptions

## API Integration

### Authentication Endpoints

```typescript
// Authentication
POST /auth/signup
POST /auth/signin
POST /auth/signout
POST /auth/refresh

// Profile Management
GET /auth/profile
PUT /auth/profile
POST /auth/change-password
POST /auth/enable-2fa

// User Management (Admin)
GET /auth/users
POST /auth/invite-user
PUT /auth/users/:id/role
DELETE /auth/users/:id/access

// Company Access
GET /auth/company-access
POST /auth/grant-access
DELETE /auth/revoke-access
```

### Authentication Headers
```
Authorization: Bearer <jwt_token>
```

### Error Responses
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

## Implementation Guide

### 1. Database Migration

```bash
# Run authentication migration
npm run migrate:auth

# Or manually execute
node scripts/run-auth-migration.ts
```

### 2. Environment Configuration

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=your_postgres_url

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production

# Default Admin (for setup)
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=secure_password
```

### 3. Express.js Integration

```typescript
import express from 'express';
import { authenticate, requireAdmin, requirePermission } from './middleware/auth-middleware';

const app = express();

// Public routes
app.post('/auth/signin', authController.signIn);
app.post('/auth/signup', authController.signUp);

// Protected routes
app.use('/api', authenticate);
app.get('/api/profile', userController.getProfile);

// Admin routes
app.use('/api/admin', requireAdmin);
app.get('/api/admin/users', adminController.getUsers);

// Company-specific routes
app.get('/api/companies/:companyId/data',
  requirePermission('read'),
  companyController.getData
);
```

### 4. Frontend Integration

```typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Authentication hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
```

### 5. Permission Checks

```typescript
// Backend permission check
app.get('/api/companies/:companyId/sensitive-data',
  authenticate,
  async (req, res) => {
    const hasPermission = await req.hasPermission!(
      req.params.companyId,
      'view_financials'
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Return sensitive data
  }
);

// Frontend permission check
const CompanyFinancials = ({ companyId }) => {
  const { hasPermission } = usePermissions();
  const canView = hasPermission(companyId, 'view_financials');

  if (!canView) {
    return <AccessDenied />;
  }

  return <FinancialData companyId={companyId} />;
};
```

## Monitoring and Maintenance

### 1. Health Checks
- Database connectivity
- Authentication service status
- Session cleanup monitoring
- Storage bucket health

### 2. Performance Monitoring
- Authentication response times
- Database query performance
- Session cleanup efficiency
- RLS policy performance

### 3. Security Monitoring
- Failed login attempts
- Suspicious activity patterns
- Permission escalation attempts
- Session anomalies

### 4. Maintenance Tasks
```bash
# Cleanup expired sessions
npm run auth:cleanup-sessions

# Generate security report
npm run auth:security-report

# Backup audit logs
npm run auth:backup-logs
```

## Best Practices

### 1. Security
- Use HTTPS in production
- Implement proper CORS policies
- Regular security audits
- Monitor for suspicious activity
- Keep dependencies updated

### 2. Performance
- Implement proper indexing
- Cache user permissions
- Optimize RLS queries
- Monitor session cleanup
- Use connection pooling

### 3. Scalability
- Horizontal database scaling
- Session storage optimization
- Audit log archiving
- Load balancing considerations
- CDN for static assets

### 4. Monitoring
- Log all authentication events
- Monitor permission changes
- Track session patterns
- Audit admin actions
- Performance metrics

## Troubleshooting

### Common Issues

1. **RLS Policy Violations**
   - Check user permissions
   - Verify auth context is set
   - Review policy definitions

2. **Session Timeout Issues**
   - Verify JWT configuration
   - Check refresh token logic
   - Monitor session cleanup

3. **Permission Denied Errors**
   - Verify user company access
   - Check role assignments
   - Review permission matrix

4. **Database Connection Issues**
   - Check connection strings
   - Verify SSL settings
   - Monitor connection pools

### Debug Commands
```bash
# Check user permissions
SELECT * FROM user_company_access WHERE user_id = 'user-id';

# View active sessions
SELECT * FROM user_sessions WHERE user_id = 'user-id' AND is_active = true;

# Check audit logs
SELECT * FROM audit_logs WHERE user_id = 'user-id' ORDER BY timestamp DESC LIMIT 10;
```

## Support and Resources

- **Documentation**: `/docs/authentication-architecture.md`
- **API Reference**: `/docs/api-reference.md`
- **Security Guide**: `/docs/security-guide.md`
- **Deployment Guide**: `/docs/deployment-guide.md`

For additional support, contact the development team or refer to the project's GitHub repository.