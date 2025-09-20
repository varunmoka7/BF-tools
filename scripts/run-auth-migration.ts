#!/usr/bin/env node

/**
 * Authentication Migration Runner for Waste Intelligence Platform
 * Executes authentication schema setup and configuration
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import SupabaseConnection from '../backend/src/database/supabase-connection';
import SupabaseAuthConfig from '../backend/src/config/supabase-auth-config';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runAuthMigration() {
  let db: SupabaseConnection | null = null;

  try {
    console.log('🚀 Starting authentication migration...\n');

    // Initialize database connection
    console.log('📡 Connecting to database...');
    db = SupabaseConnection.getInstance();

    // Test connection
    const healthCheck = await db.healthCheck();
    if (!healthCheck.postgres) {
      throw new Error('PostgreSQL connection failed');
    }
    if (!healthCheck.supabase) {
      throw new Error('Supabase connection failed');
    }
    console.log('✅ Database connection established\n');

    // Run authentication schema migration
    console.log('📋 Running authentication schema migration...');
    await db.initializeAuthSchema();
    console.log('✅ Authentication schema migration completed\n');

    // Initialize auth configuration
    console.log('⚙️  Initializing authentication configuration...');
    const authConfig = new SupabaseAuthConfig();
    await authConfig.initializeAuthConfig();
    console.log('✅ Authentication configuration completed\n');

    // Create default super admin user (if needed)
    console.log('👤 Setting up default super admin...');
    await createDefaultSuperAdmin(db);
    console.log('✅ Default super admin setup completed\n');

    // Create sample data (for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Creating sample development data...');
      await createSampleData(db);
      console.log('✅ Sample data creation completed\n');
    }

    console.log('🎉 Authentication migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Configure email templates in Supabase Dashboard');
    console.log('2. Set up external auth providers (if needed)');
    console.log('3. Configure email delivery settings');
    console.log('4. Test authentication flow');

  } catch (error) {
    console.error('❌ Authentication migration failed:', error);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

/**
 * Create default super admin user
 */
async function createDefaultSuperAdmin(db: SupabaseConnection): Promise<void> {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@wasteintelligence.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123!';

    // Check if super admin already exists
    const existingAdmin = await db.queryOne(
      'SELECT id FROM user_profiles WHERE role = $1 LIMIT 1',
      ['super_admin']
    );

    if (existingAdmin) {
      console.log('   Super admin already exists, skipping...');
      return;
    }

    // Create auth user
    const { user, error } = await db.signUp(adminEmail, adminPassword, {
      full_name: 'System Administrator',
      role: 'super_admin'
    });

    if (error) {
      console.error('   Failed to create super admin auth user:', error);
      return;
    }

    if (!user) {
      console.error('   No user returned from signup');
      return;
    }

    // Update profile to super admin
    await db.updateUserProfile(user.id, {
      role: 'super_admin' as any,
      full_name: 'System Administrator',
      is_active: true,
      email_verified: true
    });

    console.log(`   Super admin created: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('   Error creating default super admin:', error);
  }
}

/**
 * Create sample data for development
 */
async function createSampleData(db: SupabaseConnection): Promise<void> {
  try {
    // Create sample users
    const sampleUsers = [
      {
        email: 'john.analyst@example.com',
        password: 'password123!',
        profile: {
          full_name: 'John Analyst',
          role: 'analyst',
          job_title: 'Waste Data Analyst',
          department: 'Sustainability'
        }
      },
      {
        email: 'sarah.manager@example.com',
        password: 'password123!',
        profile: {
          full_name: 'Sarah Manager',
          role: 'manager',
          job_title: 'Sustainability Manager',
          department: 'Environmental'
        }
      },
      {
        email: 'mike.viewer@example.com',
        password: 'password123!',
        profile: {
          full_name: 'Mike Viewer',
          role: 'viewer',
          job_title: 'Environmental Coordinator',
          department: 'Operations'
        }
      }
    ];

    for (const userData of sampleUsers) {
      const { user, error } = await db.signUp(
        userData.email,
        userData.password,
        userData.profile
      );

      if (!error && user) {
        await db.updateUserProfile(user.id, {
          ...userData.profile,
          is_active: true,
          email_verified: true
        } as any);

        console.log(`   Created sample user: ${userData.email}`);
      }
    }

    // Grant company access to sample users
    await grantSampleCompanyAccess(db);

    console.log('   Sample development data created');

  } catch (error) {
    console.error('   Error creating sample data:', error);
  }
}

/**
 * Grant sample company access
 */
async function grantSampleCompanyAccess(db: SupabaseConnection): Promise<void> {
  try {
    // Get first few companies for testing
    const companies = await db.query(
      'SELECT id FROM companies LIMIT 3'
    );

    if (companies.length === 0) {
      console.log('   No companies found, skipping access grants');
      return;
    }

    // Get sample users
    const users = await db.query(
      `SELECT id, email, role FROM user_profiles
       WHERE email LIKE '%@example.com' AND role != 'super_admin'`
    );

    for (const user of users) {
      for (const company of companies) {
        const permissions = {
          read: true,
          write: user.role !== 'viewer',
          delete: user.role === 'manager',
          export: true,
          manage_users: user.role === 'manager',
          view_financials: user.role !== 'viewer',
          view_opportunities: true,
          manage_opportunities: user.role !== 'viewer'
        };

        await db.grantCompanyAccess(
          user.id,
          company.id,
          user.role === 'manager' ? 'admin' : 'viewer',
          permissions,
          user.id // Self-granted for demo
        );
      }

      console.log(`   Granted company access to: ${user.email}`);
    }

  } catch (error) {\n    console.error('   Error granting sample company access:', error);\n  }\n}\n\n/**\n * Show configuration summary\n */\nfunction showConfigSummary(): void {\n  console.log('\\n📊 Configuration Summary:');\n  console.log('========================');\n  console.log(`Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);\n  console.log(`Supabase URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);\n  console.log(`Supabase Anon Key: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);\n  console.log(`Supabase Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);\n  console.log(`Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`);\n  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);\n}\n\n/**\n * Main execution\n */\nif (require.main === module) {\n  console.log('🔐 Waste Intelligence Platform - Authentication Migration');\n  console.log('=========================================================\\n');\n  \n  showConfigSummary();\n  \n  runAuthMigration()\n    .then(() => {\n      process.exit(0);\n    })\n    .catch((error) => {\n      console.error('Migration failed:', error);\n      process.exit(1);\n    });\n}\n\nexport { runAuthMigration, createDefaultSuperAdmin, createSampleData };"