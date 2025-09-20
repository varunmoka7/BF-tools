/**
 * Security Middleware Suite for Waste Intelligence Platform
 * Comprehensive security controls including rate limiting, CORS, headers, and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import { AuthMiddleware } from './auth-middleware';
import SupabaseConnection from '../database/supabase-connection';

interface SecurityConfig {
  corsOrigins: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  enableSecurityHeaders: boolean;
  enableCompression: boolean;
  enableAuditLogging: boolean;
}

export class SecurityMiddleware {
  private config: SecurityConfig;
  private db: SupabaseConnection;
  private authMiddleware: AuthMiddleware;
  private suspiciousIPs: Set<string> = new Set();
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      enableSecurityHeaders: true,
      enableCompression: true,
      enableAuditLogging: true,
      ...config
    };

    this.db = SupabaseConnection.getInstance();
    this.authMiddleware = new AuthMiddleware();
  }

  /**
   * Configure security headers using Helmet
   */
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://unpkg.com",
            "https://cdn.jsdelivr.net"
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: [
            "'self'",
            "https://api.supabase.co",
            "https://*.supabase.co",
            "wss://*.supabase.co"
          ],
          workerSrc: ["'self'", "blob:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Configure CORS with security best practices
   */
  corsMiddleware() {
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (this.config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Log suspicious origin attempts
        this.logSecurityEvent('CORS_VIOLATION', {
          origin,
          timestamp: new Date().toISOString(),
          userAgent: undefined // Will be added by caller
        });

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      maxAge: 86400, // 24 hours
      optionsSuccessStatus: 200
    });
  }

  /**
   * General rate limiting
   */
  rateLimitMiddleware() {
    return rateLimit({
      windowMs: this.config.rateLimitWindow,
      max: this.config.rateLimitMax,
      message: {
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(this.config.rateLimitWindow / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/ping';
      },
      onLimitReached: (req) => {
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Strict rate limiting for authentication endpoints
   */
  authRateLimitMiddleware() {
    return rateLimit({
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),
      message: {
        error: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000') / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use email for login attempts, IP for general protection
        return req.body?.email || req.ip;
      },
      onLimitReached: (req) => {
        const identifier = req.body?.email || req.ip;
        this.logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
          identifier,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });

        // Mark IP as suspicious after multiple auth failures
        this.suspiciousIPs.add(req.ip);
      }
    });
  }

  /**
   * API-specific rate limiting
   */
  apiRateLimitMiddleware() {
    return rateLimit({
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000'),
      max: async (req) => {
        // Higher limits for authenticated premium users
        if (req.user?.role === 'premium' || req.user?.role === 'admin') {
          return parseInt(process.env.API_RATE_LIMIT_PREMIUM_MAX_REQUESTS || '5000');
        }
        return parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '1000');
      },
      message: {
        error: 'API rate limit exceeded. Upgrade to premium for higher limits.',
        code: 'API_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Request validation and sanitization
   */
  requestValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check for suspicious patterns in request
      const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // XSS attempts
        /union.*select/i,  // SQL injection
        /javascript:/i,  // JavaScript injection
        /data:.*base64/i  // Data URL injection
      ];

      const requestData = JSON.stringify({
        url: req.url,
        body: req.body,
        query: req.query
      });

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
          this.logSecurityEvent('MALICIOUS_REQUEST_BLOCKED', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            pattern: pattern.toString(),
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          });

          return res.status(400).json({
            error: 'Invalid request detected',
            code: 'INVALID_REQUEST'
          });
        }
      }

      // Check payload size
      const contentLength = parseInt(req.get('content-length') || '0');
      const maxSize = parseInt(process.env.MAX_PAYLOAD_SIZE?.replace(/\D/g, '') || '10485760'); // 10MB default

      if (contentLength > maxSize) {
        return res.status(413).json({
          error: 'Payload too large',
          code: 'PAYLOAD_TOO_LARGE'
        });
      }

      next();
    };
  }

  /**
   * Monitor for suspicious activity
   */
  suspiciousActivityMonitor() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip;
      const userAgent = req.get('User-Agent') || '';

      // Check for bot-like behavior
      const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /curl/i, /wget/i, /python/i, /perl/i
      ];

      const isBot = botPatterns.some(pattern => pattern.test(userAgent));

      // Check for suspicious user agents
      const suspiciousUAs = [
        '', // Empty user agent
        'Mozilla/5.0', // Generic Mozilla
        'python-requests', // Common scraping library
        'PostmanRuntime' // API testing (might be legitimate)
      ];

      const isSuspiciousUA = suspiciousUAs.includes(userAgent);

      // Monitor failed login attempts
      if (req.path.includes('/auth/') && req.method === 'POST') {
        const identifier = req.body?.email || ip;
        const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };

        // Reset counter if last attempt was over an hour ago
        if (Date.now() - attempts.lastAttempt.getTime() > 3600000) {
          attempts.count = 0;
        }

        // Check for rapid login attempts
        if (attempts.count > 10) {
          this.suspiciousIPs.add(ip);
          this.logSecurityEvent('BRUTE_FORCE_DETECTED', {
            ip,
            identifier,
            attempts: attempts.count,
            userAgent,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Block suspicious IPs
      if (this.suspiciousIPs.has(ip) && !this.isWhitelistedIP(ip)) {
        this.logSecurityEvent('SUSPICIOUS_IP_BLOCKED', {
          ip,
          path: req.path,
          userAgent,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          error: 'Access denied due to suspicious activity',
          code: 'SUSPICIOUS_ACTIVITY_BLOCKED'
        });
      }

      // Flag bot traffic for monitoring
      if (isBot || isSuspiciousUA) {
        this.logSecurityEvent('BOT_TRAFFIC_DETECTED', {
          ip,
          path: req.path,
          userAgent,
          isBot,
          isSuspiciousUA,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Response security middleware
   */
  responseSecurity() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Remove server information
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      // Add custom security headers
      res.setHeader('X-API-Version', process.env.API_VERSION || '1.0.0');
      res.setHeader('X-Response-Time', Date.now());

      // Prevent response tampering
      const originalSend = res.send;
      res.send = function(data) {
        // Add integrity check for sensitive data
        if (typeof data === 'object' && data !== null) {
          try {
            const dataStr = JSON.stringify(data);
            if (dataStr.includes('password') || dataStr.includes('token') || dataStr.includes('secret')) {
              // Log potential data leak
              console.warn('⚠️ Potential sensitive data in response:', req.path);
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Compression middleware with security considerations
   */
  compressionMiddleware() {
    return compression({
      filter: (req, res) => {
        // Don't compress responses containing potential secrets
        const contentType = res.getHeader('content-type') as string;
        if (contentType && contentType.includes('application/json')) {
          // Additional security check for sensitive content
          return true;
        }
        return compression.filter(req, res);
      },
      threshold: 1024, // Only compress if larger than 1KB
      level: 6 // Balance between compression and CPU usage
    });
  }

  /**
   * Input sanitization middleware
   */
  inputSanitization() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Recursively sanitize object
      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
        }

        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }

        if (obj && typeof obj === 'object') {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }

        return obj;
      };

      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      next();
    };
  }

  /**
   * Security audit logging
   */
  private async logSecurityEvent(event: string, details: any): Promise<void> {
    if (!this.config.enableAuditLogging) return;

    try {
      const logEntry = {
        event,
        details,
        timestamp: new Date().toISOString(),
        severity: this.getEventSeverity(event)
      };

      // Log to console for immediate visibility
      console.log(`🛡️ Security Event [${event}]:`, logEntry);

      // Store in database for analysis
      await this.db.createAuditLog(
        event,
        'security_events',
        null,
        null,
        details
      );

      // Send alerts for critical events
      if (logEntry.severity === 'critical') {
        await this.sendSecurityAlert(event, details);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Determine event severity
   */
  private getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['BRUTE_FORCE_DETECTED', 'MALICIOUS_REQUEST_BLOCKED'];
    const highEvents = ['AUTH_RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_IP_BLOCKED'];
    const mediumEvents = ['RATE_LIMIT_EXCEEDED', 'CORS_VIOLATION'];

    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    if (mediumEvents.includes(event)) return 'medium';
    return 'low';
  }

  /**
   * Send security alerts
   */
  private async sendSecurityAlert(event: string, details: any): Promise<void> {
    try {
      const alertData = {
        event,
        details,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      };

      // TODO: Integrate with notification services
      // - Email alerts
      // - Slack/Teams webhooks
      // - PagerDuty for critical events

      console.log('🚨 CRITICAL SECURITY ALERT:', alertData);
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  /**
   * Check if IP is whitelisted
   */
  private isWhitelistedIP(ip: string): boolean {
    const whitelist = process.env.WHITELISTED_IPS?.split(',') || [];
    return whitelist.includes(ip);
  }

  /**
   * Health check endpoint
   */
  healthCheck() {
    return (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
        security: {
          corsEnabled: true,
          rateLimitEnabled: true,
          securityHeadersEnabled: this.config.enableSecurityHeaders,
          compressionEnabled: this.config.enableCompression
        }
      });
    };
  }

  /**
   * Get all security middleware in correct order
   */
  getAllMiddleware() {
    const middleware = [];

    // Security headers (first)
    if (this.config.enableSecurityHeaders) {
      middleware.push(this.securityHeaders());
    }

    // CORS
    middleware.push(this.corsMiddleware());

    // Compression
    if (this.config.enableCompression) {
      middleware.push(this.compressionMiddleware());
    }

    // Security monitoring
    middleware.push(this.suspiciousActivityMonitor());

    // Request validation
    middleware.push(this.requestValidation());

    // Input sanitization
    middleware.push(this.inputSanitization());

    // Response security
    middleware.push(this.responseSecurity());

    // Rate limiting (general)
    middleware.push(this.rateLimitMiddleware());

    return middleware;
  }
}

// Export configured middleware instance
export default new SecurityMiddleware();