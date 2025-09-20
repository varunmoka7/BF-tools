#!/usr/bin/env node

/**
 * Authentication Security Report Script
 * Generates comprehensive security analysis and recommendations
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import SupabaseConnection from '../backend/src/database/supabase-connection';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface SecurityMetrics {
  activeUsers: number;
  lockedAccounts: number;
  recentFailedLogins: number;
  activeSessions: number;
  expiredSessions: number;
  recentPasswordChanges: number;
  twoFactorEnabled: number;
  adminUsers: number;
  pendingInvitations: number;
  recentAuditLogs: number;
  suspiciousActivity: any[];
  vulnerabilities: string[];
  recommendations: string[];
}

async function generateSecurityReport() {
  let db: SupabaseConnection | null = null;

  try {
    console.log('🔒 Generating authentication security report...\n');

    // Initialize database connection
    console.log('📡 Connecting to database...');
    db = SupabaseConnection.getInstance();

    // Test connection
    const healthCheck = await db.healthCheck();
    if (!healthCheck.postgres) {
      throw new Error('PostgreSQL connection failed');
    }
    console.log('✅ Database connection established\n');

    console.log('📊 Collecting security metrics...');
    const metrics = await collectSecurityMetrics(db);

    console.log('🔍 Analyzing security posture...');
    const analysis = analyzeSecurityMetrics(metrics);

    console.log('📝 Generating report...');
    const report = generateReport(metrics, analysis);

    // Save report to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../reports/security-report-${timestamp}.json`);

    // Ensure reports directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    displaySecuritySummary(metrics, analysis);

    console.log(`\\n📄 Full report saved to: ${reportPath}`);
    console.log('\\n✅ Security report generation completed!');

  } catch (error) {
    console.error('❌ Security report generation failed:', error);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

async function collectSecurityMetrics(db: SupabaseConnection): Promise<SecurityMetrics> {
  const metrics: SecurityMetrics = {
    activeUsers: 0,
    lockedAccounts: 0,
    recentFailedLogins: 0,
    activeSessions: 0,
    expiredSessions: 0,
    recentPasswordChanges: 0,
    twoFactorEnabled: 0,
    adminUsers: 0,
    pendingInvitations: 0,
    recentAuditLogs: 0,
    suspiciousActivity: [],
    vulnerabilities: [],
    recommendations: []
  };

  // Active users count
  const activeUsersResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles WHERE is_active = true
  `);
  metrics.activeUsers = parseInt(activeUsersResult[0]?.count || '0');

  // Locked accounts
  const lockedAccountsResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles
    WHERE locked_until IS NOT NULL AND locked_until > NOW()
  `);
  metrics.lockedAccounts = parseInt(lockedAccountsResult[0]?.count || '0');

  // Recent failed logins (last 24 hours)
  const failedLoginsResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles
    WHERE failed_login_attempts > 0
  `);
  metrics.recentFailedLogins = parseInt(failedLoginsResult[0]?.count || '0');

  // Active sessions
  const activeSessionsResult = await db.query(`
    SELECT COUNT(*) as count FROM user_sessions
    WHERE is_active = true AND expires_at > NOW()
  `);
  metrics.activeSessions = parseInt(activeSessionsResult[0]?.count || '0');

  // Expired sessions
  const expiredSessionsResult = await db.query(`
    SELECT COUNT(*) as count FROM user_sessions
    WHERE is_active = true AND expires_at <= NOW()
  `);
  metrics.expiredSessions = parseInt(expiredSessionsResult[0]?.count || '0');

  // Recent password changes (last 30 days)
  const passwordChangesResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles
    WHERE password_changed_at > NOW() - INTERVAL '30 days'
  `);
  metrics.recentPasswordChanges = parseInt(passwordChangesResult[0]?.count || '0');

  // Two-factor enabled users
  const twoFactorResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles
    WHERE two_factor_enabled = true
  `);
  metrics.twoFactorEnabled = parseInt(twoFactorResult[0]?.count || '0');

  // Admin users
  const adminUsersResult = await db.query(`
    SELECT COUNT(*) as count FROM user_profiles
    WHERE role IN ('super_admin', 'admin') AND is_active = true
  `);
  metrics.adminUsers = parseInt(adminUsersResult[0]?.count || '0');

  // Pending invitations
  const pendingInvitationsResult = await db.query(`
    SELECT COUNT(*) as count FROM user_invitations
    WHERE status = 'pending' AND expires_at > NOW()
  `);
  metrics.pendingInvitations = parseInt(pendingInvitationsResult[0]?.count || '0');

  // Recent audit logs (last 24 hours)
  const auditLogsResult = await db.query(`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE timestamp > NOW() - INTERVAL '24 hours'
  `);
  metrics.recentAuditLogs = parseInt(auditLogsResult[0]?.count || '0');

  // Suspicious activity detection
  metrics.suspiciousActivity = await detectSuspiciousActivity(db);

  return metrics;
}

async function detectSuspiciousActivity(db: SupabaseConnection): Promise<any[]> {
  const suspicious = [];

  // Multiple failed logins from same IP
  const ipFailures = await db.query(`
    SELECT
      ip_address,
      COUNT(*) as failure_count,
      COUNT(DISTINCT user_id) as affected_users
    FROM audit_logs
    WHERE action = 'USER_LOGIN'
      AND success = false
      AND timestamp > NOW() - INTERVAL '24 hours'
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(*) > 5
    ORDER BY failure_count DESC
  `);

  for (const ip of ipFailures) {
    suspicious.push({
      type: 'multiple_failed_logins',
      severity: 'high',
      details: `IP ${ip.ip_address} had ${ip.failure_count} failed login attempts affecting ${ip.affected_users} users`,
      ip_address: ip.ip_address,
      count: ip.failure_count
    });
  }

  // Users with many failed attempts
  const userFailures = await db.query(`
    SELECT
      up.email,
      up.failed_login_attempts,
      up.locked_until
    FROM user_profiles up
    WHERE up.failed_login_attempts > 3
    ORDER BY up.failed_login_attempts DESC
  `);

  for (const user of userFailures) {
    suspicious.push({
      type: 'high_failed_attempts',
      severity: user.locked_until ? 'medium' : 'high',
      details: `User ${user.email} has ${user.failed_login_attempts} failed login attempts`,
      email: user.email,
      attempts: user.failed_login_attempts,
      locked: !!user.locked_until
    });
  }

  // Unusual login patterns (different countries in short time)
  const locationAnomalies = await db.query(`
    SELECT
      us.user_id,
      up.email,
      COUNT(DISTINCT us.location_info->>'country') as country_count,
      MAX(us.login_at) as last_login
    FROM user_sessions us
    JOIN user_profiles up ON us.user_id = up.id
    WHERE us.login_at > NOW() - INTERVAL '24 hours'
      AND us.location_info->>'country' IS NOT NULL
    GROUP BY us.user_id, up.email
    HAVING COUNT(DISTINCT us.location_info->>'country') > 1
  `);

  for (const anomaly of locationAnomalies) {
    suspicious.push({
      type: 'location_anomaly',
      severity: 'medium',
      details: `User ${anomaly.email} logged in from ${anomaly.country_count} different countries in 24 hours`,
      email: anomaly.email,
      countries: anomaly.country_count
    });
  }

  // Sessions without recent activity
  const staleSessions = await db.query(`
    SELECT COUNT(*) as count
    FROM user_sessions
    WHERE is_active = true
      AND last_activity_at < NOW() - INTERVAL '7 days'
  `);

  if (parseInt(staleSessions[0]?.count || '0') > 0) {
    suspicious.push({
      type: 'stale_sessions',
      severity: 'low',
      details: `${staleSessions[0].count} active sessions without activity for >7 days`,
      count: staleSessions[0].count
    });
  }

  return suspicious;
}

function analyzeSecurityMetrics(metrics: SecurityMetrics): { vulnerabilities: string[]; recommendations: string[] } {
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  // Analyze user security
  const twoFactorRate = (metrics.twoFactorEnabled / metrics.activeUsers) * 100;
  if (twoFactorRate < 50) {
    vulnerabilities.push('Low two-factor authentication adoption rate');
    recommendations.push('Encourage or enforce 2FA for all users, especially admins');
  }

  // Analyze admin security
  if (metrics.adminUsers > metrics.activeUsers * 0.1) {
    vulnerabilities.push('High percentage of admin users');
    recommendations.push('Review admin permissions and apply principle of least privilege');
  }

  // Analyze session management
  if (metrics.expiredSessions > 0) {
    vulnerabilities.push('Expired sessions still marked as active');
    recommendations.push('Implement automated session cleanup process');
  }

  // Analyze failed logins
  if (metrics.recentFailedLogins > metrics.activeUsers * 0.1) {
    vulnerabilities.push('High rate of failed login attempts');
    recommendations.push('Implement additional monitoring and potentially stricter lockout policies');
  }

  // Analyze password security
  const passwordChangeRate = (metrics.recentPasswordChanges / metrics.activeUsers) * 100;
  if (passwordChangeRate < 10) {
    vulnerabilities.push('Low password change frequency');
    recommendations.push('Implement password expiration policy and encourage regular changes');
  }

  // Analyze suspicious activity
  const highSeverityActivity = metrics.suspiciousActivity.filter(a => a.severity === 'high');
  if (highSeverityActivity.length > 0) {
    vulnerabilities.push('High-severity suspicious activity detected');
    recommendations.push('Investigate suspicious activity and consider implementing rate limiting');
  }

  // General recommendations
  if (metrics.pendingInvitations > 20) {
    recommendations.push('Review and clean up old pending invitations');
  }

  if (metrics.lockedAccounts > 0) {
    recommendations.push('Review locked accounts and implement account recovery process');
  }

  recommendations.push('Regular security audits and penetration testing');
  recommendations.push('Implement security awareness training for users');
  recommendations.push('Consider implementing SSO for better security management');

  return { vulnerabilities, recommendations };
}

function generateReport(metrics: SecurityMetrics, analysis: { vulnerabilities: string[]; recommendations: string[] }) {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      overallRisk: calculateOverallRisk(metrics, analysis),
      criticalIssues: analysis.vulnerabilities.length,
      highPriorityRecommendations: analysis.recommendations.slice(0, 5)
    },
    metrics,
    analysis,
    details: {
      userSecurity: {
        twoFactorAdoptionRate: `${((metrics.twoFactorEnabled / metrics.activeUsers) * 100).toFixed(1)}%`,
        adminPercentage: `${((metrics.adminUsers / metrics.activeUsers) * 100).toFixed(1)}%`,
        passwordChangeRate: `${((metrics.recentPasswordChanges / metrics.activeUsers) * 100).toFixed(1)}%`
      },
      sessionSecurity: {
        activeSessionsPerUser: (metrics.activeSessions / metrics.activeUsers).toFixed(1),
        expiredSessionRate: `${((metrics.expiredSessions / (metrics.activeSessions + metrics.expiredSessions)) * 100).toFixed(1)}%`
      },
      threatLevel: {
        suspiciousActivityCount: metrics.suspiciousActivity.length,
        highSeverityThreats: metrics.suspiciousActivity.filter(a => a.severity === 'high').length,
        failedLoginRate: `${((metrics.recentFailedLogins / metrics.activeUsers) * 100).toFixed(1)}%`
      }
    }
  };
}

function calculateOverallRisk(metrics: SecurityMetrics, analysis: { vulnerabilities: string[]; recommendations: string[] }): string {
  let riskScore = 0;

  // High risk factors
  if (analysis.vulnerabilities.length > 5) riskScore += 30;
  if (metrics.suspiciousActivity.filter(a => a.severity === 'high').length > 0) riskScore += 25;
  if ((metrics.twoFactorEnabled / metrics.activeUsers) < 0.3) riskScore += 20;

  // Medium risk factors
  if (metrics.expiredSessions > 0) riskScore += 15;
  if ((metrics.recentFailedLogins / metrics.activeUsers) > 0.1) riskScore += 15;
  if (metrics.lockedAccounts > metrics.activeUsers * 0.05) riskScore += 10;

  // Low risk factors
  if (metrics.pendingInvitations > 20) riskScore += 5;
  if ((metrics.adminUsers / metrics.activeUsers) > 0.15) riskScore += 5;

  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 30) return 'MEDIUM';
  return 'LOW';
}

function displaySecuritySummary(metrics: SecurityMetrics, analysis: { vulnerabilities: string[]; recommendations: string[] }) {
  console.log('\\n🔒 Security Report Summary');
  console.log('===========================');

  const overallRisk = calculateOverallRisk(metrics, analysis);
  const riskIcon = overallRisk === 'HIGH' ? '🔴' : overallRisk === 'MEDIUM' ? '🟡' : '🟢';

  console.log(`${riskIcon} Overall Risk Level: ${overallRisk}`);
  console.log('');

  console.log('📊 Key Metrics:');
  console.log(`   Active Users: ${metrics.activeUsers}`);
  console.log(`   Active Sessions: ${metrics.activeSessions}`);
  console.log(`   2FA Enabled: ${metrics.twoFactorEnabled} (${((metrics.twoFactorEnabled / metrics.activeUsers) * 100).toFixed(1)}%)`);
  console.log(`   Admin Users: ${metrics.adminUsers}`);
  console.log(`   Locked Accounts: ${metrics.lockedAccounts}`);
  console.log(`   Failed Logins: ${metrics.recentFailedLogins}`);
  console.log('');

  console.log('⚠️  Vulnerabilities Found:');
  if (analysis.vulnerabilities.length === 0) {
    console.log('   None detected');
  } else {
    analysis.vulnerabilities.forEach((vuln, index) => {
      console.log(`   ${index + 1}. ${vuln}`);
    });
  }
  console.log('');

  console.log('🎯 Top Recommendations:');
  analysis.recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
  console.log('');

  if (metrics.suspiciousActivity.length > 0) {
    console.log('🚨 Suspicious Activity:');
    metrics.suspiciousActivity.forEach((activity, index) => {
      const severityIcon = activity.severity === 'high' ? '🔴' : activity.severity === 'medium' ? '🟡' : '🟠';
      console.log(`   ${severityIcon} ${activity.details}`);
    });
    console.log('');
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  console.log('🔐 Waste Intelligence Platform - Security Report');
  console.log('=================================================\\n');

  generateSecurityReport()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Report generation failed:', error);
      process.exit(1);
    });
}

export { generateSecurityReport };