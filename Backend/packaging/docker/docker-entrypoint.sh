#!/bin/bash

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

set -e

log "Starting Backend container..."

# Default values
DEFAULT_API_HOST="0.0.0.0"
DEFAULT_API_PORT="4242"
DEFAULT_DATA_DIR="/data"
DEFAULT_CORS_ORIGIN="http://localhost:3000"  # Changed from 8080 to 3000 (standard frontend port)

# Use environment variables if set, otherwise use defaults
API_HOST="${API_HOST:-$DEFAULT_API_HOST}"
API_PORT="${API_PORT:-$DEFAULT_API_PORT}"
DATA_DIR="${DATA_DIR:-$DEFAULT_DATA_DIR}"
CORS_ORIGIN="${CORS_ORIGIN:-$DEFAULT_CORS_ORIGIN}"

log "Configuration:"
log "  API Host: $API_HOST"
log "  API Port: $API_PORT"
log "  Data Directory: $DATA_DIR"
log "  CORS Origin: $CORS_ORIGIN"

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# Build the command
CMD_ARGS=(
    "--api-host" "$API_HOST"
    "--api-port" "$API_PORT"
    "--data-dir" "$DATA_DIR"
    "--api-cors" "$CORS_ORIGIN"
)

log "Starting Backend with arguments: ${CMD_ARGS[*]}"

# Find and execute the PyInstaller-built application
# The executable name pattern should match what's defined in rotkehlchen.spec (e.g., backend-*-linux)
EXECUTABLE_NAME_PATTERN="backend-*"

# Search for the executable in /opt/backend. 
# It might be directly in /opt/backend or in a subdirectory if PyInstaller created one (e.g. /opt/backend/backend for non-ONEFILE builds)
CANDIDATE_EXECUTABLE=$(find /opt/backend -name "${EXECUTABLE_NAME_PATTERN}" -type f -executable | head -n 1)

if [ -z "$CANDIDATE_EXECUTABLE" ]; then
    log "ERROR: Backend executable matching '${EXECUTABLE_NAME_PATTERN}' not found in /opt/backend or its subdirectories."
    log "Contents of /opt/backend:"
    ls -lA /opt/backend
    if [ -d "/opt/backend/backend" ]; then
        log "Contents of /opt/backend/backend:"
        ls -lA /opt/backend/backend
    fi
    exit 1
fi

log "Found backend executable: $CANDIDATE_EXECUTABLE"
log "Executing $CANDIDATE_EXECUTABLE with arguments: ${CMD_ARGS[*]} $@"

exec "$CANDIDATE_EXECUTABLE" "${CMD_ARGS[@]}" "$@"