# Technical Architecture Overview: Waste Intelligence Platform

## 🏗️ System Architecture

### High-Level Architecture

The Waste Intelligence Platform follows a modern, scalable architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│  (Supabase)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   API Gateway   │    │   Data Storage  │
│   (Vercel CDN)  │    │   (Express)     │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Deployment**: Vercel

#### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: RESTful endpoints
- **Testing**: Jest
- **Deployment**: Supabase Functions

#### Infrastructure Stack
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

## 📁 Project Structure

### Repository Organization

```
BF-tools/
├── apps/
│   └── waste-intelligence-platform/     # Main Next.js application
│       ├── src/
│       │   ├── app/                     # Next.js App Router
│       │   ├── components/              # React components
│       │   ├── lib/                     # Utility functions
│       │   └── types/                   # TypeScript types
│       ├── public/                      # Static assets
│       └── package.json
├── backend/                             # Express.js API server
│   ├── src/
│   │   ├── api/                         # API routes
│   │   ├── services/                    # Business logic
│   │   ├── database/                    # Database models
│   │   └── utils/                       # Utilities
│   └── config/                          # Configuration files
├── shared/                              # Shared code
│   ├── types/                           # Shared TypeScript types
│   └── utils/                           # Shared utilities
├── data/                                # Data files
│   ├── structured/                      # Processed JSON data
│   ├── entry-system/                    # Data entry tools
│   └── pilot-program/                   # Pilot program data
├── docs/                                # Documentation
├── scripts/                             # Utility scripts
└── tools/                               # Development tools
```

### Frontend Architecture

#### Component Structure

```
src/
├── app/                                 # Next.js App Router
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Home page
│   ├── companies/                       # Companies pages
│   │   ├── page.tsx                     # Companies list
│   │   └── [id]/                        # Individual company
│   │       └── page.tsx                 # Company profile
│   └── api/                             # API routes
├── components/                          # React components
│   ├── ui/                              # Base UI components
│   ├── charts/                          # Chart components
│   ├── maps/                            # Map components
│   └── layout/                          # Layout components
├── lib/                                 # Utility functions
│   ├── api.ts                           # API client
│   ├── utils.ts                         # General utilities
│   └── constants.ts                     # Constants
└── types/                               # TypeScript types
    ├── company.ts                       # Company types
    ├── waste.ts                         # Waste metrics types
    └── api.ts                           # API types
```

#### Key Components

1. **CompanyProfileHeader**: Company header with logo and basic info
2. **CompanyInfoCard**: Company information display
3. **WasteMetricsSection**: Waste management metrics
4. **PerformanceTrendsSection**: Performance trends and charts
5. **InteractiveMap**: Geographic visualization
6. **DataTable**: Filterable data tables
7. **ChartComponents**: Various chart types (bar, line, pie)

### Backend Architecture

#### API Structure

```
src/
├── app.ts                               # Express app setup
├── server.ts                            # Server entry point
├── api/                                 # API routes
│   ├── companies/                       # Company endpoints
│   │   ├── [id]/
│   │   │   ├── profile.ts               # Company profile
│   │   │   ├── waste-metrics.ts         # Waste metrics
│   │   │   └── performance.ts           # Performance data
│   │   └── index.ts                     # Companies list
│   └── index.ts                         # API router
├── services/                            # Business logic
│   ├── companyService.ts                # Company operations
│   ├── wasteService.ts                  # Waste metrics
│   └── performanceService.ts            # Performance analytics
├── database/                            # Database layer
│   ├── connection.ts                    # Database connection
│   ├── models/                          # Data models
│   └── migrations/                      # Database migrations
└── utils/                               # Utilities
    ├── validation.ts                    # Input validation
    ├── errorHandler.ts                  # Error handling
    └── logger.ts                        # Logging
```

## 🗄️ Database Design

### Schema Overview

The database uses a flexible JSON-based schema to accommodate the diverse waste management data:

#### Core Tables

1. **company_data_templates**
   - Primary table for company data
   - JSONB columns for flexible data storage
   - Individual templates for each company

2. **master_company_data**
   - Master data for synchronization
   - Reference data for all companies

3. **waste_metrics**
   - Aggregated waste metrics
   - Performance calculations

4. **geographic_data**
   - Company locations and coordinates
   - Geographic analysis data

### Data Model

```sql
-- Company data templates table
CREATE TABLE company_data_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    profile JSONB,
    waste_metrics JSONB,
    performance_data JSONB,
    geographic_data JSONB,
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Master company data table
CREATE TABLE master_company_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    ticker TEXT,
    country TEXT,
    sector TEXT,
    industry TEXT,
    employees INTEGER,
    revenue DECIMAL,
    market_cap DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Data Flow

1. **Data Ingestion**: Raw data → JSON processing → Database storage
2. **Data Access**: API requests → Database queries → JSON responses
3. **Data Display**: Frontend requests → API calls → Component rendering
4. **Data Updates**: Master data → Individual templates → Frontend updates

## 🔌 API Design

### RESTful Endpoints

#### Company Endpoints

```
GET /api/companies                    # List all companies
GET /api/companies/[id]               # Get company basic info
GET /api/companies/[id]/profile       # Get company profile
GET /api/companies/[id]/waste-metrics # Get waste metrics
GET /api/companies/[id]/performance   # Get performance data
```

#### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  website: string;
  founded: number;
  headquarters: string;
  revenue: number;
  marketCap: number;
  sustainabilityRating: string;
  wasteMetrics: WasteMetrics;
  performance: PerformanceData;
}
```

### Error Handling

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 🔄 Data Flow Architecture

### Frontend Data Flow

```
User Action → Component → API Call → Backend → Database → Response → State Update → UI Update
```

### Backend Data Flow

```
API Request → Validation → Service Layer → Database → Response Processing → API Response
```

### Data Processing Pipeline

```
Raw Data → Validation → Transformation → Storage → API → Frontend → Visualization
```

## 🚀 Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **Caching**: Vercel Edge caching
4. **Bundle Optimization**: Tree shaking and minification
5. **Lazy Loading**: Component and route lazy loading

### Backend Optimization

1. **Database Indexing**: Optimized indexes for queries
2. **Connection Pooling**: Efficient database connections
3. **Caching**: Redis caching for frequently accessed data
4. **Query Optimization**: Efficient SQL queries
5. **Response Compression**: Gzip compression

### Database Optimization

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Partitioning**: Data partitioning for large tables
3. **Query Optimization**: Optimized queries and stored procedures
4. **Connection Management**: Efficient connection pooling

## 🔒 Security Architecture

### Authentication & Authorization

- **Supabase Auth**: JWT-based authentication
- **Row Level Security (RLS)**: Database-level security
- **API Rate Limiting**: Request throttling
- **Input Validation**: Comprehensive input sanitization

### Data Security

- **Encryption**: Data encryption at rest and in transit
- **Access Control**: Role-based access control
- **Audit Logging**: Comprehensive audit trails
- **Data Privacy**: GDPR compliance measures

## 📊 Monitoring & Observability

### Application Monitoring

- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Analytics**: User behavior tracking
- **Health Checks**: Application health monitoring

### Infrastructure Monitoring

- **Database Monitoring**: Query performance and health
- **API Monitoring**: Endpoint availability and performance
- **CDN Monitoring**: Static asset delivery performance
- **Uptime Monitoring**: Service availability tracking

## 🔧 Development Workflow

### Local Development

1. **Frontend**: `npm run dev` (Next.js development server)
2. **Backend**: `npm run backend:dev` (Express with nodemon)
3. **Database**: Supabase local development
4. **Testing**: Jest test suites

### Deployment Pipeline

1. **Code Push**: GitHub repository
2. **CI/CD**: GitHub Actions
3. **Testing**: Automated tests
4. **Deployment**: Vercel (frontend) + Supabase (backend)
5. **Monitoring**: Post-deployment monitoring

## 📈 Scalability Considerations

### Horizontal Scaling

- **Frontend**: Vercel Edge Network
- **Backend**: Supabase Functions scaling
- **Database**: Supabase managed PostgreSQL scaling

### Vertical Scaling

- **Database**: Supabase managed scaling
- **API**: Supabase Functions auto-scaling
- **CDN**: Vercel global CDN

### Performance Targets

- **Page Load Time**: <2 seconds
- **API Response Time**: <500ms
- **Database Query Time**: <200ms
- **Concurrent Users**: 1000+
- **Data Throughput**: 10,000+ requests/minute

## 🛠️ Development Tools

### Code Quality

- **TypeScript**: Type safety and IntelliSense
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### Testing

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **API Testing**: Postman/Insomnia
- **E2E Testing**: Playwright (planned)

### Development Environment

- **VS Code**: Primary IDE
- **Docker**: Containerization (planned)
- **Git**: Version control
- **GitHub**: Code repository and CI/CD

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Prepared by: BMad Analyst Agent*
