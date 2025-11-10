# KillZone Phase 2: Player Management & Authentication

**Status**: ✅ COMPLETE

## Overview

Phase 2 implements player management and authentication for the Atari 8-bit client, including server connection initialization, player join/leave, local player representation, and a text-based display system.

## Deliverables

### Atari Client Implementation (`src/atari/`)

#### Core Modules Created (11 files)

1. **main.c** (8KB)
   - Main game loop with state machine
   - State handlers: INIT, CONNECTING, JOINING, PLAYING, DEAD, ERROR
   - Player join response parsing
   - World state parsing

2. **network.c/h** (5.7KB / 1.7KB)
   - FujiNet HTTP wrapper for server communication
   - Device specification builder: `N:PROTO://HOST:PORT/PATH`
   - HTTP GET/POST operations
   - Server API endpoints:
     - `network_health_check()`
     - `network_join_player()`
     - `network_get_world_state()`
     - `network_get_player_status()`
     - `network_move_player()`
     - `network_leave_player()`

3. **state.c/h** (3KB / 1.8KB)
   - Local client state management
   - Player state tracking (id, x, y, health, status)
   - World state management (40x20 grid)
   - Client state machine (6 states)
   - Error message handling

4. **display.c/h** (2.4KB / 0.9KB)
   - Text-based 40x20 display rendering
   - Character mapping:
     - `.` = Empty cell
     - `@` = Local player
     - `*` = Other players
     - `#` = Walls (future)
   - Screen buffer management
   - Status line display

5. **json.c/h** (3KB / 1.4KB)
   - Simple JSON parser for API responses
   - Functions:
     - `json_get_string()` - Extract string values
     - `json_get_int()` - Extract integer values
     - `json_get_uint()` - Extract unsigned integers
     - `json_is_success()` - Check for success flag

6. **hello.c** (0.4KB)
   - Utility functions (existing)

7. **Makefile** (1.3KB)
   - cc65 compilation with optimization flags
   - Build targets: all, clean, watch, help
   - Compiler flags: `-t atari -Os --register-vars -Wall -Wextra`

8. **README.md** (6.1KB)
   - Complete documentation
   - Quick start guide
   - Architecture overview
   - FujiNet API integration guide
   - JSON parsing examples
   - State management documentation
   - Testing procedures

### Architecture

#### Black Box Design
- Each module has clean, documented interface
- Implementation details hidden
- Modules can be replaced independently
- Clear separation of concerns

#### Modular Components

**Network Layer**
- Abstracts FujiNet library
- Builds device specifications
- Handles HTTP GET/POST
- Manages connections

**State Management**
- Independent from network layer
- Tracks local and world state
- Manages client state machine
- Handles error conditions

**Display System**
- Independent rendering
- Text-based 40x20 display
- Modular character mapping
- Status line display

**JSON Parser**
- Minimal implementation for Atari
- Extracts key values efficiently
- No external dependencies
- Memory efficient

#### State Machine

```
INIT → CONNECTING → JOINING → PLAYING
                       ↓
                      DEAD → JOINING
                       ↓
                     ERROR
```

States:
- `STATE_INIT` - Initialization
- `STATE_CONNECTING` - Connecting to server
- `STATE_JOINING` - Joining game
- `STATE_PLAYING` - Main gameplay
- `STATE_DEAD` - Player eliminated
- `STATE_ERROR` - Error state

### FujiNet Integration

#### Device Specification Format
```
N:PROTO://HOST:PORT/PATH
```

Example: `N:HTTP://localhost:3000/api/player/join`

#### HTTP Operations

**GET Request**
```c
network_open(devicespec, OPEN_MODE_HTTP_GET, OPEN_TRANS_NONE);
network_read(devicespec, buffer, len);
network_close(devicespec);
```

**POST Request**
```c
network_open(devicespec, OPEN_MODE_HTTP_POST, OPEN_TRANS_NONE);
network_http_start_add_headers(devicespec);
network_http_add_header(devicespec, "Content-Type: application/json");
network_http_end_add_headers(devicespec);
network_http_post(devicespec, json_body);
network_read(devicespec, buffer, len);
network_close(devicespec);
```

#### FujiNet Library Functions Used
- `network_init()` - Initialize network device
- `network_open()` - Open HTTP connection
- `network_read()` - Read response data
- `network_write()` - Send request data
- `network_close()` - Close connection
- `network_http_post()` - Send POST request
- `network_http_add_header()` - Add HTTP header
- `network_http_start_add_headers()` - Begin header section
- `network_http_end_add_headers()` - End header section

### API Integration

#### Server Endpoints Used
- `GET /api/health` - Health check
- `POST /api/player/join` - Register player
- `GET /api/world/state` - Get world snapshot
- `GET /api/player/:id/status` - Get player status

#### Request/Response Examples

**Join Player**
```
POST /api/player/join
{"name":"PlayerName"}

Response:
{
  "success": true,
  "id": "player_...",
  "x": 20,
  "y": 10,
  "health": 100,
  "status": "alive",
  "world": {...}
}
```

**World State**
```
GET /api/world/state

Response:
{
  "width": 40,
  "height": 20,
  "players": [
    {"id": "...", "x": 20, "y": 10, "health": 100, "status": "alive"},
    ...
  ],
  "timestamp": 1234567890
}
```

### Memory Optimization

Atari 8-bit has ~40KB RAM. Optimizations applied:

- **Code Size**: `-Os` flag minimizes binary size
- **Register Variables**: `--register-vars` keeps hot-path variables in 6502 registers
- **Buffer Sizes**: Limited to 1024 bytes for responses
- **Player Limit**: Maximum 10 other players visible
- **String Buffers**: Minimal allocation (32 bytes for IDs, 128 for errors)

### Build System

#### Compilation
```bash
cl65 -t atari -Os --register-vars \
  -o client.bin \
  main.c network.c state.c display.c json.c hello.c
```

#### Build Targets
- `make` - Build binary
- `make clean` - Remove artifacts
- `make watch` - Auto-rebuild on changes
- `make help` - Show help

### Testing Strategy

#### Manual Testing

**Terminal 1: Start Server**
```bash
cd zoneserver
npm start
```

**Terminal 2: Build and Run Client**
```bash
cd src/atari
make
~/atari800 client.bin
```

**Terminal 3: Test API (optional)**
```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/player/join \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPlayer"}'
```

#### Multi-Client Testing
Run multiple emulator instances to test multi-player scenarios:
```bash
~/atari800 client.bin  # Terminal 2a
~/atari800 client.bin  # Terminal 2b (new terminal)
```

### Code Quality

#### Standards Met
- ✅ Clean black box interfaces
- ✅ Modular, replaceable components
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Memory efficient
- ✅ Well documented
- ✅ No external dependencies (except FujiNet)

#### Documentation
- Inline comments for all functions
- Module-level documentation
- API usage examples
- State machine diagram
- FujiNet integration guide

### Project Structure

```
src/atari/
├── main.c              # Game loop and state machine
├── network.c/h         # FujiNet HTTP wrapper
├── state.c/h           # State management
├── display.c/h         # Display rendering
├── json.c/h            # JSON parser
├── hello.c/h           # Utility functions
├── Makefile            # Build system
└── README.md           # Documentation
```

### Next Steps (Phase 3)

- [ ] Joystick input handling (Port A)
- [ ] Movement command submission
- [ ] Real-time world synchronization
- [ ] Collision detection display
- [ ] Combat system integration
- [ ] Respawn handling

### Key Features Implemented

✅ **Server Connection**
- Network initialization
- Health check verification
- Error handling

✅ **Player Management**
- Player join with name input
- Player ID tracking
- Spawn position handling
- Player status tracking

✅ **State Management**
- Local player state
- World state tracking
- Client state machine
- Error state handling

✅ **Display System**
- 40x20 text-based grid
- Player position rendering
- Status line display
- Message display

✅ **JSON Parsing**
- String value extraction
- Integer value extraction
- Success flag checking
- Error handling

✅ **FujiNet Integration**
- Device specification building
- HTTP GET/POST operations
- Header management
- Response reading

### Files Created

**Source Files** (11 total)
- main.c (8KB) - Main game loop
- network.c (5.7KB) - Network layer
- network.h (1.7KB) - Network interface
- state.c (3KB) - State management
- state.h (1.8KB) - State interface
- display.c (2.4KB) - Display rendering
- display.h (0.9KB) - Display interface
- json.c (3KB) - JSON parser
- json.h (1.4KB) - JSON interface
- hello.c (0.4KB) - Utilities
- Makefile (1.3KB) - Build system

**Documentation**
- README.md (6.1KB) - Complete guide

### Verification Checklist

- [x] All modules compile without errors
- [x] Black box interfaces defined
- [x] FujiNet library integration complete
- [x] JSON parser implemented
- [x] State machine implemented
- [x] Display system implemented
- [x] Network layer implemented
- [x] Error handling comprehensive
- [x] Documentation complete
- [x] Code follows conventions

## Summary

Phase 2 successfully implements player management and authentication for the Atari 8-bit client. The implementation follows black box design principles with modular, replaceable components. All modules have clean interfaces and comprehensive documentation.

The client can now:
1. Initialize network connection
2. Connect to KillZone server
3. Join the game with a player name
4. Receive player ID and spawn position
5. Display world state on 40x20 grid
6. Track local and other player positions
7. Handle errors gracefully

The code is optimized for Atari 8-bit with limited memory (40KB RAM) and uses the FujiNet library for HTTP communication over serial connection.

**Status**: Phase 2 ✅ Complete | Ready for Phase 3 (Movement & Real-Time Synchronization)
