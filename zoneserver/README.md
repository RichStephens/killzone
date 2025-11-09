# KillZone Server

Central authority for world state, entity management, and game logic.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start server
npm start
```

Server runs on `http://localhost:3000`

## Architecture

### Core Modules

- **world.js** - World state management (40x20 grid, player tracking)
- **player.js** - Player entity class (position, health, status)
- **collision.js** - Collision detection engine
- **combat.js** - Combat resolution logic
- **routes/api.js** - REST API endpoint definitions
- **server.js** - Express server setup and middleware

### API Endpoints

All endpoints return JSON responses with appropriate HTTP status codes.

#### Health Check
- `GET /api/health` - Server health status

#### World State
- `GET /api/world/state` - Current world snapshot

#### Player Management
- `POST /api/player/join` - Register new player
- `GET /api/player/:id/status` - Get player status
- `POST /api/player/leave` - Unregister player

#### Movement
- `POST /api/player/:id/move` - Submit movement command

#### Combat (Optional)
- `POST /api/player/:id/attack` - Initiate directed attack

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- world.test.js
npm test -- api.test.js
npm test -- integration.test.js
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Development Workflow

**Terminal 1: Run tests in watch mode**
```bash
npm run test:watch
```

**Terminal 2: Start server**
```bash
npm start
```

**Terminal 3: Manual API testing (optional)**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Create player
curl -X POST http://localhost:3000/api/player/join \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPlayer"}'

# Get world state
curl http://localhost:3000/api/world/state
```

## API Contract

### Request/Response Examples

**Join Player**
```bash
POST /api/player/join
Content-Type: application/json

{"name":"Alice"}

Response (201):
{
  "success": true,
  "id": "player_1234567890_abc123",
  "x": 20,
  "y": 10,
  "health": 100,
  "status": "alive",
  "world": {
    "width": 40,
    "height": 20,
    "players": [...],
    "timestamp": 1234567890
  }
}
```

**Move Player**
```bash
POST /api/player/{id}/move
Content-Type: application/json

{"direction":"up"}

Response (200):
{
  "success": true,
  "playerId": "player_1234567890_abc123",
  "newPos": {"x": 20, "y": 9},
  "collision": false,
  "combatResult": null,
  "worldState": {...}
}
```

**Combat Result**
```json
{
  "type": "combat",
  "winner": "Alice",
  "loser": "Bob",
  "winnerId": "player_1",
  "loserId": "player_2",
  "timestamp": 1234567890
}
```

## Game Rules

- **World**: 40x20 grid
- **Movement**: One cell per direction (up/down/left/right)
- **Collision**: Occurs when two players occupy same position
- **Combat**: Automatic 50/50 random winner determination
- **Respawn**: Loser can rejoin with new player ID

## Code Quality

- Unit tests for all core modules
- Integration tests for realistic scenarios
- API contract tests for all endpoints
- 80%+ test coverage target
- All error paths tested

## Performance Considerations

- In-memory world state (no persistence)
- O(n) collision detection (suitable for 10-20 players)
- Stateless HTTP API (no session management)
- CORS enabled for Atari client

## Future Enhancements

- Health system and damage mechanics
- Weapon/ability system
- Multiple zones/portals
- Persistence layer
- Chat system
- Leaderboards
- Animation and sound
