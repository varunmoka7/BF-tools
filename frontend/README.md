# Frontend - Waste Intelligence Platform

Modern React-based frontend application for the BF-Tools waste intelligence platform.

## 🏗️ Architecture

### Technology Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Maps**: Leaflet + React-Leaflet
- **State Management**: React hooks + Context
- **Build Tool**: Vite with TypeScript

### Project Structure
```
frontend/
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── charts/        # Chart components
│   │   ├── maps/          # Map components
│   │   └── dashboard/     # Dashboard components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles
│   └── main.tsx           # Application entry point
├── tests/                 # Frontend tests
├── config/                # Configuration files
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── postcss.config.js  # PostCSS configuration
│   └── tsconfig.frontend.json # TypeScript config
└── public/                # Static assets
```

## 🎨 Component Architecture

### UI Components (`/src/components/ui/`)
Base components built on Radix UI:
- `Button` - Interactive button component
- `Card` - Container component
- `Input` - Form input component
- `Select` - Dropdown selection
- `Badge` - Status/label badges
- `Tabs` - Tab navigation
- `Dialog` - Modal dialogs
- `Progress` - Progress indicators
- `Slider` - Range sliders
- `Toast` - Notification system

### Feature Components

#### Charts (`/src/components/charts/`)
- `ChartsSection` - Chart container wrapper
- `WasteTypeChart` - Waste categorization visualization
- `RegionDistributionChart` - Geographic distribution
- `ComplianceTrendsChart` - Compliance tracking over time
- `RecyclingProgressChart` - Recycling metrics

#### Maps (`/src/components/maps/`)
- `GlobalWasteMap` - Interactive world map
- `LeafletMap` - Base map component

#### Dashboard (`/src/components/dashboard/`)
- `DashboardHeader` - Main header component
- `KPICards` - Key performance indicators
- `BlackForestDashboard` - Main dashboard view
- `WasteDashboard` - Waste-specific dashboard

## 🚀 Quick Start

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure environment variables:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

## 📊 Features

### Dashboard Views
- **Analytics Dashboard**: Comprehensive waste analytics
- **Company Profiles**: Detailed company waste footprints
- **Geographic Mapping**: Interactive waste distribution
- **Sector Analysis**: Industry-specific insights
- **Compliance Tracking**: Regulatory compliance monitoring

### Data Visualization
- **Interactive Charts**: Recharts-based visualizations
- **Geographic Maps**: Leaflet-powered mapping
- **Real-time Updates**: Live data synchronization
- **Export Capabilities**: Data export functionality

### User Interface
- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: Theme switching support
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized rendering and loading

## 🔧 Configuration

### Vite Configuration (`config/vite.config.ts`)
- TypeScript support
- React plugin
- Path aliases
- Build optimization
- Development server settings

### Tailwind Configuration (`config/tailwind.config.js`)
- Custom color palette
- Component utilities
- Animation classes
- Responsive breakpoints

### TypeScript Configuration (`config/tsconfig.frontend.json`)
- Strict type checking
- Path mapping
- JSX settings
- Module resolution

## 🧪 Testing

### Test Structure
```
tests/
├── components/        # Component tests
├── hooks/            # Custom hook tests
├── utils/            # Utility function tests
└── integration/      # Integration tests
```

### Testing Tools
- **Framework**: Jest + React Testing Library
- **Coverage**: Istanbul
- **E2E**: Planned (Playwright/Cypress)

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🎯 Performance

### Optimization Strategies
- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Component-level lazy loading
- **Image Optimization**: Responsive images
- **Bundle Analysis**: Vite bundle analyzer
- **Caching**: Service worker caching

### Monitoring
- **Web Vitals**: Core web vitals tracking
- **Error Tracking**: Error boundary implementation
- **Performance Metrics**: Real-time monitoring

## 🔗 API Integration

### Backend Communication
- **REST API**: Axios-based HTTP client
- **Real-time**: WebSocket connections
- **Caching**: Request/response caching
- **Error Handling**: Centralized error management

### Data Flow
```
Components → Hooks → API Layer → Backend
     ↓
State Management → UI Updates
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above
- **Large**: 1440px and above

### Mobile Features
- Touch-friendly interfaces
- Optimized navigation
- Compressed data views
- Progressive enhancement

## 🛠️ Development Guidelines

### Code Style
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Strict mode enabled

### Component Guidelines
1. Use functional components with hooks
2. Implement proper TypeScript typing
3. Follow naming conventions (PascalCase)
4. Include JSDoc documentation
5. Write accompanying tests

### File Organization
- Group related components in directories
- Use index.ts files for clean imports
- Separate concerns (UI, business logic, data)
- Keep components under 200 lines

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Build optimization
- Tree shaking
- Code splitting
- Asset optimization
- TypeScript compilation
```

### Environment Variables
- `VITE_API_URL` - Backend API endpoint
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_MAP_API_KEY` - Map service API key

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)
- [React-Leaflet](https://react-leaflet.js.org/)

---

Built with ❤️ for sustainable waste management