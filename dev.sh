#!/bin/bash

# Quick Development Server
# Usage: ./dev.sh

echo "🚀 Starting BF-tools Development Server"
echo "────────────────────────────────────────"

# Kill any existing processes
pkill -f "next" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Navigate to app directory
cd apps/waste-intelligence-platform || {
    echo "❌ Could not find waste-intelligence-platform directory"
    exit 1
}

echo "📍 Location: $(pwd)"
echo "🌐 Starting on: http://localhost:3000"
echo "────────────────────────────────────────"

# Start the server
exec npm run dev

# Note: exec replaces the shell process, so cleanup happens automatically on Ctrl+C