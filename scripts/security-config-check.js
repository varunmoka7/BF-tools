#!/usr/bin/env node

/**
 * Security Configuration Validation Script
 * Validates security settings before deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.recommendations = [];
    this.score = 0;
    this.maxScore = 0;
  }

  /**
   * Run all security configuration checks
   */
  async validateAll() {
    console.log('🛡️ Running security configuration validation...\n');

    // Environment checks
    this.checkEnvironmentVariables();
    this.checkJWTConfiguration();
    this.checkDatabaseSecurity();
    this.checkCORSConfiguration();
    this.checkRateLimiting();
    this.checkSSLConfiguration();
    this.checkPasswordPolicy();
    this.checkSessionSecurity();
    this.checkLoggingConfiguration();
    this.checkFilePermissions();

    // Generate report
    this.generateReport();

    return {
      passed: this.errors.length === 0,
      score: this.score,
      maxScore: this.maxScore,
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.recommendations
    };
  }

  /**
   * Check critical environment variables
   */
  checkEnvironmentVariables() {
    console.log('📋 Checking environment variables...');

    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'DATABASE_URL'
    ];

    const productionVars = [
      'CORS_CREDENTIALS',
      'RATE_LIMIT_WINDOW_MS',
      'SESSION_SECRET',
      'ENCRYPTION_KEY'
    ];

    // Check required variables
    this.maxScore += 10;
    let envScore = 0;

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.errors.push(`Missing required environment variable: ${varName}`);
      } else {
        envScore += 2;
      }
    }

    // Check production-specific variables
    if (process.env.NODE_ENV === 'production') {
      for (const varName of productionVars) {
        if (!process.env[varName]) {
          this.warnings.push(`Missing production environment variable: ${varName}`);
        } else {
          envScore += 0.5;
        }
      }
    }

    // Check for default/example values
    const defaultValues = {
      'JWT_SECRET': ['your-super-secret-jwt-key-here', 'change-me', 'default'],
      'SESSION_SECRET': ['your-session-secret-here', 'change-me', 'default'],
      'ENCRYPTION_KEY': ['your-encryption-key-here', 'change-me', 'default']
    };

    for (const [varName, defaults] of Object.entries(defaultValues)) {
      const value = process.env[varName];
      if (value && defaults.includes(value)) {
        this.errors.push(`${varName} is using a default/example value - CRITICAL SECURITY RISK`);
      }
    }

    this.score += Math.min(envScore, 10);
    console.log(`  ✅ Environment variables check completed (${envScore}/10 points)\n`);
  }

  /**
   * Check JWT configuration security
   */
  checkJWTConfiguration() {
    console.log('🔑 Checking JWT configuration...');

    this.maxScore += 8;
    let jwtScore = 0;

    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret) {
      // Check secret strength
      if (jwtSecret.length < 32) {
        this.errors.push('JWT_SECRET must be at least 32 characters long');
      } else {
        jwtScore += 2;
      }

      // Check entropy
      const entropy = this.calculateEntropy(jwtSecret);
      if (entropy < 4.0) {
        this.warnings.push(`JWT_SECRET has low entropy (${entropy.toFixed(2)}). Use a more random secret.`);
      } else {
        jwtScore += 2;
      }

      // Check expiry settings
      const jwtExpiry = process.env.JWT_EXPIRY || '24h';
      if (this.parseTimeToSeconds(jwtExpiry) > 86400) { // 24 hours
        this.warnings.push('JWT_EXPIRY is longer than 24 hours. Consider shorter expiry for better security.');
      } else {
        jwtScore += 2;
      }

      // Check refresh token settings
      if (process.env.JWT_REFRESH_EXPIRY) {
        jwtScore += 2;
      } else {
        this.recommendations.push('Consider implementing JWT refresh tokens');
      }
    }

    this.score += jwtScore;
    console.log(`  ✅ JWT configuration check completed (${jwtScore}/8 points)\n`);
  }

  /**
   * Check database security configuration
   */
  checkDatabaseSecurity() {
    console.log('🗄️ Checking database security...');

    this.maxScore += 6;
    let dbScore = 0;

    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl) {
      // Check if using SSL
      if (dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')) {
        dbScore += 2;
      } else {
        this.errors.push('Database connection should use SSL/TLS');
      }

      // Check for credentials in URL
      if (dbUrl.includes('@')) {
        this.warnings.push('Database URL contains credentials. Ensure this is properly secured.');
      }

      // Check RLS is enabled
      if (process.env.ENABLE_RLS === 'true') {
        dbScore += 2;
      } else {
        this.errors.push('Row Level Security (RLS) should be enabled');
      }

      // Check connection pooling
      if (process.env.CONNECTION_POOL_SIZE) {
        dbScore += 2;
      } else {
        this.recommendations.push('Configure connection pooling for better performance and security');
      }
    }

    this.score += dbScore;
    console.log(`  ✅ Database security check completed (${dbScore}/6 points)\n`);
  }

  /**
   * Check CORS configuration
   */
  checkCORSConfiguration() {
    console.log('🌐 Checking CORS configuration...');

    this.maxScore += 5;
    let corsScore = 0;

    const allowedOrigins = process.env.ALLOWED_ORIGINS;

    if (allowedOrigins) {
      const origins = allowedOrigins.split(',');

      // Check for wildcard
      if (origins.includes('*')) {
        this.errors.push('CORS should not allow all origins (*) in production');
      } else {
        corsScore += 2;
      }

      // Check for localhost in production
      if (process.env.NODE_ENV === 'production') {
        const hasLocalhost = origins.some(origin =>
          origin.includes('localhost') || origin.includes('127.0.0.1')
        );
        if (hasLocalhost) {
          this.warnings.push('CORS allows localhost origins in production');
        } else {
          corsScore += 1;
        }
      }

      // Check for HTTPS origins
      const httpsOrigins = origins.filter(origin => origin.startsWith('https://'));
      if (httpsOrigins.length === origins.length) {
        corsScore += 2;
      } else {
        this.warnings.push('Some CORS origins are not using HTTPS');
      }
    } else {
      this.errors.push('ALLOWED_ORIGINS not configured');
    }

    this.score += corsScore;
    console.log(`  ✅ CORS configuration check completed (${corsScore}/5 points)\n`);
  }

  /**
   * Check rate limiting configuration
   */
  checkRateLimiting() {
    console.log('🚦 Checking rate limiting configuration...');

    this.maxScore += 4;
    let rateLimitScore = 0;

    // Check general rate limiting
    if (process.env.RATE_LIMIT_WINDOW_MS && process.env.RATE_LIMIT_MAX_REQUESTS) {
      rateLimitScore += 2;
    } else {
      this.errors.push('Rate limiting not properly configured');
    }

    // Check auth-specific rate limiting
    if (process.env.AUTH_RATE_LIMIT_WINDOW_MS && process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) {
      rateLimitScore += 2;
    } else {
      this.warnings.push('Authentication rate limiting not configured');
    }

    this.score += rateLimitScore;
    console.log(`  ✅ Rate limiting check completed (${rateLimitScore}/4 points)\n`);
  }

  /**
   * Check SSL/TLS configuration
   */
  checkSSLConfiguration() {
    console.log('🔒 Checking SSL/TLS configuration...');

    this.maxScore += 5;
    let sslScore = 0;

    if (process.env.NODE_ENV === 'production') {
      // Check HTTPS enforcement
      if (process.env.FORCE_HTTPS === 'true') {
        sslScore += 2;
      } else {
        this.errors.push('HTTPS enforcement should be enabled in production');
      }

      // Check HSTS settings
      if (process.env.HSTS_MAX_AGE) {
        const hstsMaxAge = parseInt(process.env.HSTS_MAX_AGE);
        if (hstsMaxAge >= 31536000) { // 1 year
          sslScore += 2;
        } else {
          this.warnings.push('HSTS max age should be at least 1 year (31536000 seconds)');
        }
      } else {
        this.warnings.push('HSTS (HTTP Strict Transport Security) not configured');
      }

      // Check HSTS preload
      if (process.env.HSTS_PRELOAD === 'true') {
        sslScore += 1;
      } else {
        this.recommendations.push('Enable HSTS preload for better security');
      }
    } else {
      sslScore += 5; // Full points for non-production
    }

    this.score += sslScore;
    console.log(`  ✅ SSL/TLS configuration check completed (${sslScore}/5 points)\n`);
  }

  /**
   * Check password policy
   */
  checkPasswordPolicy() {
    console.log('🔐 Checking password policy...');

    this.maxScore += 4;
    let passwordScore = 0;

    // Check minimum length
    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8');
    if (minLength >= 12) {
      passwordScore += 2;
    } else if (minLength >= 8) {
      passwordScore += 1;
      this.recommendations.push('Consider increasing minimum password length to 12+ characters');
    } else {
      this.warnings.push('Password minimum length should be at least 8 characters');
    }

    // Check complexity requirements
    if (process.env.PASSWORD_REQUIRE_COMPLEXITY === 'true') {
      passwordScore += 2;
    } else {
      this.recommendations.push('Enable password complexity requirements');
    }

    this.score += passwordScore;
    console.log(`  ✅ Password policy check completed (${passwordScore}/4 points)\n`);
  }

  /**
   * Check session security
   */
  checkSessionSecurity() {
    console.log('🍪 Checking session security...');

    this.maxScore += 6;
    let sessionScore = 0;

    // Check session secret
    if (process.env.SESSION_SECRET) {
      if (process.env.SESSION_SECRET.length >= 32) {
        sessionScore += 2;
      } else {
        this.warnings.push('SESSION_SECRET should be at least 32 characters');
      }
    } else {
      this.warnings.push('SESSION_SECRET not configured');
    }

    // Check secure flags
    if (process.env.SESSION_SECURE === 'true') {
      sessionScore += 2;
    } else {
      this.errors.push('Session cookies should have secure flag in production');
    }

    // Check HttpOnly flag
    if (process.env.SESSION_HTTP_ONLY === 'true') {
      sessionScore += 1;
    } else {
      this.errors.push('Session cookies should have HttpOnly flag');
    }

    // Check SameSite setting
    if (process.env.SESSION_SAME_SITE === 'strict' || process.env.SESSION_SAME_SITE === 'lax') {
      sessionScore += 1;
    } else {
      this.warnings.push('Session cookies should have SameSite attribute');
    }

    this.score += sessionScore;
    console.log(`  ✅ Session security check completed (${sessionScore}/6 points)\n`);
  }

  /**
   * Check logging configuration
   */
  checkLoggingConfiguration() {
    console.log('📝 Checking logging configuration...');

    this.maxScore += 3;
    let loggingScore = 0;

    // Check if audit logging is enabled
    if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
      loggingScore += 1;
    } else {
      this.recommendations.push('Enable audit logging for security events');
    }

    // Check if security monitoring is enabled
    if (process.env.ENABLE_SECURITY_MONITORING === 'true') {
      loggingScore += 1;
    } else {
      this.recommendations.push('Enable security monitoring');
    }

    // Check log level
    const logLevel = process.env.LOG_LEVEL;
    if (logLevel === 'info' || logLevel === 'warn' || logLevel === 'error') {
      loggingScore += 1;
    } else {
      this.warnings.push('Set appropriate log level (info, warn, or error)');
    }

    this.score += loggingScore;
    console.log(`  ✅ Logging configuration check completed (${loggingScore}/3 points)\n`);
  }

  /**
   * Check file permissions
   */
  checkFilePermissions() {
    console.log('📁 Checking file permissions...');

    this.maxScore += 3;
    let fileScore = 0;

    try {
      // Check .env file permissions
      const envFiles = ['.env', '.env.local', '.env.production'];

      for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
          const stats = fs.statSync(envFile);
          const mode = stats.mode & parseInt('777', 8);

          if (mode <= parseInt('600', 8)) {
            fileScore += 1;
          } else {
            this.warnings.push(`${envFile} has overly permissive permissions (${mode.toString(8)})`);
          }
        }
      }

      // Check if running as root (in Docker)
      if (process.getuid && process.getuid() === 0) {
        this.warnings.push('Application is running as root user');
      } else {
        fileScore += 1;
      }

    } catch (error) {
      this.warnings.push(`Could not check file permissions: ${error.message}`);
    }

    this.score += Math.min(fileScore, 3);
    console.log(`  ✅ File permissions check completed (${Math.min(fileScore, 3)}/3 points)\n`);
  }

  /**
   * Calculate entropy of a string
   */
  calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const length = str.length;

    for (const count of Object.values(freq)) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Parse time string to seconds
   */
  parseTimeToSeconds(timeStr) {
    const units = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };

    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }

    return parseInt(timeStr) || 0;
  }

  /**
   * Generate security report
   */
  generateReport() {
    const percentage = Math.round((this.score / this.maxScore) * 100);

    console.log('📊 SECURITY CONFIGURATION REPORT');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${this.score}/${this.maxScore} (${percentage}%)`);

    // Security grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    console.log(`Security Grade: ${grade}`);
    console.log();

    // Errors (critical issues)
    if (this.errors.length > 0) {
      console.log('❌ CRITICAL SECURITY ISSUES:');
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
      console.log();
    }

    // Warnings (important issues)
    if (this.warnings.length > 0) {
      console.log('⚠️ SECURITY WARNINGS:');
      this.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
      console.log();
    }

    // Recommendations (nice to have)
    if (this.recommendations.length > 0) {
      console.log('💡 SECURITY RECOMMENDATIONS:');
      this.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log();
    }

    // Overall status
    if (this.errors.length === 0) {
      console.log('✅ Security configuration validation PASSED');
    } else {
      console.log('❌ Security configuration validation FAILED');
      console.log('Please fix critical issues before deployment.');
    }
  }
}

// Main execution
async function main() {
  const validator = new SecurityConfigValidator();
  const result = await validator.validateAll();

  // Exit with appropriate code
  if (result.passed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecurityConfigValidator;