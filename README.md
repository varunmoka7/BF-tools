# BF-tools
# BF-Tools: Waste Intelligence Platform

A comprehensive waste management and GHG emissions integration platform built with modern agile development practices.

## 🏗️ Project Structure

### Frontend (`/frontend`)
- **Framework**: React + Vite + TypeScript
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
- **Migrations**: Database schema changes
- **Backups**: Data backup files

### Infrastructure (`/infrastructure`)
- **Docker**: Containerization configs
- **CI/CD**: Deployment pipelines
- **Scripts**: Infrastructure automation

### Claude Flow (`/.claude-flow`)
- **Agents**: AI agent definitions
- **Workflows**: Automated workflows
- **Memory**: Persistent memory storage
- **Metrics**: Performance tracking

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start frontend development server
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
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
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

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Supabase
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Testing**: Jest
- **AI/ML**: Claude Flow orchestration

## 📁 Directory Guidelines

- Keep files organized in appropriate subdirectories
- Frontend code goes in `/frontend/src`
- Backend code goes in `/backend/src`
- Shared code goes in `/shared`
- Documentation goes in `/docs`
- Never save working files to root

## 🤝 Contributing

1. Follow the established directory structure
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow the existing code style
5. Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
