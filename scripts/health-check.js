#!/usr/bin/env node

/**
 * Health Check Script for Waste Intelligence Platform
 * Comprehensive health monitoring for Docker containers and production deployments
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HEALTH_CHECK_CONFIG = {
  port: process.env.PORT || 3000,
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
  retries: parseInt(process.env.HEALTH_CHECK_RETRIES || '3'),
  endpoints: [
    '/health',
    '/api/health',
    '/ping'
  ],
  criticalServices: [
    'database',
    'auth',
    'filesystem'
  ]
};

class HealthChecker {
  constructor() {
    this.results = {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      checks: {},
      errors: [],
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Run all health checks
   */
  async runAllChecks() {
    console.log('🏥 Starting health check...');

    try {
      // Basic service health
      await this.checkBasicHealth();

      // Database connectivity
      await this.checkDatabase();

      // Authentication service
      await this.checkAuthService();

      // File system access
      await this.checkFileSystem();

      // Memory and CPU
      await this.checkResources();

      // Network connectivity
      await this.checkNetworkConnectivity();

      // Determine overall status
      this.determineOverallStatus();

      console.log(`✅ Health check completed: ${this.results.status}`);
      return this.results;

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.status = 'unhealthy';
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  /**
   * Check basic application health
   */
  async checkBasicHealth() {
    console.log('  📊 Checking basic application health...');

    try {
      const startTime = Date.now();

      // Test if the main process is responsive
      await this.makeRequest('/health');

      const responseTime = Date.now() - startTime;

      this.results.checks.basic = {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.results.checks.basic = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw new Error(`Basic health check failed: ${error.message}`);
    }
  }

  /**
   * Check database connectivity
   */
  async checkDatabase() {
    console.log('  🗄️ Checking database connectivity...');

    try {
      // Try to connect to database
      const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;

      if (!dbUrl) {
        throw new Error('Database URL not configured');
      }

      // Test database connection with a simple query
      await this.makeRequest('/api/health/database');

      this.results.checks.database = {
        status: 'healthy',
        url: dbUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.results.checks.database = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      // Database is critical, but don't fail immediately
      this.results.errors.push(`Database check failed: ${error.message}`);
    }
  }

  /**
   * Check authentication service
   */
  async checkAuthService() {
    console.log('  🔐 Checking authentication service...');

    try {
      // Test auth endpoint availability
      await this.makeRequest('/api/auth/health');

      // Check JWT configuration
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-here') {
        throw new Error('JWT_SECRET not properly configured');
      }

      this.results.checks.auth = {
        status: 'healthy',
        jwtConfigured: !!jwtSecret,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.results.checks.auth = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.errors.push(`Auth service check failed: ${error.message}`);
    }
  }

  /**
   * Check file system access
   */
  async checkFileSystem() {
    console.log('  📁 Checking file system access...');

    try {
      const testFile = path.join(process.cwd(), 'logs', '.health-check');

      // Try to write a test file
      await fs.promises.writeFile(testFile, 'health-check-test');

      // Try to read it back
      const content = await fs.promises.readFile(testFile, 'utf8');

      if (content !== 'health-check-test') {
        throw new Error('File content mismatch');
      }

      // Clean up
      await fs.promises.unlink(testFile);

      this.results.checks.filesystem = {
        status: 'healthy',
        writable: true,
        readable: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.results.checks.filesystem = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      // File system issues are serious
      this.results.errors.push(`Filesystem check failed: ${error.message}`);
    }
  }

  /**
   * Check system resources
   */
  async checkResources() {
    console.log('  💾 Checking system resources...');

    try {
      const memory = process.memoryUsage();
      const uptime = process.uptime();

      // Convert bytes to MB
      const memoryMB = {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024)
      };

      // Check for memory leaks (basic heuristic)
      const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
      const isMemoryHigh = memoryUsagePercent > 90;

      this.results.checks.resources = {
        status: isMemoryHigh ? 'warning' : 'healthy',
        memory: memoryMB,
        memoryUsagePercent: Math.round(memoryUsagePercent),
        uptime: Math.round(uptime),
        pid: process.pid,
        timestamp: new Date().toISOString()
      };

      if (isMemoryHigh) {
        this.results.errors.push(`High memory usage: ${memoryUsagePercent}%`);
      }

    } catch (error) {
      this.results.checks.resources = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check network connectivity
   */
  async checkNetworkConnectivity() {
    console.log('  🌐 Checking network connectivity...');

    try {
      // Test external connectivity
      await this.checkExternalService('https://api.supabase.co', 'Supabase API');

      this.results.checks.network = {
        status: 'healthy',
        external: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.results.checks.network = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      // Network issues are warnings, not failures
      console.warn(`⚠️ Network connectivity issue: ${error.message}`);
    }
  }

  /**
   * Make HTTP request to local service
   */
  async makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: HEALTH_CHECK_CONFIG.port,
        path: path,
        method: method,
        timeout: HEALTH_CHECK_CONFIG.timeout,
        headers: {
          'User-Agent': 'HealthCheck/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${HEALTH_CHECK_CONFIG.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Check external service connectivity
   */
  async checkExternalService(url, serviceName) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 5000,
        headers: {
          'User-Agent': 'HealthCheck/1.0'
        }
      };

      const req = client.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          reject(new Error(`${serviceName} returned ${res.statusCode}`));
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`${serviceName} timeout`));
      });

      req.on('error', (error) => {
        reject(new Error(`${serviceName} error: ${error.message}`));
      });

      req.end();
    });
  }

  /**
   * Determine overall health status
   */
  determineOverallStatus() {
    const checks = this.results.checks;
    const hasUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warning');

    if (hasUnhealthy) {
      this.results.status = 'unhealthy';
    } else if (hasWarnings) {
      this.results.status = 'degraded';
    } else {
      this.results.status = 'healthy';
    }
  }

  /**
   * Output results
   */
  outputResults() {
    if (process.env.HEALTH_CHECK_FORMAT === 'json') {
      console.log(JSON.stringify(this.results, null, 2));
    } else {
      console.log(`\n🏥 Health Check Results`);
      console.log(`Status: ${this.results.status.toUpperCase()}`);
      console.log(`Timestamp: ${this.results.timestamp}`);
      console.log(`Uptime: ${Math.round(this.results.uptime)}s`);

      console.log('\n📊 Individual Checks:');
      for (const [name, check] of Object.entries(this.results.checks)) {
        const icon = check.status === 'healthy' ? '✅' :
                    check.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${icon} ${name}: ${check.status}`);
        if (check.error) {
          console.log(`    Error: ${check.error}`);
        }
      }

      if (this.results.errors.length > 0) {
        console.log('\n❌ Errors:');
        this.results.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }
    }
  }
}

// Main execution
async function main() {
  const healthChecker = new HealthChecker();

  try {
    const results = await healthChecker.runAllChecks();
    healthChecker.outputResults();

    // Exit with appropriate code
    if (results.status === 'healthy') {
      process.exit(0);
    } else if (results.status === 'degraded') {
      process.exit(1); // Warning state
    } else {
      process.exit(2); // Unhealthy state
    }

  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(3); // Critical failure
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = HealthChecker;