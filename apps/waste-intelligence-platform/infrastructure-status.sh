#!/bin/bash

# Infrastructure Status Dashboard
# Comprehensive server health and performance monitoring

clear
echo "🔧 Waste Intelligence Platform - Infrastructure Status"
echo "======================================================"
echo ""

# Function to display colored status
status_color() {
    local status=$1
    local message=$2
    
    case $status in
        "OK"|"HEALTHY"|"ACTIVE")
            echo -e "\033[32m✅ $message\033[0m"
            ;;
        "WARNING"|"DEGRADED")
            echo -e "\033[33m⚠️  $message\033[0m"
            ;;
        "ERROR"|"FAILED"|"INACTIVE")
            echo -e "\033[31m❌ $message\033[0m"
            ;;
        *)
            echo -e "\033[36mℹ️  $message\033[0m"
            ;;
    esac
}

# Check Next.js processes
echo "📊 Server Processes:"
process_count=$(ps aux | grep -E "next-server|next dev" | grep -v grep | wc -l | tr -d ' ')
if [[ $process_count -eq 0 ]]; then
    status_color "ERROR" "No Next.js processes running"
elif [[ $process_count -eq 2 ]]; then
    status_color "OK" "Optimal process count: $process_count processes"
elif [[ $process_count -gt 2 ]]; then
    status_color "WARNING" "Multiple instances detected: $process_count processes"
else
    status_color "INFO" "Unusual process count: $process_count processes"
fi

# Check port status
echo ""
echo "🌐 Network Status:"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    status_color "OK" "Port 3000 is active and listening"
else
    status_color "ERROR" "Port 3000 is not accessible"
fi

# Check server health endpoint
echo ""
echo "🔍 Health Check:"
health_response=$(curl -s -w "%{http_code}" http://localhost:3000/api/health -o /tmp/health.json 2>/dev/null)
if [[ $health_response == "200" ]]; then
    status_color "OK" "Health endpoint responding (HTTP $health_response)"
    
    # Parse health data if available
    if command -v python3 >/dev/null 2>&1; then
        memory_used=$(python3 -c "import json; print(json.load(open('/tmp/health.json'))['memory']['used'])" 2>/dev/null)
        response_time=$(python3 -c "import json; print(json.load(open('/tmp/health.json'))['responseTime'])" 2>/dev/null)
        uptime=$(python3 -c "import json; print(round(json.load(open('/tmp/health.json'))['uptime']))" 2>/dev/null)
        
        echo "   Memory Usage: ${memory_used}MB"
        echo "   Response Time: ${response_time}ms"
        echo "   Uptime: ${uptime}s"
    fi
else
    status_color "ERROR" "Health endpoint not responding (HTTP $health_response)"
fi

# Test main page response time
echo ""
echo "⚡ Performance Test:"
start_time=$(date +%s.%N)
main_response=$(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null 2>/dev/null)
end_time=$(date +%s.%N)
response_time=$(echo "scale=3; $end_time - $start_time" | bc)

if [[ $main_response == "200" ]]; then
    if (( $(echo "$response_time < 3.0" | bc -l) )); then
        status_color "OK" "Main page loads in ${response_time}s"
    elif (( $(echo "$response_time < 10.0" | bc -l) )); then
        status_color "WARNING" "Main page loads in ${response_time}s (slower than optimal)"
    else
        status_color "ERROR" "Main page loads in ${response_time}s (too slow)"
    fi
else
    status_color "ERROR" "Main page not accessible (HTTP $main_response)"
fi

# Check system resources
echo ""
echo "💻 System Resources:"
memory_gb=$(sysctl hw.memsize 2>/dev/null | awk '{print int($2/1024/1024/1024)}')
if [[ -n $memory_gb ]]; then
    status_color "INFO" "System RAM: ${memory_gb}GB"
fi

# Next.js specific memory usage
next_memory=$(ps aux | grep -E "next-server|next dev" | grep -v grep | awk '{sum += $6} END {printf "%.1f", sum/1024}')
if [[ -n $next_memory && $next_memory != "0.0" ]]; then
    if (( $(echo "$next_memory < 500" | bc -l) )); then
        status_color "OK" "Next.js Memory Usage: ${next_memory}MB"
    elif (( $(echo "$next_memory < 1000" | bc -l) )); then
        status_color "WARNING" "Next.js Memory Usage: ${next_memory}MB (elevated)"
    else
        status_color "ERROR" "Next.js Memory Usage: ${next_memory}MB (high)"
    fi
fi

# Check for build artifacts
echo ""
echo "🗂️  Build Status:"
if [[ -d ".next" ]]; then
    build_size=$(du -sh .next 2>/dev/null | cut -f1)
    status_color "OK" "Build artifacts present: $build_size"
else
    status_color "INFO" "No build artifacts (clean state)"
fi

# Configuration check
echo ""
echo "⚙️  Configuration:"
if [[ -f "next.config.js" ]]; then
    status_color "OK" "Next.js config optimized"
fi

if [[ -f ".env.local" ]]; then
    status_color "OK" "Environment variables configured"
fi

if [[ -f "dev-server.sh" && -x "dev-server.sh" ]]; then
    status_color "OK" "Development scripts available"
fi

echo ""
echo "📋 Quick Commands:"
echo "   npm run dev:safe     - Start optimized development server"
echo "   npm run monitor      - Start performance monitoring"
echo "   npm run kill-servers - Stop all server processes"
echo "   npm run clean        - Clean build cache"
echo ""
echo "🔧 Infrastructure Status Check Complete"
echo "======================================================"

# Cleanup
rm -f /tmp/health.json