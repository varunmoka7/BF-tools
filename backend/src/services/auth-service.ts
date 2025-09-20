/**
 * Authentication Service for Waste Intelligence Platform
 * Comprehensive authentication, authorization, and user management
 */

import { User, Session } from '@supabase/supabase-js';
import SupabaseConnection, {
  UserProfile,
  UserCompanyAccess,
  UserInvitation,
  AuthContext
} from '../database/supabase-connection';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface InviteUserData {
  email: string;
  companyId?: string;
  role?: string;
  permissions?: any;
  message?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  language?: string;
}

export class AuthService {
  private db: SupabaseConnection;

  constructor() {
    this.db = SupabaseConnection.getInstance();
  }

  // ===============================================
  // AUTHENTICATION METHODS
  // ===============================================

  /**
   * Sign up a new user
   */
  async signUp(signUpData: SignUpData): Promise<{
    user: User | null;
    profile: UserProfile | null;
    error: any;
  }> {
    try {
      // Create auth user
      const { user, error: authError } = await this.db.signUp(
        signUpData.email,
        signUpData.password,
        {
          full_name: signUpData.fullName,
          job_title: signUpData.jobTitle,
          department: signUpData.department,
          phone: signUpData.phone
        }
      );

      if (authError || !user) {
        return { user: null, profile: null, error: authError };
      }

      // Get created profile
      const profile = await this.db.getUserProfile(user.id);

      // Log signup
      await this.db.createAuditLog(
        'USER_SIGNUP',
        'user_profiles',
        user.id,
        null,
        { email: signUpData.email, full_name: signUpData.fullName }
      );

      return { user, profile, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, profile: null, error };
    }
  }

  /**
   * Sign in user
   */
  async signIn(signInData: SignInData, metadata?: any): Promise<{
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    companyAccess: UserCompanyAccess[];
    error: any;
  }> {
    try {
      // Authenticate user
      const { user, session, error: authError } = await this.db.signIn(
        signInData.email,
        signInData.password
      );

      if (authError || !user || !session) {
        // Log failed login attempt
        if (authError?.message?.includes('Invalid login credentials')) {
          await this.incrementFailedLoginAttempts(signInData.email);
        }

        return {
          user: null,
          session: null,
          profile: null,
          companyAccess: [],
          error: authError
        };
      }

      // Load auth context
      const authContext = await this.db.loadAuthContext(user, session);

      // Log successful login
      await this.db.createAuditLog(
        'USER_LOGIN',
        'user_profiles',
        user.id,
        null,
        { email: signInData.email, metadata }
      );

      return {
        user,
        session,
        profile: authContext.profile,
        companyAccess: authContext.companyAccess,
        error: null
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        user: null,
        session: null,
        profile: null,
        companyAccess: [],
        error
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error: any }> {\n    try {\n      const authContext = this.db.getAuthContext();\n      \n      if (authContext?.user) {\n        // Log logout\n        await this.db.createAuditLog(\n          'USER_LOGOUT',\n          'user_profiles',\n          authContext.user.id\n        );\n      }\n\n      const { error } = await this.db.signOut();\n      return { error };\n    } catch (error) {\n      console.error('SignOut error:', error);\n      return { error };\n    }\n  }\n\n  /**\n   * Get current user with full context\n   */\n  async getCurrentUserContext(): Promise<AuthContext | null> {\n    try {\n      const user = await this.db.getCurrentUser();\n      if (!user) return null;\n\n      // Get or load auth context\n      let authContext = this.db.getAuthContext();\n      if (!authContext || authContext.user?.id !== user.id) {\n        // Load fresh context\n        const profile = await this.db.getUserProfile(user.id);\n        const companyAccess = await this.db.getUserCompanyAccess(user.id);\n        \n        authContext = {\n          user,\n          session: null, // Will be set by session middleware\n          profile,\n          companyAccess\n        };\n      }\n\n      return authContext;\n    } catch (error) {\n      console.error('Get current user context error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Refresh user session\n   */\n  async refreshSession(): Promise<{ session: Session | null; error: any }> {\n    try {\n      const { data, error } = await this.db.getSupabaseClient().auth.refreshSession();\n      \n      if (data.session && data.user && !error) {\n        // Update session activity\n        await this.db.updateSessionActivity(data.session.access_token);\n        \n        // Reload auth context\n        await this.db.loadAuthContext(data.user, data.session);\n      }\n\n      return { session: data.session, error };\n    } catch (error) {\n      console.error('Refresh session error:', error);\n      return { session: null, error };\n    }\n  }\n\n  // ===============================================\n  // USER PROFILE MANAGEMENT\n  // ===============================================\n\n  /**\n   * Update user profile\n   */\n  async updateProfile(userId: string, updates: UpdateProfileData): Promise<{\n    profile: UserProfile | null;\n    error: any;\n  }> {\n    try {\n      // Get current profile for audit\n      const currentProfile = await this.db.getUserProfile(userId);\n      \n      // Update profile\n      const profile = await this.db.updateUserProfile(userId, updates);\n      \n      if (profile) {\n        // Log profile update\n        await this.db.createAuditLog(\n          'PROFILE_UPDATE',\n          'user_profiles',\n          userId,\n          currentProfile,\n          updates\n        );\n      }\n\n      return { profile, error: null };\n    } catch (error) {\n      console.error('Update profile error:', error);\n      return { profile: null, error };\n    }\n  }\n\n  /**\n   * Change user password\n   */\n  async changePassword(userId: string, newPassword: string): Promise<{ error: any }> {\n    try {\n      const { error } = await this.db.getSupabaseClient().auth.updateUser({\n        password: newPassword\n      });\n\n      if (!error) {\n        // Update password changed timestamp\n        await this.db.updateUserProfile(userId, {\n          password_changed_at: new Date().toISOString()\n        } as any);\n\n        // Log password change\n        await this.db.createAuditLog(\n          'PASSWORD_CHANGE',\n          'user_profiles',\n          userId\n        );\n      }\n\n      return { error };\n    } catch (error) {\n      console.error('Change password error:', error);\n      return { error };\n    }\n  }\n\n  /**\n   * Enable two-factor authentication\n   */\n  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string; error: any }> {\n    try {\n      // Generate TOTP secret\n      const secret = crypto.randomBytes(20).toString('base32');\n      \n      // Update user profile\n      await this.db.updateUserProfile(userId, {\n        two_factor_enabled: true\n      } as any);\n\n      // Log 2FA enable\n      await this.db.createAuditLog(\n        'TWO_FACTOR_ENABLED',\n        'user_profiles',\n        userId\n      );\n\n      // Generate QR code URL (simplified)\n      const qrCode = `otpauth://totp/WasteIntelligence:${userId}?secret=${secret}&issuer=WasteIntelligence`;\n\n      return { secret, qrCode, error: null };\n    } catch (error) {\n      console.error('Enable 2FA error:', error);\n      return { secret: '', qrCode: '', error };\n    }\n  }\n\n  // ===============================================\n  // COMPANY ACCESS MANAGEMENT\n  // ===============================================\n\n  /**\n   * Grant company access to user\n   */\n  async grantCompanyAccess(\n    userId: string,\n    companyId: string,\n    role: string,\n    permissions: any,\n    grantedBy: string,\n    expiresAt?: string\n  ): Promise<{ access: UserCompanyAccess | null; error: any }> {\n    try {\n      const access = await this.db.grantCompanyAccess(\n        userId,\n        companyId,\n        role,\n        permissions,\n        grantedBy,\n        expiresAt\n      );\n\n      if (access) {\n        // Log access grant\n        await this.db.createAuditLog(\n          'COMPANY_ACCESS_GRANTED',\n          'user_company_access',\n          access.id,\n          null,\n          { userId, companyId, role, grantedBy }\n        );\n      }\n\n      return { access, error: null };\n    } catch (error) {\n      console.error('Grant company access error:', error);\n      return { access: null, error };\n    }\n  }\n\n  /**\n   * Revoke company access\n   */\n  async revokeCompanyAccess(\n    userId: string,\n    companyId: string,\n    revokedBy: string\n  ): Promise<{ success: boolean; error: any }> {\n    try {\n      const success = await this.db.revokeCompanyAccess(userId, companyId);\n\n      if (success) {\n        // Log access revocation\n        await this.db.createAuditLog(\n          'COMPANY_ACCESS_REVOKED',\n          'user_company_access',\n          `${userId}-${companyId}`,\n          null,\n          { userId, companyId, revokedBy }\n        );\n      }\n\n      return { success, error: null };\n    } catch (error) {\n      console.error('Revoke company access error:', error);\n      return { success: false, error };\n    }\n  }\n\n  /**\n   * Update user role for company\n   */\n  async updateUserRole(\n    userId: string,\n    companyId: string,\n    newRole: string,\n    updatedBy: string\n  ): Promise<{ success: boolean; error: any }> {\n    try {\n      // Get current access for audit\n      const currentAccess = await this.db.query(\n        'SELECT * FROM user_company_access WHERE user_id = $1 AND company_id = $2',\n        [userId, companyId]\n      );\n\n      const success = await this.db.query(\n        'SELECT change_user_role($1, $2, $3, $4) as success',\n        [userId, companyId, newRole, updatedBy]\n      );\n\n      return { success: !!success, error: null };\n    } catch (error) {\n      console.error('Update user role error:', error);\n      return { success: false, error };\n    }\n  }\n\n  // ===============================================\n  // INVITATION MANAGEMENT\n  // ===============================================\n\n  /**\n   * Invite user to platform/company\n   */\n  async inviteUser(\n    inviteData: InviteUserData,\n    invitedBy: string\n  ): Promise<{ invitation: UserInvitation | null; error: any }> {\n    try {\n      const invitation = await this.db.createInvitation(\n        inviteData.email,\n        invitedBy,\n        inviteData.companyId,\n        inviteData.role || 'viewer',\n        inviteData.permissions,\n        inviteData.message\n      );\n\n      if (invitation) {\n        // Log invitation\n        await this.db.createAuditLog(\n          'USER_INVITED',\n          'user_invitations',\n          invitation.id,\n          null,\n          { email: inviteData.email, companyId: inviteData.companyId, invitedBy }\n        );\n\n        // TODO: Send invitation email\n        // await this.sendInvitationEmail(invitation);\n      }\n\n      return { invitation, error: null };\n    } catch (error) {\n      console.error('Invite user error:', error);\n      return { invitation: null, error };\n    }\n  }\n\n  /**\n   * Accept invitation\n   */\n  async acceptInvitation(\n    token: string,\n    userId: string\n  ): Promise<{ success: boolean; error: any }> {\n    try {\n      const success = await this.db.acceptInvitation(token, userId);\n\n      if (success) {\n        // Log invitation acceptance\n        await this.db.createAuditLog(\n          'INVITATION_ACCEPTED',\n          'user_invitations',\n          token,\n          null,\n          { userId }\n        );\n      }\n\n      return { success, error: null };\n    } catch (error) {\n      console.error('Accept invitation error:', error);\n      return { success: false, error };\n    }\n  }\n\n  /**\n   * Get pending invitations for email\n   */\n  async getPendingInvitations(email: string): Promise<{\n    invitations: UserInvitation[];\n    error: any;\n  }> {\n    try {\n      const invitations = await this.db.getPendingInvitations(email);\n      return { invitations, error: null };\n    } catch (error) {\n      console.error('Get pending invitations error:', error);\n      return { invitations: [], error };\n    }\n  }\n\n  // ===============================================\n  // PERMISSION CHECKS\n  // ===============================================\n\n  /**\n   * Check if user has specific permission for company\n   */\n  async hasCompanyPermission(\n    userId: string,\n    companyId: string,\n    permission: string\n  ): Promise<boolean> {\n    try {\n      return await this.db.hasCompanyPermission(userId, companyId, permission);\n    } catch (error) {\n      console.error('Check company permission error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Check if user can access company\n   */\n  async hasCompanyAccess(userId: string, companyId: string): Promise<boolean> {\n    try {\n      return await this.db.hasCompanyAccess(userId, companyId);\n    } catch (error) {\n      console.error('Check company access error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Get user role for company\n   */\n  async getUserCompanyRole(userId: string, companyId: string): Promise<string | null> {\n    try {\n      return await this.db.getUserCompanyRole(userId, companyId);\n    } catch (error) {\n      console.error('Get user company role error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Check if user is admin\n   */\n  async isAdmin(userId: string): Promise<boolean> {\n    try {\n      return await this.db.isAdmin(userId);\n    } catch (error) {\n      console.error('Check admin error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Check if user is super admin\n   */\n  async isSuperAdmin(userId: string): Promise<boolean> {\n    try {\n      return await this.db.isSuperAdmin(userId);\n    } catch (error) {\n      console.error('Check super admin error:', error);\n      return false;\n    }\n  }\n\n  // ===============================================\n  // SECURITY HELPERS\n  // ===============================================\n\n  /**\n   * Increment failed login attempts\n   */\n  private async incrementFailedLoginAttempts(email: string): Promise<void> {\n    try {\n      await this.db.query(\n        `UPDATE user_profiles\n         SET failed_login_attempts = failed_login_attempts + 1,\n             locked_until = CASE\n               WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'\n               ELSE locked_until\n             END\n         WHERE email = $1`,\n        [email]\n      );\n    } catch (error) {\n      console.error('Increment failed login attempts error:', error);\n    }\n  }\n\n  /**\n   * Reset failed login attempts\n   */\n  async resetFailedLoginAttempts(userId: string): Promise<void> {\n    try {\n      await this.db.updateUserProfile(userId, {\n        failed_login_attempts: 0,\n        locked_until: null\n      } as any);\n    } catch (error) {\n      console.error('Reset failed login attempts error:', error);\n    }\n  }\n\n  /**\n   * Generate secure token\n   */\n  generateSecureToken(length = 32): string {\n    return crypto.randomBytes(length).toString('base64url');\n  }\n\n  /**\n   * Hash password (if needed for custom auth)\n   */\n  hashPassword(password: string): string {\n    const salt = crypto.randomBytes(16);\n    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');\n    return salt.toString('hex') + ':' + hash.toString('hex');\n  }\n\n  /**\n   * Verify password hash\n   */\n  verifyPassword(password: string, hashedPassword: string): boolean {\n    const [salt, hash] = hashedPassword.split(':');\n    const verifyHash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 10000, 64, 'sha512');\n    return hash === verifyHash.toString('hex');\n  }\n\n  // ===============================================\n  // SESSION MANAGEMENT\n  // ===============================================\n\n  /**\n   * Get active sessions for user\n   */\n  async getActiveSessions(userId: string): Promise<any[]> {\n    try {\n      return await this.db.getActiveSessions(userId);\n    } catch (error) {\n      console.error('Get active sessions error:', error);\n      return [];\n    }\n  }\n\n  /**\n   * Terminate session\n   */\n  async terminateSession(sessionToken: string, reason = 'user_logout'): Promise<void> {\n    try {\n      await this.db.endUserSession(sessionToken, reason);\n    } catch (error) {\n      console.error('Terminate session error:', error);\n    }\n  }\n\n  /**\n   * Terminate all sessions for user\n   */\n  async terminateAllSessions(userId: string, except?: string): Promise<void> {\n    try {\n      const sessions = await this.getActiveSessions(userId);\n      \n      for (const session of sessions) {\n        if (except && session.session_token === except) continue;\n        await this.terminateSession(session.session_token, 'admin_logout');\n      }\n    } catch (error) {\n      console.error('Terminate all sessions error:', error);\n    }\n  }\n\n  // ===============================================\n  // CLEANUP OPERATIONS\n  // ===============================================\n\n  /**\n   * Cleanup expired sessions and invitations\n   */\n  async cleanupExpiredData(): Promise<void> {\n    try {\n      // Cleanup expired sessions\n      await this.db.cleanupExpiredSessions();\n\n      // Mark expired invitations\n      await this.db.query(\n        `UPDATE user_invitations\n         SET status = 'expired'\n         WHERE status = 'pending' AND expires_at <= NOW()`\n      );\n\n      console.log('✅ Expired data cleanup completed');\n    } catch (error) {\n      console.error('Cleanup expired data error:', error);\n    }\n  }\n}\n\nexport default AuthService;"