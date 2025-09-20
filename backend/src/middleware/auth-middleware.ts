/**
 * Authentication Middleware for Waste Intelligence Platform
 * Handles JWT verification, session management, and permission checks
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import SupabaseConnection, { AuthContext, UserProfile } from '../database/supabase-connection';
import AuthService from '../services/auth-service';

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      user?: UserProfile;
      hasPermission?: (companyId: string, permission: string) => Promise<boolean>;
      hasCompanyAccess?: (companyId: string) => Promise<boolean>;
      isAdmin?: () => Promise<boolean>;
      isSuperAdmin?: () => Promise<boolean>;
    }
  }
}

export class AuthMiddleware {
  private db: SupabaseConnection;
  private authService: AuthService;

  constructor() {
    this.db = SupabaseConnection.getInstance();
    this.authService = new AuthService();
  }

  /**
   * Verify JWT token and load user context
   */
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Missing or invalid authorization header',
          code: 'UNAUTHORIZED'
        });
      }

      const token = authHeader.substring(7);

      // Verify token with Supabase
      const { data: { user }, error } = await this.db.getSupabaseClient()
        .auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }

      // Load full auth context
      const authContext = await this.loadUserContext(user.id, token);
      if (!authContext) {
        return res.status(401).json({
          error: 'User context not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (!authContext.profile?.is_active) {
        return res.status(403).json({
          error: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Check if account is locked
      if (authContext.profile?.locked_until) {\n        const lockUntil = new Date(authContext.profile.locked_until);\n        if (lockUntil > new Date()) {\n          return res.status(423).json({\n            error: 'Account is temporarily locked',\n            code: 'ACCOUNT_LOCKED',\n            lockedUntil: lockUntil.toISOString()\n          });\n        }\n      }\n\n      // Set auth context for RLS\n      await this.db.setAuthContext(user.id, token);\n\n      // Update session activity\n      await this.db.updateSessionActivity(token);\n\n      // Attach auth context to request\n      req.auth = authContext;\n      req.user = authContext.profile!;\n\n      // Attach helper methods\n      req.hasPermission = async (companyId: string, permission: string) => {\n        return this.authService.hasCompanyPermission(user.id, companyId, permission);\n      };\n\n      req.hasCompanyAccess = async (companyId: string) => {\n        return this.authService.hasCompanyAccess(user.id, companyId);\n      };\n\n      req.isAdmin = async () => {\n        return this.authService.isAdmin(user.id);\n      };\n\n      req.isSuperAdmin = async () => {\n        return this.authService.isSuperAdmin(user.id);\n      };\n\n      next();\n    } catch (error) {\n      console.error('Authentication middleware error:', error);\n      return res.status(500).json({\n        error: 'Authentication failed',\n        code: 'AUTH_ERROR'\n      });\n    }\n  };\n\n  /**\n   * Optional authentication (doesn't fail if no token)\n   */\n  optionalAuth = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n      const authHeader = req.headers.authorization;\n      if (!authHeader || !authHeader.startsWith('Bearer ')) {\n        return next(); // Continue without auth\n      }\n\n      // Try to authenticate\n      await this.authenticate(req, res, next);\n    } catch (error) {\n      // Continue without auth on error\n      next();\n    }\n  };\n\n  /**\n   * Require specific role\n   */\n  requireRole = (roles: string | string[]) => {\n    const roleArray = Array.isArray(roles) ? roles : [roles];\n\n    return async (req: Request, res: Response, next: NextFunction) => {\n      if (!req.user) {\n        return res.status(401).json({\n          error: 'Authentication required',\n          code: 'UNAUTHORIZED'\n        });\n      }\n\n      if (!roleArray.includes(req.user.role)) {\n        return res.status(403).json({\n          error: 'Insufficient permissions',\n          code: 'FORBIDDEN',\n          requiredRoles: roleArray,\n          userRole: req.user.role\n        });\n      }\n\n      next();\n    };\n  };\n\n  /**\n   * Require admin role\n   */\n  requireAdmin = async (req: Request, res: Response, next: NextFunction) => {\n    if (!req.user) {\n      return res.status(401).json({\n        error: 'Authentication required',\n        code: 'UNAUTHORIZED'\n      });\n    }\n\n    const isAdmin = await req.isAdmin!();\n    if (!isAdmin) {\n      return res.status(403).json({\n        error: 'Admin access required',\n        code: 'ADMIN_REQUIRED'\n      });\n    }\n\n    next();\n  };\n\n  /**\n   * Require super admin role\n   */\n  requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {\n    if (!req.user) {\n      return res.status(401).json({\n        error: 'Authentication required',\n        code: 'UNAUTHORIZED'\n      });\n    }\n\n    const isSuperAdmin = await req.isSuperAdmin!();\n    if (!isSuperAdmin) {\n      return res.status(403).json({\n        error: 'Super admin access required',\n        code: 'SUPER_ADMIN_REQUIRED'\n      });\n    }\n\n    next();\n  };\n\n  /**\n   * Require company access\n   */\n  requireCompanyAccess = (companyIdParam = 'companyId') => {\n    return async (req: Request, res: Response, next: NextFunction) => {\n      if (!req.user) {\n        return res.status(401).json({\n          error: 'Authentication required',\n          code: 'UNAUTHORIZED'\n        });\n      }\n\n      const companyId = req.params[companyIdParam] || req.body[companyIdParam] || req.query[companyIdParam];\n      if (!companyId) {\n        return res.status(400).json({\n          error: 'Company ID required',\n          code: 'COMPANY_ID_REQUIRED'\n        });\n      }\n\n      const hasAccess = await req.hasCompanyAccess!(companyId);\n      if (!hasAccess) {\n        return res.status(403).json({\n          error: 'Company access required',\n          code: 'COMPANY_ACCESS_REQUIRED',\n          companyId\n        });\n      }\n\n      next();\n    };\n  };\n\n  /**\n   * Require specific permission for company\n   */\n  requirePermission = (permission: string, companyIdParam = 'companyId') => {\n    return async (req: Request, res: Response, next: NextFunction) => {\n      if (!req.user) {\n        return res.status(401).json({\n          error: 'Authentication required',\n          code: 'UNAUTHORIZED'\n        });\n      }\n\n      const companyId = req.params[companyIdParam] || req.body[companyIdParam] || req.query[companyIdParam];\n      if (!companyId) {\n        return res.status(400).json({\n          error: 'Company ID required',\n          code: 'COMPANY_ID_REQUIRED'\n        });\n      }\n\n      const hasPermission = await req.hasPermission!(companyId, permission);\n      if (!hasPermission) {\n        return res.status(403).json({\n          error: 'Permission denied',\n          code: 'PERMISSION_DENIED',\n          requiredPermission: permission,\n          companyId\n        });\n      }\n\n      next();\n    };\n  };\n\n  /**\n   * Rate limiting middleware\n   */\n  rateLimit = (options: {\n    windowMs: number;\n    maxRequests: number;\n    message?: string;\n  }) => {\n    const requests = new Map<string, { count: number; resetTime: number }>();\n\n    return (req: Request, res: Response, next: NextFunction) => {\n      const key = req.user?.id || req.ip;\n      const now = Date.now();\n      const windowStart = now - options.windowMs;\n\n      // Clean up old entries\n      for (const [k, v] of requests.entries()) {\n        if (v.resetTime < windowStart) {\n          requests.delete(k);\n        }\n      }\n\n      // Get current count\n      const current = requests.get(key) || { count: 0, resetTime: now };\n\n      if (current.count >= options.maxRequests && current.resetTime > windowStart) {\n        return res.status(429).json({\n          error: options.message || 'Too many requests',\n          code: 'RATE_LIMIT_EXCEEDED',\n          retryAfter: Math.ceil((current.resetTime - windowStart) / 1000)\n        });\n      }\n\n      // Update count\n      requests.set(key, {\n        count: current.resetTime > windowStart ? current.count + 1 : 1,\n        resetTime: current.resetTime > windowStart ? current.resetTime : now\n      });\n\n      next();\n    };\n  };\n\n  /**\n   * Request logging middleware\n   */\n  logRequest = async (req: Request, res: Response, next: NextFunction) => {\n    const startTime = Date.now();\n\n    // Capture response end\n    const originalSend = res.send;\n    res.send = function(data) {\n      const endTime = Date.now();\n      const duration = endTime - startTime;\n\n      // Log request (async, don't block response)\n      setImmediate(async () => {\n        try {\n          if (req.user) {\n            await this.db.createAuditLog(\n              `${req.method}_${req.route?.path || req.path}`,\n              'api_request',\n              req.user.id,\n              null,\n              {\n                method: req.method,\n                path: req.path,\n                statusCode: res.statusCode,\n                duration,\n                userAgent: req.headers['user-agent'],\n                ip: req.ip\n              }\n            );\n          }\n        } catch (error) {\n          console.error('Request logging error:', error);\n        }\n      });\n\n      return originalSend.call(this, data);\n    }.bind(this);\n\n    next();\n  };\n\n  /**\n   * Load user context from database\n   */\n  private async loadUserContext(userId: string, sessionToken: string): Promise<AuthContext | null> {\n    try {\n      // Get user profile\n      const profile = await this.db.getUserProfile(userId);\n      if (!profile) return null;\n\n      // Get company access\n      const companyAccess = await this.db.getUserCompanyAccess(userId);\n\n      // Create auth context (session will be set by Supabase)\n      return {\n        user: null, // Will be set by Supabase auth\n        session: null, // Will be set by Supabase auth\n        profile,\n        companyAccess\n      };\n    } catch (error) {\n      console.error('Load user context error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Error handler for auth-related errors\n   */\n  handleAuthError = (error: any, req: Request, res: Response, next: NextFunction) => {\n    console.error('Auth error:', error);\n\n    if (error.name === 'JsonWebTokenError') {\n      return res.status(401).json({\n        error: 'Invalid token',\n        code: 'INVALID_TOKEN'\n      });\n    }\n\n    if (error.name === 'TokenExpiredError') {\n      return res.status(401).json({\n        error: 'Token expired',\n        code: 'TOKEN_EXPIRED'\n      });\n    }\n\n    if (error.code === 'PGRST116') {\n      return res.status(403).json({\n        error: 'Access denied by security policy',\n        code: 'RLS_POLICY_VIOLATION'\n      });\n    }\n\n    return res.status(500).json({\n      error: 'Internal authentication error',\n      code: 'AUTH_INTERNAL_ERROR'\n    });\n  };\n}\n\n// Create singleton instance\nconst authMiddleware = new AuthMiddleware();\n\n// Export individual middleware functions\nexport const authenticate = authMiddleware.authenticate;\nexport const optionalAuth = authMiddleware.optionalAuth;\nexport const requireRole = authMiddleware.requireRole;\nexport const requireAdmin = authMiddleware.requireAdmin;\nexport const requireSuperAdmin = authMiddleware.requireSuperAdmin;\nexport const requireCompanyAccess = authMiddleware.requireCompanyAccess;\nexport const requirePermission = authMiddleware.requirePermission;\nexport const rateLimit = authMiddleware.rateLimit;\nexport const logRequest = authMiddleware.logRequest;\nexport const handleAuthError = authMiddleware.handleAuthError;\n\nexport default authMiddleware;"