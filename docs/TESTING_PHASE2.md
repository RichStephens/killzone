# Phase 2 Testing Guide - KillZone Atari Client

## Setup

### Terminal 1: Start the Node.js Server

```bash
cd /Users/dillera/code/killzone/zoneserver
npm install
npm start
```

The server will start on `http://localhost:3000`

### Terminal 2: Build and Run the Atari Client

```bash
cd /Users/dillera/code/killzone
make disk
~/atari800SIO -netsio build/killzone.atari
```

## Expected Flow

1. **Startup Screen**
   - "KillZone - Atari 8-bit Multiplayer Game"
   - "Initializing..."
   - "Press any key to continue..."

2. **Connection Phase**
   - Client initializes network
   - Sends health check to server
   - Displays: "[Frame X] State: 1" (STATE_CONNECTING)
   - Shows: "Checking server health (attempt 1)..."
   - Shows: "Health check returned: X bytes"
   - Shows: "Response: {success:true}"
   - Transitions to STATE_JOINING

3. **Join Phase**
   - Displays: "[Frame X] State: 2" (STATE_JOINING)
   - Shows: "Enter player name (max 31 chars): "
   - Type a name and press Enter
   - Client sends join request to server
   - Shows: "Joining as 'YourName'..."
   - Shows: "Join response received (X bytes)"
   - Shows: "Player ID: player_..."
   - Shows: "Spawn position: (X, Y)"
   - Shows: "Health: 100"
   - Transitions to STATE_PLAYING

4. **Playing Phase**
   - Displays: "[Frame X] State: 3" (STATE_PLAYING)
   - Client periodically fetches world state
   - Displays player position and status

## Debugging

If you see "Unexpected command frame at state 2" errors:
- This means FujiNet is receiving invalid commands
- Check that the server is running
- Verify network connectivity

If the client hangs:
- It will timeout after 100 frames
- Check server logs for errors
- Verify the API endpoints are responding

## API Endpoints Being Called

- `GET /api/health` - Health check
- `POST /api/player/join` - Join with player name
- `GET /api/world/state` - Get world state
- `GET /api/player/:id/status` - Get player status

## Next Steps

After successful testing:
- Phase 3: Implement joystick input and movement
- Phase 4: Combat system
- Phase 5: Multi-player synchronization
