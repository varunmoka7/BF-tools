#!/bin/bash

# Server Performance Monitor
# Tracks Next.js server performance and resource usage

MONITOR_INTERVAL=5
LOG_FILE="server-performance.log"

echo "📊 Starting server performance monitor..."
echo "Monitor interval: ${MONITOR_INTERVAL}s"
echo "Log file: ${LOG_FILE}"
echo "Press Ctrl+C to stop monitoring"
echo "================================"

# Function to log with timestamp
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check Next.js processes
check_nextjs_processes() {
    local processes
    processes=$(ps aux | grep -E "next-server|next dev" | grep -v grep | wc -l | tr -d ' ')
    echo "$processes"
}

# Function to check port 3000 status
check_port_status() {
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "ACTIVE"
    else
        echo "INACTIVE"
    fi
}

# Function to get memory usage
get_memory_usage() {
    local next_processes
    next_processes=$(ps aux | grep -E "next-server|next dev" | grep -v grep | awk '{sum += $6} END {print sum/1024}')
    if [[ -z "$next_processes" ]]; then
        echo "0"
    else
        echo "$next_processes"
    fi
}

# Function to test server response time
test_response_time() {
    local start_time end_time duration
    start_time=$(date +%s.%N)
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 >/dev/null 2>&1; then
        end_time=$(date +%s.%N)
        duration=$(echo "$end_time - $start_time" | bc)
        echo "${duration}s"
    else
        echo "TIMEOUT"
    fi
}

# Function to display performance metrics
display_metrics() {
    local processes port_status memory_mb response_time
    
    processes=$(check_nextjs_processes)
    port_status=$(check_port_status)
    memory_mb=$(get_memory_usage)
    response_time=$(test_response_time)
    
    printf "Processes: %-2s | Port: %-8s | Memory: %-6.1fMB | Response: %-8s\n" \
           "$processes" "$port_status" "$memory_mb" "$response_time"
    
    # Log to file
    log_with_timestamp "METRICS - Processes: $processes, Port: $port_status, Memory: ${memory_mb}MB, Response: $response_time"
    
    # Alert on issues
    if [[ $processes -gt 1 ]]; then
        log_with_timestamp "⚠️  WARNING: Multiple Next.js processes detected ($processes)"
    fi
    
    if [[ $port_status == "INACTIVE" ]]; then
        log_with_timestamp "❌ ERROR: No server running on port 3000"
    fi
    
    if (( $(echo "$memory_mb > 500" | bc -l) )); then
        log_with_timestamp "⚠️  WARNING: High memory usage: ${memory_mb}MB"
    fi
    
    if [[ $response_time == "TIMEOUT" ]]; then
        log_with_timestamp "❌ ERROR: Server not responding"
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    log_with_timestamp "📊 Monitoring stopped"
    echo "Performance log saved to: $LOG_FILE"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Initialize log file
log_with_timestamp "📊 Performance monitoring started"

# Main monitoring loop
while true; do
    display_metrics
    sleep $MONITOR_INTERVAL
done