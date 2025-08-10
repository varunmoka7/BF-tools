# Waste Intelligence Platform MVP

A professional waste management intelligence and analytics platform built with Next.js 14, TypeScript, and ShadCN UI.

## Features

### Core Dashboard
- **KPI Overview**: Real-time metrics for waste volume, recycling rates, compliance scores
- **Global Map**: Interactive visualization of waste management companies worldwide
- **Data Tables**: Comprehensive company listings with filtering and sorting
- **Charts & Analytics**: Various visualization types for data insights

### Data Processing
- **CSV Import**: Upload and process waste management data from CSV files
- **Data Validation**: Automatic validation and structure checking
- **Mock Data**: Comprehensive sample data for development and testing

### Professional UI
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Modern Components**: ShadCN UI components with consistent design system
- **Interactive Maps**: Leaflet integration for geographical data visualization
- **Charts**: Recharts integration for various data visualization needs

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Charts**: Recharts
- **Maps**: React-Leaflet + Leaflet
- **Data Processing**: PapaParse for CSV handling
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Dashboard page
├── components/         # React components
│   ├── ui/            # ShadCN UI components
│   ├── layout/        # Layout components
│   ├── dashboard/     # Dashboard-specific components
│   ├── maps/          # Map components
│   ├── tables/        # Table components
│   └── charts/        # Chart components
├── types/             # TypeScript type definitions
├── lib/               # Utility functions
├── data/              # Mock data and data processing
└── utils/             # CSV processing utilities
\`\`\`

## API Endpoints

### Companies API
- **GET** \`/api/companies\` - Fetch companies with filtering
- **POST** \`/api/companies\` - Create new company

### Dashboard API  
- **GET** \`/api/dashboard\` - Fetch dashboard metrics

### Upload API
- **POST** \`/api/upload/csv\` - Process CSV file uploads

## Development Features

### Mock Data System
The platform includes comprehensive mock data that simulates real waste management scenarios:
- 5 sample companies from different regions
- Various waste types (Municipal, Electronic, Industrial, etc.)
- Compliance scores and recycling rates
- Geographic coordinates for map visualization

### CSV Processing
Built-in CSV processor that handles:
- Multiple column naming conventions
- Data validation and transformation
- Coordinate generation for mapping
- Error handling and user feedback

### Professional Styling
- Consistent color scheme optimized for B2B applications
- Responsive grid layouts
- Interactive hover states
- Loading states and animations

## Deployment

This application is optimized for deployment on Vercel:

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically with zero configuration

Alternative deployment platforms:
- Netlify
- Railway
- Docker containers

## Future Enhancements

### Phase 2 Features
- User authentication and role-based access
- Real-time data updates with WebSockets
- Advanced filtering and search capabilities
- Export functionality for reports
- Integration with external APIs

### Database Integration
- PostgreSQL or MongoDB for data persistence  
- Redis for caching and session management
- Prisma or Drizzle ORM for database operations

### Analytics Enhancement
- Predictive analytics with ML models
- Custom report generation
- Email notifications and alerts
- Advanced compliance tracking

## Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/name\`)
3. Commit changes (\`git commit -am 'Add feature'\`)
4. Push to branch (\`git push origin feature/name\`)
5. Create Pull Request

## License

MIT License - see LICENSE file for details