#\!/bin/bash

echo "======================================"
echo "KillZone Phase 2 - Integration Test"
echo "======================================"
echo ""
echo "This script will:"
echo "1. Start the Node.js server in the background"
echo "2. Launch the Atari client emulator"
echo ""
echo "To stop the server, press Ctrl+C in the server terminal"
echo ""

# Start server in background
echo "Starting server..."
cd /Users/dillera/code/killzone/zoneserver
npm start &
SERVER_PID=$\!

# Wait for server to start
sleep 2

# Run client
echo ""
echo "Starting Atari client..."
cd /Users/dillera/code/killzone
~/atari800SIO -netsio build/killzone.atari

# Kill server when done
kill $SERVER_PID 2>/dev/null
