# KillZone: Atari 8-bit Multiplayer Game Server

## Project Overview

**KillZone** is a distributed multiplayer game system consisting of:

1. **ZoneServer** (Node.js REST API) - A stateful world server managing shared game state across all connected clients
2. **Atari 8-bit Client** (C + cc65) - Game client running on Atari 800/XL emulator communicating via HTTP over FujiNet

The shared world is a 40x20 landscape where multiple players move, collide, and engage in combat. The server maintains world state persistence across client connections/disconnections.

### Key Technology Stack

**Development Environment:**
- **cc65 Toolchain**: Cross-platform 6502 C compiler for Atari 8-bit targets (see `llms.txt` for comprehensive cc65 documentation including pragmas, optimizations, and 6502 assembly integration)
- **Build System**: Makefile-based cc65 workflow with target-specific compilation flags (`-t atari` for Atari 800/XL target)
- **Emulation**: Atari 800 emulator at `~/atari800` for local testing and binary execution
- **Network**: FujiNet HTTP library (`fujinet.h`) providing socket abstraction for Atari HTTP client
- **Server**: Node.js with Express.js for REST API

## Architecture

### Server Component (`zoneserver/`)

**Purpose:** Central authority for world state, entity management, and game logic

**Technology Stack:**
- Node.js with Express
- RESTful HTTP API (JSON request/response)
- Stateful in-memory world representation
- Unit tests with Jest/Mocha

**Core Responsibilities:**
- World state management (40x20 landscape)
- Player entity tracking (position, health, status)
- Collision detection and combat resolution
- Client registration/deregistration
- State synchronization API endpoints
- World persistence across client sessions
- Request validation and error handling

**Key API Endpoints:**
- `POST /api/player/join` - Register new player, return initial state
- `GET /api/world/state` - Get current world snapshot
- `POST /api/player/{id}/move` - Submit player movement
- `GET /api/player/{id}/status` - Get player status
- `POST /api/player/{id}/attack` - Initiate combat
- `POST /api/player/leave` - Unregister player
- `GET /api/health` - Server health check

### Client Component (`client/`)

**Purpose:** Atari 8-bit game client with user input handling and server synchronization

**Technology Stack:**
- C language compiled with cc65 (`cl65` compiler driver)
- FujiNet HTTP library (`fujinet.h`) for network communication
- Atari 800 emulator (`~/atari800`) for local testing
- 6502 assembly optimization where needed (see `#pragma register-vars` in cc65 docs)
- Unit tests via emulation + validation scripts

**Core Responsibilities:**
- Input handling (joystick via Atari input ports)
- HTTP communication with ZoneServer via FujiNet
- Local state representation (player position, world view)
- Rendering game display on Atari screen (ANTIC/GTIA)
- Request/response handling for server API
- Error handling and connection recovery
- Bandwidth optimization for slow serial connections

**Build Process:**
- Source in `client/` directory (C files compiled with cc65)
- Compilation: `cl65 -t atari -o client.bin client.c network.c input.c graphics.c state.c`
- Binary output: `.bin` file for Atari 800 emulator
- Local testing: `~/atari800 client.bin` launches emulator with compiled binary

**Atari 8-bit Specific Considerations:**

From `llms.txt` cc65 documentation:

1. **Memory Management**: Use `#pragma code-name` and `#pragma data-name` to control memory layout
2. **Performance**: Apply `#pragma register-vars` to keep hot-path variables in 6502 registers
3. **Inline Assembly**: Use inline 6502 assembly for timing-critical code (input polling, network state machines)
4. **Optimization Flags**: Use `-Os` for size optimization (important on 8-bit systems with limited memory)
5. **Zero Page**: Leverage zero page addressing with `#pragma zpsym` for fast variable access
6. **Stack Management**: Monitor stack usage; use `#pragma check-stack` during development

## Development Workflow: Lock-Step Development

All features are developed in parallel server/client phases with continuous testing. Each phase results in a working, tested feature end-to-end.

### Phase 1: Foundation & Infrastructure

**Server:**
- Implement core world state management
  - World structure (40x20 grid)
  - Player entity system
  - World initialization and persistence
- Basic HTTP server setup
  - Health check endpoint (`GET /api/health`)
  - JSON request/response handling
  - CORS configuration for Atari client
- Unit tests
  - World state operations
  - Player addition/removal
  - Position validation

**Client:**
- FujiNet HTTP communication layer
  - HTTP GET/POST wrapper functions via `fujinet.h`
  - JSON response parsing (minimal for 8-bit)
  - Connection state machine
- Build system
  - Makefile setup with cc65 toolchain
  - Binary generation for Atari emulator
- Validation
  - Test HTTP requests to running server
  - Verify response parsing
  - Emulator execution test

**Test Together:**
- Start server (`npm start` on `localhost:3000`)
- Launch client in emulator (`~/atari800 client.bin`)
- Verify client can reach `/api/health` endpoint
- Check server logs for incoming HTTP requests

### Phase 2: Player Management & Authentication

**Server:**
- Player join/leave endpoints
  - `POST /api/player/join` with player name
  - Random spawn position (40x20 grid)
  - Return player ID and initial world state
  - `POST /api/player/leave` with player ID
  - Clean removal from world
- Player state tracking
  - `GET /api/player/{id}/status` returns player object
  - `GET /api/world/state` returns full world snapshot
- Unit tests
  - Player lifecycle (join/leave)
  - State consistency
  - Multiple player scenarios

**Client:**
- Server connection initialization
  - Join request on startup
  - Parse player ID and initial world state
  - Store player ID for future requests
- Local player representation
  - Track own position and health
  - Maintain local world view
  - Handle disconnection/reconnection
- Display system
  - Simple text-based Atari display
  - Show player position and other players
  - Show game status

**Test Together:**
- Server running with test suite active
- Start first client, verify join response
- Display initial world state on Atari screen
- Add second client (via separate emulator instance or scripted join)
- Verify world state includes both players

### Phase 3: Movement & Real-Time Synchronization

**Server:**
- Movement validation endpoint
  - `POST /api/player/{id}/move` with direction
  - Validate bounds (0-39 x, 0-19 y)
  - Return new position and updated world state
  - Collision detection (same-position = collision)
- World state synchronization
  - Track all player positions
  - Return other players' positions in state responses
- Unit tests
  - Movement in all directions
  - Bounds validation
  - Collision detection logic

**Client:**
- Joystick input handling
  - Read Atari joystick port (PORTA: bits 2-5 for directions)
  - Debounce input (ignore repeated signals)
  - Convert joystick to movement direction
- Movement submission
  - Send move request to server
  - Handle response with new position
  - Update local state
- World view rendering
  - Display self as different character than others
  - Show other players on 40x20 grid view
  - Update based on server state

**Test Together:**
- Two clients running simultaneously
- Move one player, verify position updates on both clients
- Test boundary conditions (edges of map)
- Verify collision detection triggers (move to occupied space)

### Phase 4: Combat System

**Server:**
- Combat trigger on collision
  - When two players occupy same position
  - Determine winner (random 50/50 or health-based)
  - Remove loser from world
  - Return combat result to both players
- Combat endpoint (optional direct attack)
  - `POST /api/player/{id}/attack` with target position
  - Validate adjacency or range
  - Resolve combat
- Unit tests
  - Combat winner determination
  - Loser removal from world
  - Multiple concurrent combats

**Client:**
- Combat feedback display
  - Show when collision detected
  - Display win/loss result
  - Handle respawn after loss
- Respawn handling
  - Auto-rejoin after combat loss
  - Random spawn position
  - Resume play
- Visual feedback
  - Flash or color change on combat
  - Display messages (you won/lost)
  - Smooth respawn transition

**Test Together:**
- Move two players to same position
- Observe combat resolution
- One player removed (rejoins)
- Verify world state reflects winner only
- Test multiple concurrent combats

### Phase 5: Polish, Scale Testing & Edge Cases

**Server:**
- Performance optimization
  - Profile hot paths
  - Optimize collision detection for many players
  - Cache commonly-accessed state
- Concurrent client handling
  - Stress test with 5-10 simultaneous players
  - Verify no race conditions
  - Check memory usage
- Comprehensive integration tests
  - Complex multi-player scenarios
  - Network latency simulation
  - Connection drop/recovery

**Client:**
- Network resilience
  - Graceful handling of server unavailability
  - Timeout and retry logic
  - Reconnection handling
- Multi-client scenarios
  - Test with multiple emulator instances
  - Verify consistency across clients
  - Measure sync latency
- Edge cases
  - Rapid movement commands
  - Quick disconnect/reconnect
  - Combat while moving

**Test Together:**
- Launch 4-6 clients simultaneously
- Run coordinated test scenarios
- Measure latency and consistency
- Identify bottlenecks

## Testing Strategy

### Server Testing (`zoneserver/tests/`)

**Unit Tests** - Test individual components in isolation

```bash
# Tests for world state management
tests/world.test.js
- World initialization
- Player addition/removal
- Position tracking
- Player lookup

# Tests for movement mechanics
tests/movement.test.js
- Bounds validation
- Position updates
- Multiple player movement

# Tests for collision and combat
tests/collision.test.js
- Collision detection algorithm
- Combat winner determination
- Player removal on loss
- Edge cases (boundaries, simultaneous collisions)

# Tests for API endpoints
tests/api.test.js
- POST /api/player/join
- POST /api/player/leave
- POST /api/player/{id}/move
- GET /api/world/state
- GET /api/player/{id}/status
- GET /api/health
```

**Integration Tests** - Test API endpoints with realistic request flows

```bash
tests/integration.test.js
- Player lifecycle (join → move → combat → leave)
- Concurrent player scenarios (3+ players)
- State consistency across requests
- Error handling (invalid moves, non-existent players)
- Server recovery after errors
```

**Running Tests:**
```bash
cd zoneserver
npm install
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm run test:watch          # Watch mode during development
npm run test:integration    # Integration tests only
```

### Client Testing

**Emulation Testing** - Run compiled binary in Atari 800 emulator

1. **Prerequisites:**
   - Server running on `localhost:3000`
   - Emulator configured to use host networking
   - Build client: `cd client && make`

2. **Execution:**
   ```bash
   ~/atari800 client.bin
   # Emulator opens, client connects to server
   # Use joystick/keyboard for input
   # Observe display and server logs
   ```

3. **Test Scenarios:**
   - Solo play: Verify basic movement and display
   - Collision: Move toward static server-side player
   - Multi-client: Launch second emulator instance
   - Network glitch: Stop/restart server while client running
   - Long play session: Test stability over time

**Validation Scripts** - Automated checks of client behavior

```bash
tests/validate.sh
- Compile client with cc65
- Start server
- Launch emulator with binary
- Inject movement commands
- Verify HTTP requests to server
- Check response parsing
- Validate state consistency
```

**Regression Testing:**
Before each feature enhancement:

1. Run full server test suite (`npm test`)
2. Verify all integration tests pass
3. Test client against known-good server state
4. Run multi-client scenarios (2-4 instances)
5. Verify API contract unchanged

### Continuous Testing Workflow During Development

**Terminal 1: Server**
```bash
cd zoneserver
npm run test:watch    # Watches for changes, runs tests automatically
```

**Terminal 2: Client Build & Emulation**
```bash
cd client
make watch            # Auto-rebuilds on source changes
# Manually launch emulator when ready:
~/atari800 client.bin
```

**Terminal 3: Manual API Testing (optional)**
```bash
# Test endpoints directly during development
curl -X POST http://localhost:3000/api/player/join \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPlayer"}'

curl http://localhost:3000/api/world/state
```

## Project Structure

```
killzone/
├── llms.txt                        # cc65 and Atari development reference docs
├── zoneserver/
│   ├── package.json               # Node dependencies and scripts
│   ├── src/
│   │   ├── server.js              # Express server entry point
│   │   ├── world.js               # World state management
│   │   ├── player.js              # Player entity class
│   │   ├── collision.js           # Collision detection engine
│   │   ├── combat.js              # Combat resolution logic
│   │   └── routes/
│   │       └── api.js             # API endpoint definitions
│   ├── tests/
│   │   ├── world.test.js          # World state tests
│   │   ├── player.test.js         # Player entity tests
│   │   ├── movement.test.js       # Movement validation tests
│   │   ├── collision.test.js      # Collision detection tests
│   │   ├── combat.test.js         # Combat logic tests
│   │   ├── api.test.js            # Individual endpoint tests
│   │   └── integration.test.js    # End-to-end scenario tests
│   └── README.md                   # Server documentation
│
├── client/
│   ├── Makefile                   # cc65 build automation
│   ├── hello.c                    # Skeleton client (existing)
│   ├── main.c                     # Main game loop and state machine
│   ├── network.c                  # FujiNet HTTP wrapper
│   ├── network.h
│   ├── input.c                    # Joystick/keyboard input handler
│   ├── input.h
│   ├── graphics.c                 # Display rendering (ANTIC/GTIA)
│   ├── graphics.h
│   ├── state.c                    # Local client state management
│   ├── state.h
│   ├── fujinet.h                  # FujiNet library (provided, no modifications)
│   ├── tests/
│   │   └── validate.sh            # Client validation script
│   ├── build/                     # Build artifacts (generated)
│   │   └── client.bin             # Final Atari executable
│   └── README.md                  # Client documentation
│
└── README.md                       # Project root documentation
```

## API Contract

### Data Structures

**Player Object:**
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

**World State:**
```json
{
  "width": 40,
  "height": 20,
  "players": [
    {
      "id": "player_1",
      "x": 5,
      "y": 5,
      "health": 100,
      "status": "alive"
    },
    {
      "id": "player_2",
      "x": 35,
      "y": 15,
      "health": 80,
      "status": "alive"
    }
  ],
  "timestamp": 1234567890
}
```

**Movement Response:**
```json
{
  "success": true,
  "playerId": "player_abc123",
  "newPos": {
    "x": 21,
    "y": 10
  },
  "collision": false,
  "worldState": { /* World State */ }
}
```

**Combat Result:**
```json
{
  "type": "combat",
  "winner": "player_1",
  "loser": "player_2",
  "winnerId": "player_abc123",
  "loserId": "player_xyz789",
  "timestamp": 1234567890
}
```

### REST API Endpoints

All responses include appropriate HTTP status codes and error messages.

**POST /api/player/join**
- Description: Register new player
- Request body: `{ "name": "PlayerName" }`
- Response: `{ "id": "player_abc123", "x": 20, "y": 10, "world": { /* World State */ } }`
- Status: `201 Created`
- Error: `400 Bad Request` if name missing/invalid

**GET /api/world/state**
- Description: Get current world snapshot
- Response: `{ /* World State */ }`
- Status: `200 OK`
- Cache: Consider 1-2 second cache for bandwidth optimization

**POST /api/player/{id}/move**
- Description: Submit player movement command
- Request body: `{ "direction": "up|down|left|right" }`
- Response: `{ /* Movement Response */ }`
- Status: `200 OK` on success, `400 Bad Request` on bounds violation
- Collision: Automatically triggers combat if players occupy same space

**GET /api/player/{id}/status**
- Description: Get specific player status
- Response: `{ /* Player Object */ }`
- Status: `200 OK`
- Error: `404 Not Found` if player doesn't exist

**POST /api/player/leave**
- Description: Unregister player from world
- Request body: `{ "id": "player_abc123" }`
- Response: `{ "success": true, "id": "player_abc123" }`
- Status: `200 OK`
- Side effect: Removes player from world immediately

**POST /api/player/{id}/attack** (optional future endpoint)
- Description: Initiate directed attack on adjacent/nearby player
- Request body: `{ "targetX": 21, "targetY": 10 }`
- Response: `{ /* Combat Result */ }`
- Status: `200 OK`

**GET /api/health**
- Description: Server health check
- Response: `{ "status": "healthy", "uptime": 12345, "playerCount": 3 }`
- Status: `200 OK`

## Development Workflow

### Initial Setup

```bash
# 1. Clone or create project structure
mkdir killzone && cd killzone

# 2. Initialize server
mkdir zoneserver && cd zoneserver
npm init -y
npm install express jest

# 3. Initialize client
mkdir ../client && cd ../client
# Requires cc65 installed and ~/atari800 emulator available
```

### Starting Development Session

**Terminal 1: Run Server with Auto-Testing**
```bash
cd killzone/zoneserver
npm run test:watch
# Tests re-run on file changes
# Server can be launched separately for manual testing
npm start  # In another terminal, runs on http://localhost:3000
```

**Terminal 2: Build and Test Client**
```bash
cd killzone/client
make watch
# Automatically rebuilds on source changes
# When ready to test:
~/atari800 client.bin
```

**Terminal 3: Manual API Testing (optional)**
```bash
# Quick endpoint testing while developing
curl http://localhost:3000/api/health
```

### Feature Development Process

1. **Server**: Write unit test for new feature
   - Test covers expected behavior and edge cases
   - Run with `npm test` - should fail initially
2. **Server**: Implement feature until test passes
   - Update data structures as needed
   - Implement endpoint logic
3. **Server**: Add integration test
   - Test realistic API usage flow
4. **Client**: Write validation scenario
   - Outline expected HTTP calls and responses
5. **Client**: Implement client feature
   - Write C code to use new server API
   - Compile with `make`
6. **Test Together**: Run emulator with server
   - Verify end-to-end functionality
   - Check for latency or bandwidth issues
7. **Regression**: Run full test suite
   - All server tests still pass
   - No breaking API changes

### Code Quality Standards

**Server:**
- 80%+ unit test coverage (verify with `npm test -- --coverage`)
- Integration tests for all public API endpoints
- All error paths tested (invalid input, missing data, edge cases)
- API responses validated for correctness

**Client:**
- Validation scripts confirm expected HTTP requests
- Response parsing verified against sample payloads
- Build without warnings (`-Wall -Wextra` in cc65)
- Emulator-based functional testing for each feature

**API Contract:**
- Changes to API require updating both server tests and client code
- Version endpoints if breaking changes necessary
- Document all changes in endpoint descriptions

**Documentation:**
- Inline comments for non-obvious game logic
- Collision detection algorithm well-commented
- Combat resolution logic documented
- Network state machine clearly explained in client code

## Key Implementation Notes

### World Boundaries & Layout
- World dimensions: 40x20 (x: 0-39, y: 0-19)
- Movement commands update position by 1 in requested direction
- Movement validation must reject out-of-bounds positions
- Server enforces all bounds; client should validate locally too
- Spawn positions should be randomized (avoid clusters)

### Collision Detection
- Occurs when two players move to or occupy the same (x, y) position
- Server detects collision immediately after movement
- Collision automatically triggers combat resolution
- Movement that would cause collision is still allowed (triggers combat)

### Combat Resolution
- Simple model: Random 50% winner determination (or health-based if health tracking added)
- Loser: Removed from world immediately
- Loser can rejoin by sending join request again (respawn)
- Winner: Remains at collision position
- Combat result sent to both players (before loser removed from state)
- No draw: Always exactly one winner

### Network Considerations
- HTTP is stateless; each request is independent
- Client should gracefully handle server unavailability (timeout after 3-5 seconds)
- FujiNet library provides network retry logic
- For Atari bandwidth constraints: Keep JSON responses minimal, use compression if possible
- Round-trip latency varies; client should not assume instant response
- Parallel requests from multiple clients may arrive out-of-order; server should use timestamps for ordering if needed

### Atari 8-bit Memory Constraints

From `llms.txt` cc65 documentation:

1. **RAM Layout**: Atari has ~40KB RAM; allocate carefully
   - Use `#pragma code-name` to place code in ROM cartridge if needed
   - Use `#pragma data-name` for read-only data placement
2. **Zero Page**: Fast access (2-3 cycles vs 4+ for regular memory)
   - Reserve zero page for hot-path variables (player position, network state)
   - Use `#pragma zpsym` to mark zero page allocation
3. **Register Variables**: Keep loop counters and network state in 6502 registers
   - Use `#pragma register-vars` to enable register allocation
   - Critical for input polling and network loops
4. **Code Size**: Optimize with `-Os` flag (size optimization)
   - Balance code size vs speed
   - Inline assembly for critical sections only
5. **Stack Usage**: Monitor with `#pragma check-stack` during development
   - Recursive function calls dangerous on limited stack
   - Use `stx` (store indexed) carefully to avoid stack overflow

### Emulator Testing Workflow

**Atari 800 Emulator Configuration:**
- Verify networking enabled (check ~/atari800 config)
- Localhost:3000 must be reachable from emulator
- Consider emulator performance: May run slower than real hardware

**Client Binary Generation:**
```bash
cd client
cl65 -t atari -o client.bin \
  main.c network.c input.c graphics.c state.c \
  -Os --register-vars
# -t atari: Target Atari 8-bit
# -Os: Size optimization (important for 40KB RAM)
# --register-vars: Enable register variable allocation
```

**Launching Emulator:**
```bash
~/atari800 client.bin
# Binary automatically loads into Atari memory
# Client code runs and connects to server
```

## Future Enhancements

- **Advanced Combat**: Health system, weapons, special abilities
- **Multiple Zones**: Portal mechanics to connect multiple 40x20 worlds
- **Persistence**: Save world state to disk, server restart recovery
- **Chat System**: Text messaging between players
- **Leaderboards**: Win/loss tracking, statistics
- **Animation**: Smooth player movement (sub-cell animation)
- **Sound**: Atari POKEY audio effects
- **Web Spectator**: Browser-based spectator view
- **Server Clustering**: Multiple server instances with load balancing
- **Analytics**: Event logging and game statistics

## References & Resources

**cc65 Documentation** (in `llms.txt`):
- Compiler options and pragmas for Atari optimization
- Inline assembly integration
- Memory layout and zero page usage
- Register variable allocation
- Build target specifications

**Atari 8-bit Resources**:
- ANTIC chip (display list processor)
- GTIA (graphics capabilities)
- Joystick input via Port A
- Display list interrupt (DLI) techniques
- Player/missile graphics

**Network & FujiNet**:
- FujiNet HTTP library in `fujinet.h`
- Socket abstraction for Atari
- HTTP request/response handling

**Development Tools**:
- Node.js: https://nodejs.org/docs/
- cc65: https://cc65.github.io/
- Jest testing: https://jestjs.io/
- Express.js: https://expressjs.com/

**Game Development Patterns**:
- State machine for client connection state
- Entity-component system for world management
- Collision detection algorithms
- Combat resolution strategies

## Testing Checklist Before Feature Release

- [ ] All server unit tests pass (`npm test`)
- [ ] All server integration tests pass
- [ ] Server test coverage ≥ 80%
- [ ] Client compiles without warnings
- [ ] Client builds successfully with `make`
- [ ] Single client connects to server and can move
- [ ] Two clients can move independently
- [ ] Collision detection triggers combat correctly
- [ ] Losers can rejoin and respawn
- [ ] Multiple concurrent players work (4+ clients)
- [ ] Server remains responsive under load
- [ ] No memory leaks on server
- [ ] Client display updates correctly
- [ ] Network timeout handling works
- [ ] Edge cases tested (bounds, rapid input, disconnects)

