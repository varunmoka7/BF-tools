# Backend - Waste Intelligence Platform API

Robust Node.js backend service for the BF-Tools waste intelligence platform.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Supabase
- **ORM/Query Builder**: Native SQL with pg
- **Testing**: Jest + Supertest
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Process Management**: Nodemon (dev)

### Project Structure
```
backend/
├── src/                    # Source code
│   ├── api/               # API layer
│   │   ├── middleware/    # Express middleware
│   │   └── routes/        # API route handlers
│   ├── database/          # Database layer
│   │   ├── connection.ts  # Database connection
│   │   ├── schema.ts      # Schema definitions
│   │   ├── migrations/    # Database migrations
│   │   └── *.sql         # SQL schema files
│   ├── services/          # Business logic layer
│   │   ├── analytics.ts   # Analytics service
│   │   ├── company.ts     # Company service
│   │   ├── dataImport.ts  # Data import service
│   │   └── *.py          # Python services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── app.ts             # Application entry point
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup.ts          # Test setup
├── config/               # Configuration files
│   ├── jest.config.js    # Jest configuration
│   ├── nodemon.json      # Nodemon configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── tsconfig.node.json # Node-specific TypeScript config
└── docs/                 # API documentation
```

## 🚀 Quick Start

### Development
```bash
# Start development server
npm run backend:dev

# Build TypeScript
npm run backend:build

# Run tests
npm run backend:test

# Type checking
npm run type-check
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure environment variables:
   ```env
   NODE_ENV=development
   PORT=3001
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/bf_tools
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   
   # Security
   JWT_SECRET=your_jwt_secret
   API_KEY=your_api_key
   
   # External Services
   OPENAI_API_KEY=your_openai_key
   ```

## 📡 API Endpoints

### Waste Data Management
```
GET    /api/waste-data          # Get waste data with filtering
POST   /api/waste-data          # Create new waste data entry
PUT    /api/waste-data/:id      # Update waste data
DELETE /api/waste-data/:id      # Delete waste data
```

### Company Management
```
GET    /api/companies           # Get companies with pagination
GET    /api/companies/:id       # Get specific company
POST   /api/companies           # Create new company
PUT    /api/companies/:id       # Update company
DELETE /api/companies/:id       # Delete company
```

### Analytics & Reports
```
GET    /api/analytics/overview  # Get analytics overview
GET    /api/analytics/trends    # Get trend analysis
GET    /api/analytics/sectors   # Get sector analysis
GET    /api/analytics/regions   # Get regional analysis
```

### Data Import/Export
```
POST   /api/upload/csv          # Upload CSV data
GET    /api/export/csv          # Export data as CSV
GET    /api/export/json         # Export data as JSON
POST   /api/import/batch        # Batch import data
```

### Dashboard & KPIs
```
GET    /api/dashboard           # Get dashboard data
GET    /api/dashboard/kpis      # Get KPI metrics
GET    /api/dashboard/charts    # Get chart data
```

## 🗄️ Database

### Schema Overview
- **waste_data**: Core waste management data
- **companies**: Company profiles and information
- **sectors**: Industry sector definitions
- **regions**: Geographic region data
- **compliance**: Regulatory compliance tracking
- **users**: User management (if authentication enabled)

### Database Connection
- **Primary**: PostgreSQL via Supabase
- **Connection Pool**: Managed connection pooling
- **Migrations**: SQL-based schema migrations
- **Backup**: Automated backup strategies

### Key Tables
```sql
-- Waste Data
CREATE TABLE waste_data (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  waste_type VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sector_id INTEGER REFERENCES sectors(id),
  region VARCHAR(100),
  size_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛡️ Security

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **API Keys**: Service-to-service authentication
- **Role-based Access**: User permission management
- **Rate Limiting**: Request throttling

### Data Protection
- **Input Validation**: Joi schema validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Helmet middleware
- **CORS**: Configured cross-origin requests

### Security Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/                  # Unit tests
│   ├── services/         # Service layer tests
│   ├── middleware/       # Middleware tests
│   └── utils/           # Utility tests
├── integration/          # Integration tests
│   ├── api/             # API endpoint tests
│   └── database/        # Database tests
└── setup.ts             # Test configuration
```

### Testing Strategy
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Database operation testing
- **Mocking**: External service mocking

### Running Tests
```bash
# Run all tests
npm run backend:test

# Run specific test suite
npm run test -- --testPathPattern=unit

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Services

### Analytics Service (`services/analytics.ts`)
- Waste trend analysis
- KPI calculations
- Regional aggregations
- Sector comparisons
- Compliance tracking

### Company Service (`services/company.ts`)
- Company CRUD operations
- Company profile management
- Sector associations
- Performance metrics

### Data Import Service (`services/dataImport.ts`)
- CSV file processing
- Data validation
- Batch operations
- Error handling
- Progress tracking

### Language Extract Service (`services/*.py`)
- Python-based text processing
- Natural language processing
- Data extraction from documents
- ML model integration

## 🔧 Configuration

### Express Configuration (`app.ts`)
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
```

### Database Configuration
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📈 Performance

### Optimization Strategies
- **Connection Pooling**: Database connection management
- **Caching**: Redis-based caching (planned)
- **Compression**: Response compression
- **Pagination**: Large dataset pagination
- **Indexing**: Database query optimization

### Monitoring
- **Request Logging**: Morgan middleware
- **Error Tracking**: Centralized error handling
- **Performance Metrics**: Response time tracking
- **Health Checks**: Service health endpoints

## 🚀 Deployment

### Production Build
```bash
# Build TypeScript
npm run backend:build

# Start production server
npm start
```

### Environment Variables
```env
# Core Configuration
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Security
JWT_SECRET=...
API_KEY=...
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

## 🔗 External Integrations

### Supabase Integration
- Real-time subscriptions
- Row Level Security (RLS)
- Storage for file uploads
- Edge functions

### Python Services
- Machine learning models
- Data processing pipelines
- Natural language processing
- Scientific computing

## 📚 API Documentation

### OpenAPI/Swagger
- Interactive API documentation
- Request/response schemas
- Authentication examples
- Error code definitions

### Postman Collection
- Pre-configured requests
- Environment variables
- Test scenarios
- Example responses

## 🛠️ Development Guidelines

### Code Style
- **ESLint**: Node.js best practices
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Naming**: Consistent naming conventions

### Error Handling
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Centralized error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
  }
  
  // Log unexpected errors
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Jest Testing Framework](https://jestjs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Built with 🌱 for sustainable waste management