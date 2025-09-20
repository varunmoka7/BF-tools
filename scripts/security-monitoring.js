#!/usr/bin/env node

/**
 * Security Monitoring and Alerting System
 * Real-time security monitoring for the Waste Intelligence Platform
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

class SecurityMonitor {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.alertThresholds = {
      failedLogins: parseInt(process.env.ALERT_THRESHOLD_FAILED_LOGINS || '10'),
      unusualActivity: parseInt(process.env.ALERT_THRESHOLD_UNUSUAL_ACTIVITY || '50'),
      rateLimitHits: 100,
      suspiciousIPs: 5
    };

    this.monitoringInterval = parseInt(process.env.MONITORING_INTERVAL || '60000'); // 1 minute
    this.isRunning = false;
  }

  /**
   * Start security monitoring
   */
  async start() {
    console.log('🛡️ Starting security monitoring system...');

    this.isRunning = true;

    // Start monitoring loops
    this.monitorAuthenticationEvents();
    this.monitorRateLimiting();
    this.monitorSuspiciousActivity();
    this.monitorSystemHealth();

    console.log('✅ Security monitoring system started');
  }

  /**
   * Stop security monitoring
   */
  stop() {
    console.log('🛑 Stopping security monitoring system...');
    this.isRunning = false;
  }

  /**
   * Monitor authentication events
   */
  async monitorAuthenticationEvents() {
    while (this.isRunning) {
      try {
        console.log('🔍 Monitoring authentication events...');

        // Check failed login attempts in the last hour
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

        const { data: failedLogins, error } = await this.supabase
          .from('audit_logs')
          .select('*')
          .eq('action', 'USER_LOGIN_FAILED')
          .gte('created_at', oneHourAgo);

        if (error) {
          console.error('Error fetching failed logins:', error);
        } else if (failedLogins && failedLogins.length > this.alertThresholds.failedLogins) {
          await this.sendAlert('HIGH_FAILED_LOGINS', {
            count: failedLogins.length,
            threshold: this.alertThresholds.failedLogins,
            timeframe: '1 hour',
            details: this.analyzeFailedLogins(failedLogins)
          });
        }

        // Check for brute force attacks
        await this.detectBruteForceAttacks();

        // Check for unusual login patterns
        await this.detectUnusualLoginPatterns();

        // Check for compromised accounts
        await this.detectCompromisedAccounts();

      } catch (error) {
        console.error('Error in authentication monitoring:', error);
      }

      await this.sleep(this.monitoringInterval);
    }
  }

  /**
   * Monitor rate limiting events
   */
  async monitorRateLimiting() {
    while (this.isRunning) {
      try {
        console.log('🚦 Monitoring rate limiting events...');

        const fifteenMinutesAgo = new Date(Date.now() - 900000).toISOString();

        const { data: rateLimitEvents, error } = await this.supabase
          .from('audit_logs')
          .select('*')
          .in('action', ['RATE_LIMIT_EXCEEDED', 'AUTH_RATE_LIMIT_EXCEEDED'])
          .gte('created_at', fifteenMinutesAgo);

        if (error) {
          console.error('Error fetching rate limit events:', error);
        } else if (rateLimitEvents && rateLimitEvents.length > this.alertThresholds.rateLimitHits) {
          await this.sendAlert('HIGH_RATE_LIMIT_HITS', {
            count: rateLimitEvents.length,
            threshold: this.alertThresholds.rateLimitHits,
            timeframe: '15 minutes',
            topIPs: this.getTopIPs(rateLimitEvents)
          });
        }

      } catch (error) {
        console.error('Error in rate limiting monitoring:', error);
      }

      await this.sleep(this.monitoringInterval);
    }
  }

  /**
   * Monitor suspicious activity
   */
  async monitorSuspiciousActivity() {
    while (this.isRunning) {
      try {
        console.log('🕵️ Monitoring suspicious activity...');

        const thirtyMinutesAgo = new Date(Date.now() - 1800000).toISOString();

        // Check for suspicious events
        const suspiciousEvents = [
          'MALICIOUS_REQUEST_BLOCKED',
          'SUSPICIOUS_IP_BLOCKED',
          'BOT_TRAFFIC_DETECTED',
          'CORS_VIOLATION'
        ];

        const { data: suspiciousActivity, error } = await this.supabase
          .from('audit_logs')
          .select('*')
          .in('action', suspiciousEvents)
          .gte('created_at', thirtyMinutesAgo);

        if (error) {
          console.error('Error fetching suspicious activity:', error);
        } else if (suspiciousActivity && suspiciousActivity.length > this.alertThresholds.unusualActivity) {
          await this.sendAlert('HIGH_SUSPICIOUS_ACTIVITY', {
            count: suspiciousActivity.length,
            threshold: this.alertThresholds.unusualActivity,
            timeframe: '30 minutes',
            breakdown: this.categorizeSuspiciousActivity(suspiciousActivity)
          });
        }

        // Check for new suspicious IPs
        await this.monitorSuspiciousIPs();

        // Check for privilege escalation attempts
        await this.detectPrivilegeEscalation();

      } catch (error) {
        console.error('Error in suspicious activity monitoring:', error);
      }

      await this.sleep(this.monitoringInterval);
    }
  }

  /**
   * Monitor system health from security perspective
   */
  async monitorSystemHealth() {
    while (this.isRunning) {
      try {
        console.log('💊 Monitoring system health...');

        // Check authentication service health
        const authHealthy = await this.checkAuthServiceHealth();
        if (!authHealthy) {
          await this.sendAlert('AUTH_SERVICE_DOWN', {
            service: 'authentication',
            timestamp: new Date().toISOString()
          });
        }

        // Check database connectivity
        const dbHealthy = await this.checkDatabaseHealth();
        if (!dbHealthy) {
          await this.sendAlert('DATABASE_CONNECTIVITY_ISSUE', {
            service: 'database',
            timestamp: new Date().toISOString()
          });
        }

        // Check for security configuration changes
        await this.monitorConfigurationChanges();

      } catch (error) {
        console.error('Error in system health monitoring:', error);
      }

      await this.sleep(this.monitoringInterval * 5); // Check every 5 minutes
    }
  }

  /**
   * Detect brute force attacks
   */
  async detectBruteForceAttacks() {
    const fifteenMinutesAgo = new Date(Date.now() - 900000).toISOString();

    const { data: events, error } = await this.supabase.rpc('detect_brute_force', {
      time_window: fifteenMinutesAgo,
      attempt_threshold: 10
    });

    if (error) {
      console.error('Error detecting brute force attacks:', error);
      return;
    }

    if (events && events.length > 0) {
      for (const attack of events) {
        await this.sendAlert('BRUTE_FORCE_DETECTED', {
          ip: attack.ip_address,
          attempts: attack.attempt_count,
          target: attack.target_email,
          timeframe: '15 minutes'
        });
      }
    }
  }

  /**
   * Detect unusual login patterns
   */
  async detectUnusualLoginPatterns() {
    const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();

    // Check for logins from new locations
    const { data: newLocationLogins, error } = await this.supabase.rpc('detect_new_location_logins', {
      time_window: twentyFourHoursAgo
    });

    if (error) {
      console.error('Error detecting new location logins:', error);
      return;
    }

    if (newLocationLogins && newLocationLogins.length > 0) {
      for (const login of newLocationLogins) {
        await this.sendAlert('UNUSUAL_LOGIN_LOCATION', {
          userId: login.user_id,
          newLocation: login.location,
          previousLocations: login.previous_locations
        });
      }
    }

    // Check for logins outside normal hours
    const { data: offHoursLogins, error: offHoursError } = await this.supabase.rpc('detect_off_hours_logins', {
      time_window: twentyFourHoursAgo
    });

    if (offHoursError) {
      console.error('Error detecting off-hours logins:', offHoursError);
      return;
    }

    if (offHoursLogins && offHoursLogins.length > 5) {
      await this.sendAlert('UNUSUAL_LOGIN_TIMES', {
        count: offHoursLogins.length,
        details: offHoursLogins
      });
    }
  }

  /**
   * Detect compromised accounts
   */
  async detectCompromisedAccounts() {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    // Check for rapid successive logins from different IPs
    const { data: suspiciousAccounts, error } = await this.supabase.rpc('detect_compromised_accounts', {
      time_window: oneHourAgo
    });

    if (error) {
      console.error('Error detecting compromised accounts:', error);
      return;
    }

    if (suspiciousAccounts && suspiciousAccounts.length > 0) {
      for (const account of suspiciousAccounts) {
        await this.sendAlert('POTENTIALLY_COMPROMISED_ACCOUNT', {
          userId: account.user_id,
          email: account.email,
          ipAddresses: account.ip_addresses,
          loginCount: account.login_count
        });

        // Optionally lock the account
        if (account.risk_score > 8) {
          await this.lockAccount(account.user_id, 'Suspected compromise');
        }
      }
    }
  }

  /**
   * Monitor suspicious IP addresses
   */
  async monitorSuspiciousIPs() {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { data: suspiciousIPs, error } = await this.supabase.rpc('get_suspicious_ips', {
      time_window: oneHourAgo,
      event_threshold: this.alertThresholds.suspiciousIPs
    });

    if (error) {
      console.error('Error monitoring suspicious IPs:', error);
      return;
    }

    if (suspiciousIPs && suspiciousIPs.length > 0) {
      await this.sendAlert('NEW_SUSPICIOUS_IPS', {
        count: suspiciousIPs.length,
        ips: suspiciousIPs.map(ip => ({
          address: ip.ip_address,
          events: ip.event_count,
          riskScore: ip.risk_score
        }))
      });
    }
  }

  /**
   * Detect privilege escalation attempts
   */
  async detectPrivilegeEscalation() {
    const thirtyMinutesAgo = new Date(Date.now() - 1800000).toISOString();

    const privilegeEvents = [
      'ROLE_CHANGE_ATTEMPT',
      'ADMIN_ACCESS_ATTEMPT',
      'PERMISSION_ESCALATION'
    ];

    const { data: escalationAttempts, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .in('action', privilegeEvents)
      .gte('created_at', thirtyMinutesAgo);

    if (error) {
      console.error('Error detecting privilege escalation:', error);
      return;
    }

    if (escalationAttempts && escalationAttempts.length > 0) {
      await this.sendAlert('PRIVILEGE_ESCALATION_DETECTED', {
        count: escalationAttempts.length,
        attempts: escalationAttempts
      });
    }
  }

  /**
   * Check authentication service health
   */
  async checkAuthServiceHealth() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Monitor configuration changes
   */
  async monitorConfigurationChanges() {
    // This would monitor changes to security configuration
    // Implementation depends on how configuration is stored and versioned
    console.log('📋 Checking configuration changes...');
  }

  /**
   * Lock suspicious account
   */
  async lockAccount(userId, reason) {
    try {
      const lockUntil = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          locked_until: lockUntil,
          lock_reason: reason
        })
        .eq('id', userId);

      if (!error) {
        console.log(`🔒 Account ${userId} locked due to: ${reason}`);

        await this.sendAlert('ACCOUNT_LOCKED', {
          userId,
          reason,
          lockUntil
        });
      }
    } catch (error) {
      console.error('Error locking account:', error);
    }
  }

  /**
   * Analyze failed login patterns
   */
  analyzeFailedLogins(failedLogins) {
    const ipCounts = {};
    const emailCounts = {};

    for (const login of failedLogins) {
      const ip = login.details?.ip;
      const email = login.details?.email;

      if (ip) {
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      }
      if (email) {
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      }
    }

    return {
      topIPs: Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      topTargets: Object.entries(emailCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  /**
   * Get top IPs from events
   */
  getTopIPs(events) {
    const ipCounts = {};

    for (const event of events) {
      const ip = event.details?.ip;
      if (ip) {
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      }
    }

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  /**
   * Categorize suspicious activity
   */
  categorizeSuspiciousActivity(activity) {
    const categories = {};

    for (const event of activity) {
      const action = event.action;
      categories[action] = (categories[action] || 0) + 1;
    }

    return categories;
  }

  /**
   * Send security alert
   */
  async sendAlert(type, data) {
    const alert = {
      type,
      severity: this.getAlertSeverity(type),
      timestamp: new Date().toISOString(),
      data,
      environment: process.env.NODE_ENV
    };

    console.log(`🚨 SECURITY ALERT [${alert.severity}]: ${type}`, alert);

    // Store alert in database
    await this.storeAlert(alert);

    // Send notifications based on severity
    if (alert.severity === 'critical' || alert.severity === 'high') {
      await this.sendImmediateNotification(alert);
    }

    // Update security dashboard
    await this.updateSecurityDashboard(alert);
  }

  /**
   * Get alert severity
   */
  getAlertSeverity(type) {
    const criticalAlerts = [
      'BRUTE_FORCE_DETECTED',
      'POTENTIALLY_COMPROMISED_ACCOUNT',
      'AUTH_SERVICE_DOWN',
      'DATABASE_CONNECTIVITY_ISSUE'
    ];

    const highAlerts = [
      'HIGH_FAILED_LOGINS',
      'PRIVILEGE_ESCALATION_DETECTED',
      'ACCOUNT_LOCKED'
    ];

    const mediumAlerts = [
      'HIGH_RATE_LIMIT_HITS',
      'NEW_SUSPICIOUS_IPS',
      'UNUSUAL_LOGIN_LOCATION'
    ];

    if (criticalAlerts.includes(type)) return 'critical';
    if (highAlerts.includes(type)) return 'high';
    if (mediumAlerts.includes(type)) return 'medium';
    return 'low';
  }

  /**
   * Store alert in database
   */
  async storeAlert(alert) {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .insert({
          alert_type: alert.type,
          severity: alert.severity,
          data: alert.data,
          resolved: false,
          created_at: alert.timestamp
        });

      if (error) {
        console.error('Error storing alert:', error);
      }
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  /**
   * Send immediate notification
   */
  async sendImmediateNotification(alert) {
    // Implementation would depend on notification channels
    // - Email
    // - Slack/Teams webhook
    // - PagerDuty
    // - SMS

    console.log('📧 Sending immediate notification for critical alert:', alert.type);
  }

  /**
   * Update security dashboard
   */
  async updateSecurityDashboard(alert) {
    // Update real-time security dashboard metrics
    console.log('📊 Updating security dashboard with new alert');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const monitor = new SecurityMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n📢 Received SIGINT, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n📢 Received SIGTERM, shutting down gracefully...');
    monitor.stop();
    process.exit(0);
  });

  try {
    await monitor.start();
  } catch (error) {
    console.error('💥 Security monitoring failed to start:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecurityMonitor;