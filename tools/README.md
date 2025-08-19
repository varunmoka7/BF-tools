# Development Tools

Automation scripts, testing utilities, and development tools for the BF-Tools platform.

## 📁 Directory Structure

```
tools/
├── scripts/           # Utility scripts
│   ├── database/     # Database management scripts
│   ├── deployment/   # Deployment automation
│   ├── data/         # Data processing scripts
│   └── development/  # Development helpers
├── automation/       # Automated workflows
│   ├── ci-cd/       # CI/CD pipeline scripts
│   ├── testing/     # Test automation
│   ├── monitoring/  # Health monitoring
│   └── backup/      # Backup automation
├── testing/          # Testing utilities
│   ├── fixtures/    # Test data fixtures
│   ├── mocks/       # Mock services
│   ├── helpers/     # Test helper functions
│   └── performance/ # Performance testing
└── generators/       # Code generators
    ├── api/         # API endpoint generators
    ├── components/  # Component generators
    └── database/    # Database schema generators
```

## 🛠️ Database Scripts (`scripts/database/`)

### Schema Management

#### `setup-database.js`
Complete database initialization:
```javascript
/**
 * Database Setup Script
 * Initializes the complete database schema, indexes, and seed data
 */
const setupDatabase = async () => {
  console.log('🚀 Setting up BF-Tools database...');
  
  try {
    // Create database if it doesn't exist
    await createDatabase();
    
    // Run migrations
    await runMigrations();
    
    // Create indexes
    await createIndexes();
    
    // Seed initial data
    await seedData();
    
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};
```

#### `create-supabase-schema.js`
Supabase-specific schema creation:
```javascript
/**
 * Supabase Schema Creator
 * Creates tables, RLS policies, and functions in Supabase
 */
const createSupabaseSchema = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Create tables
  await createTables(supabase);
  
  // Setup Row Level Security
  await setupRLS(supabase);
  
  // Create database functions
  await createFunctions(supabase);
  
  // Setup real-time subscriptions
  await setupRealtime(supabase);
};
```

#### `check-table-structure.js`
Database integrity verification:
```javascript
/**
 * Table Structure Checker
 * Validates database schema integrity and reports issues
 */
const checkTableStructure = async () => {
  const issues = [];
  
  // Check required tables exist
  const requiredTables = ['waste_data', 'companies', 'sectors'];
  for (const table of requiredTables) {
    if (!(await tableExists(table))) {
      issues.push(`Missing table: ${table}`);
    }
  }
  
  // Check column types and constraints
  await validateTableColumns();
  
  // Check foreign key relationships
  await validateForeignKeys();
  
  // Check indexes
  await validateIndexes();
  
  return issues;
};
```

### Data Management

#### `import-csv-to-supabase.js`
CSV data import utility:
```javascript
/**
 * CSV to Supabase Importer
 * Imports CSV files with validation and error handling
 */
const importCSVToSupabase = async (filePath, tableName, options = {}) => {
  const results = {
    total: 0,
    imported: 0,
    errors: [],
    duration: 0
  };
  
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        results.total++;
        
        try {
          // Validate row data
          const validatedRow = validateRowData(row, tableName);
          
          // Transform data if needed
          const transformedRow = transformRowData(validatedRow, options.transform);
          
          // Insert into Supabase
          const { error } = await supabase
            .from(tableName)
            .insert(transformedRow);
            
          if (error) throw error;
          
          results.imported++;
        } catch (error) {
          results.errors.push({
            row: results.total,
            error: error.message,
            data: row
          });
        }
      })
      .on('end', () => {
        results.duration = Date.now() - startTime;
        resolve(results);
      })
      .on('error', reject);
  });
};
```

#### `seed-data.js`
Sample data seeding:
```javascript
/**
 * Data Seeding Script
 * Populates database with sample data for development and testing
 */
const seedData = async () => {
  console.log('🌱 Seeding database with sample data...');
  
  // Seed sectors
  await seedSectors();
  
  // Seed companies
  await seedCompanies();
  
  // Seed waste data
  await seedWasteData();
  
  console.log('✅ Data seeding completed!');
};

const seedSectors = async () => {
  const sectors = [
    { name: 'Manufacturing', category: 'industrial' },
    { name: 'Retail', category: 'commercial' },
    { name: 'Healthcare', category: 'institutional' },
    { name: 'Technology', category: 'commercial' },
    // ... more sectors
  ];
  
  for (const sector of sectors) {
    await supabase.from('sectors').insert(sector);
  }
};
```

## 🔄 Automation Scripts (`automation/`)

### CI/CD Pipeline (`automation/ci-cd/`)

#### `deploy.js`
Automated deployment script:
```javascript
/**
 * Deployment Automation
 * Handles frontend and backend deployment with health checks
 */
const deploy = async (environment = 'staging') => {
  console.log(`🚀 Deploying to ${environment}...`);
  
  try {
    // Pre-deployment checks
    await runPreDeploymentChecks();
    
    // Build applications
    await buildFrontend();
    await buildBackend();
    
    // Run tests
    await runTestSuite();
    
    // Deploy to environment
    await deployToEnvironment(environment);
    
    // Post-deployment verification
    await runHealthChecks(environment);
    
    console.log('✅ Deployment completed successfully!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    await rollback(environment);
    process.exit(1);
  }
};
```

#### `health-check.js`
Service health monitoring:
```javascript
/**
 * Health Check Automation
 * Monitors service health and reports issues
 */
const performHealthCheck = async (services = []) => {
  const results = {};
  
  for (const service of services) {
    try {
      const health = await checkServiceHealth(service);
      results[service.name] = {
        status: 'healthy',
        responseTime: health.responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      results[service.name] = {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
  
  return results;
};
```

### Testing Automation (`automation/testing/`)

#### `run-tests.js`
Comprehensive test runner:
```javascript
/**
 * Test Suite Runner
 * Executes all test suites with reporting
 */
const runTestSuite = async (options = {}) => {
  const results = {
    unit: { passed: 0, failed: 0, duration: 0 },
    integration: { passed: 0, failed: 0, duration: 0 },
    e2e: { passed: 0, failed: 0, duration: 0 }
  };
  
  // Run unit tests
  if (!options.skipUnit) {
    console.log('🧪 Running unit tests...');
    results.unit = await runUnitTests();
  }
  
  // Run integration tests
  if (!options.skipIntegration) {
    console.log('🔗 Running integration tests...');
    results.integration = await runIntegrationTests();
  }
  
  // Run E2E tests
  if (!options.skipE2E) {
    console.log('🎭 Running E2E tests...');
    results.e2e = await runE2ETests();
  }
  
  // Generate report
  await generateTestReport(results);
  
  return results;
};
```

## 🧪 Testing Utilities (`testing/`)

### Test Fixtures (`testing/fixtures/`)

#### Sample Data Fixtures
```javascript
/**
 * Test Data Fixtures
 * Provides consistent test data across test suites
 */
export const fixtures = {
  companies: [
    {
      id: 'company-1',
      name: 'EcoTech Solutions',
      sector: 'technology',
      region: 'North America',
      sizeCategory: 'medium'
    },
    // ... more companies
  ],
  
  wasteData: [
    {
      id: 'waste-1',
      companyId: 'company-1',
      wasteType: 'plastic',
      quantity: 500,
      unit: 'kg',
      date: '2024-01-15'
    },
    // ... more waste data
  ],
  
  users: [
    {
      id: 'user-1',
      email: 'admin@test.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    },
    // ... more users
  ]
};
```

### Mock Services (`testing/mocks/`)

#### API Mocks
```javascript
/**
 * Mock API Services
 * Provides mock implementations for external services
 */
export class MockSupabaseClient {
  constructor() {
    this.data = new Map();
  }
  
  from(table) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          data: this.data.get(table)?.filter(row => row[column] === value) || [],
          error: null
        })
      }),
      
      insert: (data) => {
        if (!this.data.has(table)) {
          this.data.set(table, []);
        }
        this.data.get(table).push({ ...data, id: generateId() });
        return { data, error: null };
      }
    };
  }
}
```

### Performance Testing (`testing/performance/`)

#### Load Testing
```javascript
/**
 * Load Testing Utilities
 * Tests application performance under load
 */
const runLoadTest = async (config) => {
  const {
    url,
    concurrent = 10,
    duration = 60,
    rampUp = 10
  } = config;
  
  console.log(`🏋️ Starting load test: ${concurrent} users for ${duration}s`);
  
  const results = [];
  const startTime = Date.now();
  
  // Ramp up users gradually
  for (let i = 0; i < concurrent; i++) {
    setTimeout(() => {
      simulateUser(url, duration, results);
    }, (i * rampUp * 1000) / concurrent);
  }
  
  // Wait for test completion
  await sleep((rampUp + duration) * 1000);
  
  return analyzeResults(results);
};
```

## 🎯 Code Generators (`generators/`)

### API Generator (`generators/api/`)

#### `generate-api-endpoint.js`
Creates new API endpoints:
```javascript
/**
 * API Endpoint Generator
 * Generates complete CRUD endpoints with tests
 */
const generateAPIEndpoint = async (entityName, options = {}) => {
  const {
    includeAuth = true,
    includeValidation = true,
    includeTests = true
  } = options;
  
  // Generate route handler
  await generateRouteHandler(entityName, options);
  
  // Generate validation schema
  if (includeValidation) {
    await generateValidationSchema(entityName);
  }
  
  // Generate tests
  if (includeTests) {
    await generateEndpointTests(entityName);
  }
  
  // Update route index
  await updateRouteIndex(entityName);
  
  console.log(`✅ Generated API endpoint for ${entityName}`);
};
```

### Component Generator (`generators/components/`)

#### `generate-component.js`
Creates React components:
```javascript
/**
 * React Component Generator
 * Generates component with TypeScript, styles, and tests
 */
const generateComponent = async (componentName, type = 'functional') => {
  const templates = {
    functional: 'functional-component.template.tsx',
    class: 'class-component.template.tsx',
    hook: 'custom-hook.template.ts'
  };
  
  // Generate component file
  await generateFromTemplate(
    templates[type],
    `src/components/${componentName}.tsx`,
    { componentName }
  );
  
  // Generate test file
  await generateFromTemplate(
    'component-test.template.tsx',
    `src/components/__tests__/${componentName}.test.tsx`,
    { componentName }
  );
  
  // Generate story file (if Storybook)
  await generateFromTemplate(
    'component-story.template.tsx',
    `src/components/${componentName}.stories.tsx`,
    { componentName }
  );
  
  console.log(`✅ Generated component ${componentName}`);
};
```

## 📊 Monitoring Tools (`automation/monitoring/`)

### System Monitoring
```javascript
/**
 * System Monitoring
 * Tracks application health and performance
 */
const monitorSystem = async () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: await getSystemMetrics(),
    database: await getDatabaseMetrics(),
    api: await getAPIMetrics(),
    frontend: await getFrontendMetrics()
  };
  
  // Check thresholds
  const alerts = checkThresholds(metrics);
  
  // Send alerts if needed
  if (alerts.length > 0) {
    await sendAlerts(alerts);
  }
  
  // Store metrics
  await storeMetrics(metrics);
  
  return metrics;
};
```

## 🔧 Development Helpers (`scripts/development/`)

### Environment Setup
```bash
#!/bin/bash
# setup-dev-env.sh
# Sets up complete development environment

echo "🛠️ Setting up BF-Tools development environment..."

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
cp backend/.env.example backend/.env

# Setup database
npm run db:setup

# Seed sample data
npm run db:seed

# Install git hooks
npm run prepare

echo "✅ Development environment ready!"
```

### Code Quality Tools
```javascript
/**
 * Code Quality Checker
 * Runs linting, type checking, and code formatting
 */
const checkCodeQuality = async () => {
  const results = {};
  
  // ESLint
  results.linting = await runESLint();
  
  // TypeScript
  results.typeChecking = await runTypeScript();
  
  // Prettier
  results.formatting = await runPrettier();
  
  // Test coverage
  results.coverage = await runTestCoverage();
  
  return results;
};
```

## 📋 Usage Examples

### Running Scripts
```bash
# Database setup
node tools/scripts/database/setup-database.js

# Import CSV data
node tools/scripts/database/import-csv-to-supabase.js ./data/sample.csv waste_data

# Run health checks
node tools/automation/testing/health-check.js

# Generate API endpoint
node tools/generators/api/generate-api-endpoint.js Company

# Run load test
node tools/testing/performance/load-test.js --url http://localhost:3001 --users 50
```

### NPM Scripts Integration
```json
{
  "scripts": {
    "db:setup": "node tools/scripts/database/setup-database.js",
    "db:import": "node tools/scripts/database/import-csv-to-supabase.js",
    "test:load": "node tools/testing/performance/load-test.js",
    "generate:api": "node tools/generators/api/generate-api-endpoint.js",
    "health:check": "node tools/automation/monitoring/health-check.js"
  }
}
```

## 🔒 Security Tools

### Security Scanning
```javascript
/**
 * Security Scanner
 * Checks for vulnerabilities and security issues
 */
const runSecurityScan = async () => {
  const results = {
    dependencies: await scanDependencies(),
    code: await scanSourceCode(),
    secrets: await scanForSecrets(),
    docker: await scanDockerImages()
  };
  
  const criticalIssues = results.filter(issue => issue.severity === 'critical');
  
  if (criticalIssues.length > 0) {
    console.error('🚨 Critical security issues found!');
    process.exit(1);
  }
  
  return results;
};
```

---

Comprehensive tooling for efficient development and operations