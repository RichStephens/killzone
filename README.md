# KillZone: Atari 8-bit Multiplayer Game Server

A distributed multiplayer game system consisting of a Node.js REST API server and an Atari 8-bit game client communicating via HTTP over FujiNet.

## Project Overview

**KillZone** is a real-time multiplayer game where players move on a shared 40x20 landscape, collide, and engage in combat. The server maintains world state persistence across client connections/disconnections.

### Components

- **ZoneServer** (`zoneserver/`) - Node.js REST API managing shared game state
- **Atari Client** (`client/`) - C code compiled with cc65 for Atari 800/XL emulator

## Quick Start

### Prerequisites

- **Node.js** - For server (https://nodejs.org/)
- **cc65 Toolchain** - For client compilation (https://cc65.github.io/)
- **Atari 800 Emulator** - At `~/atari800` (https://atari800.sourceforge.io/)

### Setup

**Terminal 1: Start Server**
```bash
cd zoneserver
npm install
npm start
# Server runs on http://localhost:3000
```

**Terminal 2: Build and Run Client**
```bash
cd client
make
~/atari800 build/client.bin
```

**Terminal 3: Run Tests (optional)**
```bash
cd zoneserver
npm test
```

## Architecture

### Server (`zoneserver/`)

**Technology**: Node.js + Express.js

**Responsibilities**:
- World state management (40x20 grid)
- Player entity tracking and lifecycle
- Collision detection and combat resolution
- REST API endpoints for client communication
- Request validation and error handling

**Key Modules**:
- `world.js` - World state and player management
- `player.js` - Player entity class
- `collision.js` - Collision detection engine
- `combat.js` - Combat resolution logic
- `routes/api.js` - REST API endpoints

**API Endpoints**:
- `GET /api/health` - Server health check
- `GET /api/world/state` - Current world snapshot
- `POST /api/player/join` - Register new player
- `GET /api/player/:id/status` - Get player status
- `POST /api/player/:id/move` - Submit movement
- `POST /api/player/leave` - Unregister player
- `POST /api/player/:id/attack` - Initiate combat (optional)

### Client (`client/`)

**Technology**: C compiled with cc65 for Atari 8-bit

**Responsibilities**:
- Joystick input handling
- HTTP communication with server via FujiNet
- Local state representation
- Display rendering on Atari screen
- Network error handling and recovery

**Key Modules**:
- `main.c` - Game loop and state machine
- `network.c/h` - FujiNet HTTP wrapper
- `input.c/h` - Joystick input handler
- `graphics.c/h` - Display rendering
- `state.c/h` - Local client state management

## Development Workflow

### Phase 1: Foundation & Infrastructure ✓
- Core world state management
- Basic HTTP server setup
- Unit tests for world and player systems
- Client build system with cc65

### Phase 2: Player Management & Authentication (In Progress)
- Player join/leave endpoints
- Player state tracking
- Display system
- Multi-player scenarios

### Phase 3: Movement & Real-Time Synchronization
- Movement validation and bounds checking
- Collision detection
- World state synchronization
- Joystick input handling

### Phase 4: Combat System
- Combat trigger on collision
- Winner determination
- Loser removal and respawn
- Combat feedback display

### Phase 5: Polish, Scale Testing & Edge Cases
- Performance optimization
- Concurrent client handling
- Network resilience
- Multi-client scenarios

## Testing

### Server Tests

```bash
cd zoneserver

# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm test -- --coverage

# Integration tests only
npm run test:integration
```

### Client Validation

```bash
cd client

# Automated validation
cd tests
./validate.sh

# Manual testing
make
~/atari800 build/client.bin
```

## Game Rules

- **World**: 40x20 grid (x: 0-39, y: 0-19)
- **Movement**: One cell per direction (up/down/left/right)
- **Collision**: Occurs when two players occupy same position
- **Combat**: Automatic 50/50 random winner determination
- **Respawn**: Loser can rejoin with new player ID

## Project Structure

```
killzone/
├── README.md                    # This file
├── claude.md                    # Detailed project specification
├── zoneserver/
│   ├── package.json
│   ├── src/
│   │   ├── server.js            # Express server entry point
│   │   ├── world.js             # World state management
│   │   ├── player.js            # Player entity class
│   │   ├── collision.js         # Collision detection
│   │   ├── combat.js            # Combat resolution
│   │   └── routes/
│   │       └── api.js           # API endpoint definitions
│   ├── tests/
│   │   ├── world.test.js
│   │   ├── player.test.js
│   │   ├── collision.test.js
│   │   ├── combat.test.js
│   │   ├── api.test.js
│   │   └── integration.test.js
│   └── README.md                # Server documentation
│
├── client/
│   ├── Makefile                 # cc65 build system
│   ├── main.c                   # Main game loop
│   ├── network.c/h              # FujiNet HTTP wrapper
│   ├── input.c/h                # Joystick input handler
│   ├── graphics.c/h             # Display rendering
│   ├── state.c/h                # Local state management
│   ├── fujinet.h                # FujiNet library interface
│   ├── build/                   # Build artifacts
│   │   └── client.bin           # Final Atari executable
│   ├── tests/
│   │   └── validate.sh          # Validation script
│   └── README.md                # Client documentation
```

## API Contract

### Player Object
```json
{
  "id": "player_abc123",
  "x": 20,
  "y": 10,
  "health": 100,
  "status": "alive|dead|waiting",
  "joinedAt": 1234567890
}
```

### World State
```json
{
  "width": 40,
  "height": 20,
  "players": [
    {"id": "player_1", "x": 5, "y": 5, "health": 100, "status": "alive"},
    {"id": "player_2", "x": 35, "y": 15, "health": 80, "status": "alive"}
  ],
  "timestamp": 1234567890
}
```

### Combat Result
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

## Code Quality Standards

- **Server**: 80%+ unit test coverage, integration tests for all endpoints
- **Client**: Validation scripts, response parsing verification, emulator testing
- **API**: Versioned endpoints, documented contract, error handling
- **Documentation**: Inline comments for game logic, clear module responsibilities

## Performance Considerations

- In-memory world state (no persistence layer)
- O(n) collision detection (suitable for 10-20 players)
- Stateless HTTP API (no session management)
- CORS enabled for Atari client
- Bandwidth optimization for slow serial connections

## Future Enhancements

- Health system and damage mechanics
- Weapon and ability system
- Multiple zones with portals
- Persistence layer (save/restore world state)
- Chat system between players
- Leaderboards and statistics
- Smooth animation (sub-cell movement)
- Sound effects (POKEY audio)
- Web spectator view
- Server clustering and load balancing

## References

- **cc65 Documentation**: https://cc65.github.io/
- **Atari 8-bit Hardware**: https://en.wikipedia.org/wiki/Atari_8-bit_family
- **FujiNet Project**: https://fujinet.online/
- **Atari 800 Emulator**: https://atari800.sourceforge.io/
- **Node.js**: https://nodejs.org/docs/
- **Express.js**: https://expressjs.com/
- **Jest Testing**: https://jestjs.io/

## License

MIT
