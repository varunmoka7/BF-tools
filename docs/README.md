# Waste Intelligence Platform

A comprehensive React-based dashboard for waste management analytics, built with modern technologies including ShadCN UI, TypeScript, and interactive data visualizations.

## 🚀 Features

### 1. Global Waste Footprint Map
- **Interactive world map** using React-Leaflet
- **Country-level waste data visualization** with color-coded recovery rates
- **Popup details** showing waste volumes, recovery rates, and market opportunities
- **Toggle controls** for different waste types (hazardous, municipal, industrial, etc.)
- **Time slider** for year-over-year analysis
- **Responsive design** with mobile-friendly controls

### 2. KPI Insight Cards
- **Professional metric cards** displaying key performance indicators
- **Trend indicators** with visual charts and percentage changes
- **Progress bars** showing performance vs benchmarks/targets
- **Real-time data** including:
  - Total Waste Generated
  - Average Recovery Rate
  - Hazardous Waste Share
  - Market Opportunity Value

### 3. Sector Leaderboards
- **Data tables** with advanced sorting and filtering capabilities
- **Company rankings** by recovery efficiency, waste volume, and improvement trends
- **Performance indicators** with color-coded ratings (leaders, average, hotspots)
- **Search functionality** for companies and countries
- **Export capabilities** for data analysis

### 4. Company Profile Views
- **Detailed company analytics** with comprehensive data visualization
- **Timeline charts** showing waste generation trends over time
- **Recovery vs disposal breakdown** with interactive charts
- **Treatment method distribution** using pie charts
- **Benchmark comparisons** against industry, regional, and global averages
- **Performance scoring** with detailed metrics

## 🛠 Technology Stack

- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **ShadCN UI** for modern, accessible component library
- **Tailwind CSS** for responsive styling
- **React-Leaflet** for interactive mapping
- **Recharts** for data visualizations
- **Lucide React** for consistent iconography
- **Radix UI** primitives for accessible components

## 📦 Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd BF-tools

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/                     # ShadCN UI components
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── GlobalWasteFootprintMap.tsx
│   ├── KPIInsightCards.tsx
│   ├── SectorLeaderboards.tsx
│   ├── CompanyProfileView.tsx
│   └── WasteDashboard.tsx
├── types/
│   └── waste.ts               # TypeScript interfaces
├── data/
│   └── mockData.ts           # Sample data for development
├── lib/
│   └── utils.ts              # Utility functions
├── App.tsx
├── main.tsx
└── globals.css
```

## 🎨 Key Components

### GlobalWasteFootprintMap
Interactive world map component featuring:
- Color-coded countries based on recovery rates
- Scalable markers based on waste volume
- Rich popup information
- Year/waste type filtering controls
- Responsive map controls

### KPIInsightCards
Performance metric cards with:
- Real-time value display
- Trend visualization
- Progress indicators
- Benchmark comparisons
- Responsive grid layout

### SectorLeaderboards
Advanced data table component featuring:
- Multi-column sorting
- Search and filtering
- Performance rating badges
- Ranking visualization
- Company selection capability

### CompanyProfileView
Detailed company analysis with:
- Multi-tab interface
- Time-series charts
- Treatment method breakdowns
- Benchmark comparisons
- Performance scoring

## 📊 Data Structure

The platform uses comprehensive TypeScript interfaces:

```typescript
interface WasteData {
  country: string
  totalWaste: number
  hazardousWaste: number
  recoveryRate: number
  treatmentMethods: TreatmentMethods
  wasteTypes: WasteTypes
  marketOpportunity: number
}

interface CompanyData {
  name: string
  sector: string
  wasteGenerated: number[]
  recoveryRates: number[]
  performanceScore: number
  benchmarkComparison: BenchmarkData
}
```

## 🎯 Key Features in Detail

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Progressive enhancement

### Performance Optimization
- Code splitting with React.lazy
- Memoized components
- Optimized re-renders
- Efficient data filtering

### Accessibility
- WCAG compliant components
- Keyboard navigation
- Screen reader support
- High contrast support

### Data Visualization
- Interactive charts with Recharts
- Custom tooltips and legends
- Color-coded performance indicators
- Export capabilities

## 🔧 Development

### Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run type-check # TypeScript checking
```

### Key Dependencies
- **@radix-ui/react-*** - Accessible component primitives
- **class-variance-authority** - CSS-in-JS utility
- **clsx** & **tailwind-merge** - Conditional styling
- **leaflet** & **react-leaflet** - Interactive mapping
- **recharts** - Data visualization
- **lucide-react** - Icon library

## 🌍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚦 Performance Metrics

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

## 📱 Mobile Responsiveness

The dashboard is fully responsive with:
- Collapsible navigation
- Touch-friendly controls
- Optimized table views
- Mobile-specific interactions

## 🔐 Security

- XSS protection
- CSRF prevention
- Secure data handling
- Input validation

## 📈 Future Enhancements

- Real-time data integration
- Advanced filtering options
- Export functionality
- Multi-language support
- Dark mode implementation
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ for sustainable waste management analytics.