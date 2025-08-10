/**
 * Express Application Setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import globalRoutes from './api/routes/global';
import sectorsRoutes from './api/routes/sectors';
import companiesRoutes from './api/routes/companies';
import analyticsRoutes from './api/routes/analytics';

// Import middleware
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/global-stats', globalRoutes);
app.use('/api/sectors', sectorsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Welcome message for root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Waste Intelligence Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: [
      'GET /api/global-stats - Global statistics for world map',
      'GET /api/sectors - Sector leaderboards and rankings',
      'GET /api/companies - Company search and filtering',
      'GET /api/companies/:id - Individual company profiles',
      'GET /api/analytics - KPI calculations and insights'
    ],
    features: [
      'CSV import and parsing system',
      'Data cleaning and normalization',
      'Country/sector/industry aggregations',
      'Trend analysis algorithms',
      'Recovery rate calculations',
      'Opportunity scoring',
      'Market sizing calculations',
      'Compliance risk assessments',
      'Lead generation algorithms'
    ]
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;