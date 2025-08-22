#!/usr/bin/env node

/**
 * Simple HTTP Server for Dashboard
 * 
 * This server serves the dashboard and structured data files
 * to avoid CORS issues when loading local files.
 * 
 * Usage: node serve-dashboard.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const ROOT_DIR = __dirname;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Get the file path
    const filePath = path.join(ROOT_DIR, pathname);
    
    // Get file extension for MIME type
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'text/plain';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 - File Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file <code>${pathname}</code> was not found.</p>
                        <p><a href="/">Go back to dashboard</a></p>
                    </body>
                </html>
            `);
            return;
        }
        
        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>500 - Internal Server Error</title></head>
                        <body>
                            <h1>500 - Internal Server Error</h1>
                            <p>Error reading file: ${err.message}</p>
                            <p><a href="/">Go back to dashboard</a></p>
                        </body>
                    </html>
                `);
                return;
            }
            
            // Set CORS headers for JSON files
            if (ext === '.json') {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            }
            
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log('🚀 BF-Tools Dashboard Server');
    console.log('=============================');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${ROOT_DIR}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`🗂️ Structured data: http://localhost:${PORT}/data/structured/`);
    console.log('\n💡 Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Handle errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Try using a different port or stop the existing server');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
