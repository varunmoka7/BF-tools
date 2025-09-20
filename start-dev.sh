#!/bin/bash

# Quick Development Server Starter
# Run from project root: ./start-dev.sh

echo "🚀 Starting BF-tools development server..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next" 2>/dev/null || true
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true

# Wait for cleanup
sleep 2

# Navigate to app directory and start
cd apps/waste-intelligence-platform || {
    echo "❌ Could not find apps/waste-intelligence-platform directory"
    exit 1
}

echo "📂 Changed to: $(pwd)"
echo "🔥 Starting development server on http://localhost:3000"

# Start the development server
npm run dev