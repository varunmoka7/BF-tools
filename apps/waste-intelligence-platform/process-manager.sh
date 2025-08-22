#!/bin/bash

# Process Manager for Waste Intelligence Platform
# Ensures optimal server performance and prevents multiple instances

HEALTH_CHECK_INTERVAL=30
MAX_MEMORY_MB=1000
MAX_RESPONSE_TIME_SEC=10
LOG_FILE="process-manager.log"

echo "🔧 Starting Process Manager for Waste Intelligence Platform"
echo "Health check interval: ${HEALTH_CHECK_INTERVAL}s"
echo "Max memory threshold: ${MAX_MEMORY_MB}MB"
echo "Max response time: ${MAX_RESPONSE_TIME_SEC}s"
echo "Log file: $LOG_FILE"
echo "=============================================="

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check process count
check_process_count() {
    ps aux | grep -E "next-server|next dev" | grep -v grep | wc -l | tr -d ' '
}

# Function to check memory usage
check_memory_usage() {
    ps aux | grep -E "next-server|next dev" | grep -v grep | awk '{sum += $6} END {print sum/1024}' | cut -d. -f1
}

# Function to check server response
check_server_response() {
    local start_time end_time response_time http_code
    start_time=$(date +%s.%N)
    http_code=$(curl -s -w "%{http_code}" http://localhost:3000/api/health -o /dev/null 2>/dev/null)
    end_time=$(date +%s.%N)
    response_time=$(echo "$end_time - $start_time" | bc 2>/dev/null | cut -d. -f1)
    
    if [[ $http_code == "200" && $response_time -lt $MAX_RESPONSE_TIME_SEC ]]; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to restart server if needed
restart_server() {
    log_message "🔄 Restarting server due to performance issues..."
    
    # Kill existing processes
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    sleep 5
    
    # Clean cache
    cd "$(dirname "$0")" || exit 1
    npm run clean >/dev/null 2>&1
    
    # Start new instance
    nohup npm run dev >/dev/null 2>&1 &
    sleep 10
    
    log_message "✅ Server restart completed"
}

# Function to optimize performance
optimize_performance() {
    log_message "⚡ Running performance optimization..."
    
    # Clear unnecessary files
    find /tmp -name "next-*" -type f -mtime +1 -delete 2>/dev/null || true
    
    # Memory cleanup if needed
    if command -v purge >/dev/null 2>&1; then
        purge >/dev/null 2>&1
    fi
    
    log_message "✅ Performance optimization completed"
}

# Main monitoring loop
monitor_server() {
    local process_count memory_usage restart_needed
    
    while true; do
        process_count=$(check_process_count)
        memory_usage=$(check_memory_usage)
        restart_needed=false
        
        # Check process count
        if [[ $process_count -gt 2 ]]; then
            log_message "⚠️  Multiple processes detected: $process_count (expected: 2)"
            restart_needed=true
        elif [[ $process_count -eq 0 ]]; then
            log_message "❌ No server processes running"
            restart_needed=true
        fi
        
        # Check memory usage
        if [[ -n $memory_usage && $memory_usage -gt $MAX_MEMORY_MB ]]; then
            log_message "⚠️  High memory usage: ${memory_usage}MB (max: ${MAX_MEMORY_MB}MB)"
            restart_needed=true
        fi
        
        # Check server response
        if ! check_server_response; then
            log_message "❌ Server not responding properly"
            restart_needed=true
        fi
        
        # Restart if needed
        if [[ $restart_needed == true ]]; then
            restart_server
        else
            log_message "✅ Server healthy - Processes: $process_count, Memory: ${memory_usage}MB"
            
            # Periodic optimization
            if (( $(date +%s) % 300 == 0 )); then  # Every 5 minutes
                optimize_performance
            fi
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Handle script termination
cleanup() {
    log_message "🛑 Process Manager shutting down"
    exit 0
}

trap cleanup INT TERM

# Initialize
log_message "🚀 Process Manager started"
monitor_server