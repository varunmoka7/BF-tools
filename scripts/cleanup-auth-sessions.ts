#!/usr/bin/env node

/**
 * Authentication Session Cleanup Script
 * Removes expired sessions and inactive user data
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import SupabaseConnection from '../backend/src/database/supabase-connection';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function cleanupAuthSessions() {
  let db: SupabaseConnection | null = null;

  try {
    console.log('🧹 Starting authentication session cleanup...\n');

    // Initialize database connection
    console.log('📡 Connecting to database...');
    db = SupabaseConnection.getInstance();

    // Test connection
    const healthCheck = await db.healthCheck();
    if (!healthCheck.postgres) {
      throw new Error('PostgreSQL connection failed');
    }
    console.log('✅ Database connection established\n');

    // Cleanup expired sessions
    console.log('🗑️  Cleaning up expired sessions...');
    const expiredSessions = await db.query(`
      SELECT COUNT(*) as count FROM user_sessions
      WHERE expires_at <= NOW() AND is_active = true
    `);

    await db.query(`
      UPDATE user_sessions
      SET is_active = false, logout_reason = 'expired'
      WHERE expires_at <= NOW() AND is_active = true
    `);

    console.log(`   Deactivated ${expiredSessions[0]?.count || 0} expired sessions`);

    // Cleanup old inactive sessions (older than 30 days)
    console.log('🗑️  Cleaning up old inactive sessions...');
    const oldSessions = await db.query(`
      SELECT COUNT(*) as count FROM user_sessions
      WHERE is_active = false AND logout_at <= NOW() - INTERVAL '30 days'
    `);

    await db.query(`
      DELETE FROM user_sessions
      WHERE is_active = false AND logout_at <= NOW() - INTERVAL '30 days'
    `);

    console.log(`   Deleted ${oldSessions[0]?.count || 0} old sessions`);

    // Cleanup expired invitations
    console.log('📨 Cleaning up expired invitations...');
    const expiredInvitations = await db.query(`
      SELECT COUNT(*) as count FROM user_invitations
      WHERE status = 'pending' AND expires_at <= NOW()
    `);

    await db.query(`
      UPDATE user_invitations
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at <= NOW()
    `);

    console.log(`   Marked ${expiredInvitations[0]?.count || 0} invitations as expired`);

    // Reset locked accounts (older than 24 hours)
    console.log('🔓 Resetting old account locks...');
    const lockedAccounts = await db.query(`
      SELECT COUNT(*) as count FROM user_profiles
      WHERE locked_until IS NOT NULL AND locked_until <= NOW()
    `);

    await db.query(`
      UPDATE user_profiles
      SET locked_until = NULL, failed_login_attempts = 0
      WHERE locked_until IS NOT NULL AND locked_until <= NOW()
    `);

    console.log(`   Reset ${lockedAccounts[0]?.count || 0} account locks`);

    // Archive old audit logs (older than 1 year) - optional
    if (process.env.ARCHIVE_OLD_LOGS === 'true') {
      console.log('📦 Archiving old audit logs...');
      const oldLogs = await db.query(`
        SELECT COUNT(*) as count FROM audit_logs
        WHERE timestamp <= NOW() - INTERVAL '1 year'
      `);

      // In a real scenario, you might move these to an archive table
      // For now, we'll just report the count
      console.log(`   Found ${oldLogs[0]?.count || 0} logs older than 1 year (not deleted)`);
    }

    // Generate cleanup summary
    console.log('\\n📊 Cleanup Summary:');
    console.log('===================');

    const activeSessions = await db.query(`
      SELECT COUNT(*) as count FROM user_sessions WHERE is_active = true
    `);

    const activeUsers = await db.query(`
      SELECT COUNT(*) as count FROM user_profiles WHERE is_active = true
    `);

    const pendingInvitations = await db.query(`
      SELECT COUNT(*) as count FROM user_invitations WHERE status = 'pending'
    `);

    console.log(`Active sessions: ${activeSessions[0]?.count || 0}`);
    console.log(`Active users: ${activeUsers[0]?.count || 0}`);
    console.log(`Pending invitations: ${pendingInvitations[0]?.count || 0}`);

    console.log('\\n✅ Authentication cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Authentication cleanup failed:', error);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

/**
 * Main execution
 */
if (require.main === module) {
  console.log('🔐 Waste Intelligence Platform - Session Cleanup');
  console.log('================================================\\n');

  cleanupAuthSessions()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupAuthSessions };