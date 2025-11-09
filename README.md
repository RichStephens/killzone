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
- **Atari 800 Emulator** - At `~/atari800SIO` with `-netsio` support (https://atari800.sourceforge.io/)

### Setup

**Automated Test (Recommended)**
```bash
# Builds server and client, starts both, and runs the game
./RUN_TEST.sh
```

**Manual Setup**

**Terminal 1: Start Server**
```bash
cd zoneserver
npm install
npm start
# Server runs on http://localhost:3000
```

**Terminal 2: Build and Run Client**
```bash
make disk
~/atari800SIO -netsio build/killzone.atari
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

### Client (`src/atari/`)

**Technology**: C compiled with cc65 for Atari 8-bit

**Responsibilities**:
- Keyboard input handling (arrow keys, WASD, hjkl)
- HTTP communication with server via FujiNet
- Local state representation
- Display rendering on Atari screen (40x24 text mode)
- Network error handling and recovery
- JSON parsing of server responses

**Key Modules**:
- `killzone.c` - Main game loop and state machine
- `network.c/h` - FujiNet HTTP wrapper
- `display.c/h` - Text-based display rendering
- `state.c/h` - Local client state management
- `json.c/h` - JSON response parser
- `debug.h` - Debug output control flag

## Development Workflow

### Phase 1: Foundation & Infrastructure ✓
- Core world state management
- Basic HTTP server setup
- Unit tests for world and player systems
- Client build system with cc65

### Phase 2: Player Management & Authentication ✓
- Player join/leave endpoints
- Player state tracking
- Display system (40x20 game world)
- Multi-player scenarios
- FujiNet HTTP integration with proper headers

### Phase 3: Movement & Real-Time Synchronization ✓
- Arrow key input handling (WASD, hjkl, Atari arrows)
- Movement command submission to server
- Real-time world state polling
- Game world rendering (dots, @, *)
- Status bar display (player name, count, connection, ticks)
- Clean screen output (all debug removed)

### Phase 4: Combat System (Next)
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

## Atari Client Display & Controls

### Screen Layout
- **Lines 0-19**: Game world (40x20 grid)
  - `.` = Empty space
  - `@` = Local player
  - `*` = Other players
- **Lines 20-23**: Status bar
  - Player name, player count, connection status
  - World ticks counter
  - Command help

### Controls
- **Arrow Keys** - Move in cardinal directions
- **WASD** - Alternative movement (W=up, A=left, S=down, D=right)
- **hjkl** - Vi-style movement (h=left, j=down, k=up, l=right)
- **Q** - Quit game and disconnect

## Project Structure

```
killzone/
├── README.md                    # This file
├── Makefile                     # Main build system
├── RUN_TEST.sh                  # Automated test script
├── zoneserver/                  # Node.js server
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
├── src/atari/                   # Atari 8-bit client
│   ├── Makefile                 # cc65 build system
│   ├── killzone.c               # Main game loop
│   ├── network.c/h              # FujiNet HTTP wrapper
│   ├── display.c/h              # Text-based display
│   ├── state.c/h                # Local state management
│   ├── json.c/h                 # JSON parser
│   ├── debug.h                  # Debug output control
│   ├── hello.c/h                # Utilities
│   ├── build/                   # Build artifacts
│   │   └── killzone.atari       # Final Atari executable
│   └── README.md                # Client documentation
│
└── bounce-world-client/         # Reference implementation
    └── src/atari/               # Example Atari code
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
  "ticks": 42,
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
