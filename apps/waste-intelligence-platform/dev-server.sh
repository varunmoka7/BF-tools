#!/bin/bash

# Development Server Management Script
# Ensures only one Next.js instance runs at a time

echo "🔧 Starting waste-intelligence-platform development server..."

# Function to cleanup existing processes
cleanup_processes() {
    echo "🧹 Cleaning up existing processes..."
    
    # Kill any existing Next.js processes
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    # Free up port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Process cleanup completed"
}

# Function to clean build cache
clean_cache() {
    echo "🗑️  Cleaning build cache..."
    
    rm -rf .next/ .swc/ node_modules/.cache/ .turbo/ 2>/dev/null || true
    
    echo "✅ Cache cleanup completed"
}

# Function to check system resources
check_resources() {
    echo "📊 Checking system resources..."
    
    # Get available memory
    memory_gb=$(sysctl hw.memsize | awk '{print int($2/1024/1024/1024)}')
    echo "💾 Available RAM: ${memory_gb}GB"
    
    # Check if port 3000 is free
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port 3000 is already in use"
        return 1
    else
        echo "✅ Port 3000 is available"
        return 0
    fi
}

# Function to start development server with monitoring
start_dev_server() {
    echo "🚀 Starting Next.js development server..."

    # Set environment variables for optimal performance
    export NODE_OPTIONS="--max-old-space-size=4096"
    export NEXT_TELEMETRY_DISABLED=1

    # Ensure we're in the correct directory
    if [[ ! -f "package.json" ]]; then
        echo "❌ package.json not found. Make sure you're in the app directory."
        exit 1
    fi

    # Final port check before starting
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port 3000 is still occupied. Cleaning up..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi

    # Start the development server
    echo "✅ Starting Next.js on port 3000..."
    npm run dev
}

# Main execution
main() {
    # Change to the correct directory
    cd "$(dirname "$0")" || exit 1
    
    # Cleanup existing processes
    cleanup_processes
    
    # Clean cache if requested
    if [[ "$1" == "--clean" ]]; then
        clean_cache
    fi
    
    # Check system resources
    if ! check_resources; then
        echo "❌ System resource check failed"
        exit 1
    fi
    
    # Start the development server
    start_dev_server
}

# Handle script termination
trap 'echo "🛑 Shutting down development server..."; cleanup_processes; exit 0' INT TERM

# Run main function with all arguments
main "$@"