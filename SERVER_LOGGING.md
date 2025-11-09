# KillZone Server - Enhanced Logging

## Overview

The server now includes comprehensive logging to track all client connections and commands in real-time.

## Log Output Format

### Request Logging
```
[2025-11-09T15:30:45.123Z] POST   /api/player/join | Body: {"name":"Player1"}
  ✅ Response [201]: {"success":true,"id":"player_1731...
```

### Client Connection Events

**Player Join**
```
  👤 Player joined: "Player1" (ID: player_1731...) at position (15, 8) - Total players: 1
```

**Player Leave**
```
  👋 Player left: "Player1" (ID: player_1731...) - Total players: 0
```

**Player Movement**
```
  🎮 Player1 moved right to (16, 8)
  🎮 Player2 moved up to (10, 5)
```

**Combat Event**
```
  ⚔️  Combat: "Player1" vs "Player2" - Winner: "Player1"
```

**Health Check**
```
  📊 Health check - Players online: 3, Uptime: 45.2s
```

## Log Levels

- ✅ **Success** - Successful requests (green checkmark)
- ❌ **Error** - Failed requests (red X)
- 👤 **Player Event** - Join/leave events
- 🎮 **Game Action** - Movement commands
- ⚔️ **Combat** - Combat results
- 📊 **Status** - Health checks and stats

## Example Server Output

```
KillZone Server running on http://localhost:3000
World dimensions: 40x20
API health check: GET http://localhost:3000/api/health

[2025-11-09T15:30:45.123Z] GET    /api/health
  📊 Health check - Players online: 0, Uptime: 0.1s
  ✅ Response [200]: {"status":"healthy","uptime":0.1...

[2025-11-09T15:30:46.234Z] POST   /api/player/join | Body: {"name":"Alice"}
  👤 Player joined: "Alice" (ID: player_1731...) at position (20, 10) - Total players: 1
  ✅ Response [201]: {"success":true,"id":"player_1731...

[2025-11-09T15:30:47.345Z] POST   /api/player/join | Body: {"name":"Bob"}
  👤 Player joined: "Bob" (ID: player_1731...) at position (15, 8) - Total players: 2
  ✅ Response [201]: {"success":true,"id":"player_1731...

[2025-11-09T15:30:48.456Z] POST   /api/player/1731.../move | Body: {"direction":"right"}
  🎮 Alice moved right to (21, 10)
  ✅ Response [200]: {"success":true,"playerId":"player_1731...

[2025-11-09T15:30:49.567Z] POST   /api/player/1731.../move | Body: {"direction":"up"}
  🎮 Bob moved up to (15, 7)
  ✅ Response [200]: {"success":true,"playerId":"player_1731...

[2025-11-09T15:30:50.678Z] POST   /api/player/leave | Body: {"id":"player_1731..."}
  👋 Player left: "Alice" (ID: player_1731...) - Total players: 1
  ✅ Response [200]: {"success":true,"id":"player_1731..."}
```

## Features

### Request Details
- **Timestamp** - ISO 8601 format
- **HTTP Method** - GET, POST, PUT, DELETE
- **Endpoint Path** - Full API path
- **Request Body** - JSON payload for POST/PUT requests

### Response Details
- **Status Code** - HTTP status (200, 201, 400, 404, 500)
- **Response Preview** - First 100 characters of response
- **Status Indicator** - ✅ for success, ❌ for errors

### Event Tracking
- Player joins with name, ID, position, and total player count
- Player leaves with name, ID, and remaining player count
- Movement commands with direction and new position
- Combat results with both player names and winner

## Debugging

Use the logs to:
- Monitor active player sessions
- Track player movements and interactions
- Identify network errors and failed requests
- Verify server responsiveness
- Debug client connection issues

## Performance Impact

Logging is minimal and non-blocking:
- Uses console.log (async)
- No database writes
- No external API calls
- Suitable for production use
