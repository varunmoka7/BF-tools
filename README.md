# BF-tools
# BF-Tools: Waste Intelligence Platform

A comprehensive waste management and GHG emissions integration platform built with modern agile development practices.

## 🏗️ Project Structure

### Dashboard (`/apps/waste-intelligence-platform`)
- **Framework**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Components**: Modular UI components
- **Charts**: Recharts for data visualization

### Backend (`/backend`)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL with Supabase
- **API**: RESTful services
- **Testing**: Jest for unit/integration tests

### Shared (`/shared`)
- **Types**: TypeScript definitions
- **Utils**: Common utilities
- **Constants**: Shared constants

### Data (`/data`)
- **Datasets**: Raw data files
- **Tasks**: Task documentation and analysis
- **Entry System**: Data entry workflows
- **Pilot Program**: Pilot program data and results
- **Workflows**: Process templates and guides

### Documentation (`/docs`)
- **Implementation**: Implementation guides and roadmaps
- **Status**: Project status and progress reports
- **Development**: Development guides and tools
- **Architecture**: System architecture documentation
- **PRD**: Product requirements and specifications

### Tools (`/tools`)
- **Scripts**: Utility and automation scripts
- **AI Tools**: Claude, Roo, Cursor, and other AI development tools
- **SM-MDC**: Specialized tools and utilities

### Infrastructure (`/infrastructure`)
- **Docker**: Containerization configs
- **CI/CD**: Deployment pipelines
- **Scripts**: Infrastructure automation

### Configuration (`/config`)
- **Vercel**: Vercel deployment configuration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dashboard development server
npm run dev

# Start backend development server
npm run backend:dev

# Run tests
npm run test

# Build for production
npm run build
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dashboard dev server |
| `npm run build` | Build dashboard for production |
| `npm run backend:dev` | Start backend with nodemon |
| `npm run backend:build` | Build backend TypeScript |
| `npm run test` | Run all tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |

## 📋 Features

- **Waste Data Analytics**: Comprehensive waste management insights
- **Company Profiles**: Detailed company waste footprint analysis
- **Geographic Mapping**: Interactive waste distribution maps
- **Sector Analysis**: Industry-specific waste metrics
- **Compliance Tracking**: Regulatory compliance monitoring
- **Data Import**: CSV data import capabilities

## 🔧 Technology Stack

- **Dashboard**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Supabase
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Testing**: Jest
- **AI/ML**: Claude Flow orchestration

## 📁 Directory Guidelines

- Keep files organized in appropriate subdirectories
- Dashboard code goes in `/apps/waste-intelligence-platform/src`
- Backend code goes in `/backend/src`
- Shared code goes in `/shared`
- Documentation goes in `/docs/` (organized by category)
- Data and analysis goes in `/data/`
- Development tools go in `/tools/`
- Configuration files go in `/config/`
- Never save working files to root

## 🤝 Contributing

1. Follow the established directory structure
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow the existing code style
5. Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
