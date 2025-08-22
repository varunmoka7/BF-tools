# Development Tools

This directory contains all development tools, scripts, and AI development utilities organized for easy access.

## 📁 Directory Structure

### `/scripts/`
- **pilot-program-manager.js** - Pilot program management and execution
- **pilot-execution-log.json** - Pilot program execution logs
- **validation-report-2025-08-19.json** - Data validation reports
- **run-pilot-program.js** - Pilot program execution scripts
- **pilot-data-validator.js** - Data validation utilities
- **data-import-to-supabase.js** - Supabase data import tools
- **company-assignment-manager.js** - Company assignment management
- **data-collection-tracker.js** - Data collection tracking
- **supabase-migration-sql.sql** - Database migration scripts
- **run-migration-supabase.js** - Supabase migration runner
- **run-migration-simple.js** - Simple migration runner
- **run-migration.js** - Migration utilities
- **import-waste-data.js** - Waste data import tools
- **import-csv-to-supabase.js** - CSV to Supabase import
- **check-table-structure.js** - Table structure validation
- **create-supabase-schema.js** - Schema creation tools
- **seed-data.js** - Database seeding utilities
- **setup-database.js** - Database setup scripts
- **deploy.sh** - Deployment automation script

### `/ai/` - AI Development Tools
- **claude/** - Claude AI development tools and prompts
- **claude-flow/** - Claude Flow orchestration tools
- **roo/** - Roo AI development framework
- **cursor/** - Cursor AI development tools
- **swarm/** - Swarm AI collaboration tools
- **bmad method/** - BMAD methodology and tools

### `/sm-mdc/`
- Specialized tools and utilities

## 🚀 Quick Start

### Running Scripts
```bash
# Navigate to scripts directory
cd tools/scripts

# Run a specific script
node pilot-program-manager.js

# Run deployment
./deploy.sh
```

### Using AI Tools
```bash
# Access Claude tools
cd tools/ai/claude

# Access Claude Flow
cd tools/ai/claude-flow

# Access Roo tools
cd tools/ai/roo
```

## 🔧 Script Categories

### Data Management
- **Import/Export**: CSV processing, Supabase integration
- **Validation**: Data quality checks and validation
- **Migration**: Database schema updates and migrations

### Pilot Programs
- **Execution**: Running pilot programs
- **Management**: Program coordination and tracking
- **Validation**: Results validation and reporting

### Database Operations
- **Setup**: Initial database configuration
- **Seeding**: Sample data population
- **Migration**: Schema evolution and updates

### Deployment
- **Automation**: Deployment scripts and workflows
- **Configuration**: Environment and deployment configs

## 🤖 AI Development Tools

### Claude
- AI development prompts and guidelines
- Code generation assistance
- Development workflow optimization

### Claude Flow
- Workflow orchestration
- Agent coordination
- Process automation

### Roo
- AI development framework
- Prompt engineering tools
- Development methodology

### Cursor
- AI-powered code editing
- Development assistance
- Code optimization tools

### Swarm
- Collaborative AI development
- Multi-agent coordination
- Team-based AI workflows

### BMAD Method
- Business Model Architecture Design
- Strategic development methodology
- Business process optimization

## 📝 Usage Guidelines

1. **Scripts**: Always check dependencies before running
2. **AI Tools**: Follow the specific guidelines in each tool directory
3. **Deployment**: Use deployment scripts in production environments
4. **Data**: Validate data before running import/export scripts
5. **Migrations**: Test migrations in development before production

## 🔒 Security Notes

- Never commit sensitive data or credentials
- Use environment variables for configuration
- Validate all inputs before processing
- Follow security best practices for deployment

## 📚 Documentation

Each tool directory contains its own README with specific usage instructions. Refer to individual tool documentation for detailed information.