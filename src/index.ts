/**
 * Main application entry point
 */

import app from './app';
import DatabaseConnection from './database/connection';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');
    const db = DatabaseConnection.getInstance();
    await db.connect();
    console.log('Database initialized successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 WASTE INTELLIGENCE PLATFORM                 ║
║                        SERVER STARTED                       ║
╠══════════════════════════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(53)} ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(46)} ║
║  Database: SQLite                                            ║
║  API Docs: http://localhost:${PORT}/                          ║
║  Health: http://localhost:${PORT}/health                      ║
╠══════════════════════════════════════════════════════════════╣
║  API Endpoints:                                              ║
║  • GET /api/global-stats     - Global statistics            ║
║  • GET /api/sectors          - Sector leaderboards          ║
║  • GET /api/companies        - Company search               ║
║  • GET /api/analytics        - KPIs and insights            ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  try {
    const db = DatabaseConnection.getInstance();
    await db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  try {
    const db = DatabaseConnection.getInstance();
    await db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
  
  process.exit(0);
});

// Start the server
startServer();