#!/bin/bash

# Production Deployment Script for Waste Intelligence Platform
# This script automates the production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="waste-intelligence-platform"
BUILD_DIR=".next"
PRODUCTION_BRANCH="main"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the production branch
check_branch() {
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$PRODUCTION_BRANCH" ]; then
        print_warning "You are not on the $PRODUCTION_BRANCH branch. Current branch: $CURRENT_BRANCH"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled. Please switch to $PRODUCTION_BRANCH branch."
            exit 1
        fi
    fi
}

# Check for uncommitted changes
check_changes() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes:"
        git status --short
        read -p "Do you want to commit them before deployment? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Auto-commit before production deployment"
            print_success "Changes committed successfully"
        else
            print_warning "Deploying with uncommitted changes..."
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --production=false
    print_success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    if npm test -- --passWithNoTests; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Deployment cancelled."
        exit 1
    fi
}

# Build the application
build_application() {
    print_status "Building application for production..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_status "Previous build cleaned"
    fi
    
    # Build with production optimizations
    NODE_ENV=production npm run build
    
    if [ -d "$BUILD_DIR" ]; then
        print_success "Application built successfully"
        
        # Show build statistics
        BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
        print_status "Build size: $BUILD_SIZE"
    else
        print_error "Build failed. Deployment cancelled."
        exit 1
    fi
}

# Analyze bundle
analyze_bundle() {
    print_status "Analyzing bundle..."
    npm run build:analyze
    print_success "Bundle analysis completed"
}

# Security audit
security_audit() {
    print_status "Running security audit..."
    if npm audit --audit-level=moderate; then
        print_success "Security audit passed"
    else
        print_warning "Security vulnerabilities found. Review them before deployment."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled due to security concerns."
            exit 1
        fi
    fi
}

# Environment validation
validate_environment() {
    print_status "Validating environment configuration..."
    
    # Check if production environment file exists
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production file not found. Using template..."
        if [ -f "env.production.template" ]; then
            cp env.production.template .env.production
            print_warning "Please update .env.production with your production values"
            read -p "Press Enter after updating .env.production..."
        else
            print_error "No environment template found. Please create .env.production manually."
            exit 1
        fi
    fi
    
    # Validate required environment variables
    source .env.production
    REQUIRED_VARS=("NODE_ENV" "NEXT_PUBLIC_API_URL")
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_success "Environment validation passed"
}

# Performance testing
performance_test() {
    print_status "Running performance tests..."
    
    # Start the application
    npm start &
    APP_PID=$!
    
    # Wait for app to start
    sleep 10
    
    # Run basic performance tests
    if command -v curl &> /dev/null; then
        print_status "Testing API response times..."
        
        # Test health endpoint
        HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
        if [ "$HEALTH_RESPONSE" = "200" ]; then
            print_success "Health endpoint responding correctly"
        else
            print_warning "Health endpoint returned status: $HEALTH_RESPONSE"
        fi
        
        # Test main page load time
        MAIN_PAGE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/)
        print_status "Main page load time: ${MAIN_PAGE_TIME}s"
        
        # Test companies API
        COMPANIES_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/companies-with-coordinates)
        print_status "Companies API response time: ${COMPANIES_TIME}s"
    fi
    
    # Stop the application
    kill $APP_PID 2>/dev/null || true
    print_success "Performance testing completed"
}

# Deployment
deploy() {
    print_status "Starting deployment..."
    
    # Check if we're deploying to Vercel
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod
        print_success "Deployment to Vercel completed"
    else
        print_warning "Vercel CLI not found. Manual deployment required."
        print_status "Build artifacts are ready in $BUILD_DIR"
        print_status "Deploy the contents to your production server"
    fi
}

# Post-deployment verification
verify_deployment() {
    print_status "Verifying deployment..."
    
    if [ -n "$NEXT_PUBLIC_API_URL" ]; then
        print_status "Testing production endpoints..."
        
        # Test health endpoint
        if curl -s "$NEXT_PUBLIC_API_URL/api/health" | grep -q "healthy"; then
            print_success "Production health check passed"
        else
            print_warning "Production health check failed"
        fi
    fi
    
    print_success "Deployment verification completed"
}

# Main deployment flow
main() {
    echo "🏗️  $PROJECT_NAME Production Deployment"
    echo "======================================"
    
    check_branch
    check_changes
    install_dependencies
    run_tests
    validate_environment
    security_audit
    build_application
    analyze_bundle
    performance_test
    deploy
    verify_deployment
    
    echo ""
    print_success "🎉 Production deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Monitor application performance"
    echo "2. Check error logs and monitoring"
    echo "3. Verify all features are working"
    echo "4. Update client documentation"
}

# Run main function
main "$@"
