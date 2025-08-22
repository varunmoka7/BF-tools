#!/bin/bash

# 🚀 Waste Intelligence Platform - Quick Deploy Script

echo "🚀 Starting deployment of Waste Intelligence Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check for Vercel CLI
if command -v vercel &> /dev/null; then
    echo "🌐 Vercel CLI found. Deploying to Vercel..."
    cd frontend
    vercel --prod
    echo "🎉 Deployment complete!"
    echo "📝 Don't forget to set environment variables in Vercel dashboard:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
else
    echo "📦 Vercel CLI not found. Install it with: npm i -g vercel"
    echo "📁 Your built files are in the 'dist' directory"
    echo "🌐 You can drag and drop the 'dist' folder to Netlify"
fi

echo ""
echo "🎊 Congratulations! Your Waste Intelligence Platform is ready!"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
