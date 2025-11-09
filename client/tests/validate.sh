#!/bin/bash

# KillZone Client Validation Script
# 
# Automated checks for client build and functionality
# Prerequisites:
#   - cc65 toolchain installed
#   - Server running on localhost:3000
#   - Atari 800 emulator at ~/atari800

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_HOST="localhost"
SERVER_PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}KillZone Client Validation${NC}\n"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v cl65 &> /dev/null; then
    echo -e "${RED}ERROR: cc65 toolchain not found${NC}"
    echo "Install cc65 from https://cc65.github.io/"
    exit 1
fi
echo -e "${GREEN}✓ cc65 toolchain found${NC}"

if ! command -v curl &> /dev/null; then
    echo -e "${RED}ERROR: curl not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ curl found${NC}"

# Check server is running
echo -e "\nChecking server..."
if curl -s "http://${SERVER_HOST}:${SERVER_PORT}/api/health" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}ERROR: Server not running at http://${SERVER_HOST}:${SERVER_PORT}${NC}"
    echo "Start server with: cd zoneserver && npm start"
    exit 1
fi

# Build client
echo -e "\nBuilding client..."
cd "$PROJECT_ROOT"

if make clean && make; then
    echo -e "${GREEN}✓ Client built successfully${NC}"
    echo "Binary: $(pwd)/build/client.bin"
else
    echo -e "${RED}ERROR: Build failed${NC}"
    exit 1
fi

# Verify binary exists
if [ ! -f "build/client.bin" ]; then
    echo -e "${RED}ERROR: Binary not created${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Binary verified${NC}"

# Test server API endpoints
echo -e "\nTesting server API endpoints..."

# Health check
echo "Testing /api/health..."
HEALTH=$(curl -s "http://${SERVER_HOST}:${SERVER_PORT}/api/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}ERROR: Health check failed${NC}"
    exit 1
fi

# Player join
echo "Testing /api/player/join..."
JOIN_RESPONSE=$(curl -s -X POST "http://${SERVER_HOST}:${SERVER_PORT}/api/player/join" \
    -H "Content-Type: application/json" \
    -d '{"name":"ValidationTest"}')

if echo "$JOIN_RESPONSE" | grep -q "success"; then
    PLAYER_ID=$(echo "$JOIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✓ Player join passed (ID: $PLAYER_ID)${NC}"
else
    echo -e "${RED}ERROR: Player join failed${NC}"
    exit 1
fi

# World state
echo "Testing /api/world/state..."
WORLD=$(curl -s "http://${SERVER_HOST}:${SERVER_PORT}/api/world/state")
if echo "$WORLD" | grep -q "players"; then
    echo -e "${GREEN}✓ World state passed${NC}"
else
    echo -e "${RED}ERROR: World state failed${NC}"
    exit 1
fi

# Player status
echo "Testing /api/player/{id}/status..."
STATUS=$(curl -s "http://${SERVER_HOST}:${SERVER_PORT}/api/player/${PLAYER_ID}/status")
if echo "$STATUS" | grep -q "success"; then
    echo -e "${GREEN}✓ Player status passed${NC}"
else
    echo -e "${RED}ERROR: Player status failed${NC}"
    exit 1
fi

# Player move
echo "Testing /api/player/{id}/move..."
MOVE=$(curl -s -X POST "http://${SERVER_HOST}:${SERVER_PORT}/api/player/${PLAYER_ID}/move" \
    -H "Content-Type: application/json" \
    -d '{"direction":"up"}')
if echo "$MOVE" | grep -q "success"; then
    echo -e "${GREEN}✓ Player move passed${NC}"
else
    echo -e "${RED}ERROR: Player move failed${NC}"
    exit 1
fi

# Player leave
echo "Testing /api/player/leave..."
LEAVE=$(curl -s -X POST "http://${SERVER_HOST}:${SERVER_PORT}/api/player/leave" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"${PLAYER_ID}\"}")
if echo "$LEAVE" | grep -q "success"; then
    echo -e "${GREEN}✓ Player leave passed${NC}"
else
    echo -e "${RED}ERROR: Player leave failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}All validation tests passed!${NC}"
echo -e "\nTo run client in emulator:"
echo -e "  ~/atari800 $(pwd)/build/client.bin"
