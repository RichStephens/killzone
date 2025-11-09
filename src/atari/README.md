# KillZone Atari 8-bit Client - Phase 2

Player Management & Authentication implementation for Atari 800/XL.

## Quick Start

### Prerequisites

- **cc65 Toolchain** - Cross-platform 6502 C compiler
  - Install: https://cc65.github.io/
  - Verify: `cl65 --version`

- **Atari 800 Emulator** - Located at `~/atari800`
  - Download: https://atari800.sourceforge.io/

- **Server Running** - KillZone server on `localhost:3000`
  - Start: `cd ../../zoneserver && npm start`

### Build

```bash
# Build client binary
make

# Clean build artifacts
make clean

# Watch mode (auto-rebuild on changes)
make watch

# Show help
make help
```

Output binary: `client.bin`

### Run

```bash
# Launch emulator with client
~/atari800 client.bin
```

## Architecture

### Core Modules

- **main.c** - Main game loop and state machine
- **network.c/h** - FujiNet HTTP communication wrapper
- **state.c/h** - Local client state management
- **display.c/h** - Text-based display rendering
- **json.c/h** - Simple JSON parser for API responses
- **hello.c/h** - Utility functions (existing)

### Build System

- **Makefile** - cc65 compilation with size optimization (`-Os`)
- **Compiler Flags**:
  - `-t atari` - Target Atari 8-bit
  - `-Os` - Size optimization (important for 40KB RAM)
  - `--register-vars` - Enable register variable allocation
  - `-Wall -Wextra` - Enable all warnings

## Game Flow - Phase 2

1. **Initialization** - Initialize network, display, and state systems
2. **Connecting** - Connect to server, verify health
3. **Joining** - Enter player name, receive player ID and spawn position
4. **Playing** - Display world state, track local player
5. **Error** - Handle errors gracefully

## API Integration

### FujiNet Network Library

Uses `fujinet-network.h` from `_cache/fujinet-lib/4.7.4-atari/`:

- `network_init()` - Initialize network device
- `network_open()` - Open HTTP connection
- `network_read()` - Read response data
- `network_write()` - Send request data
- `network_close()` - Close connection
- `network_http_post()` - Send POST request
- `network_http_add_header()` - Add HTTP header

### Device Specification

Format: `N:PROTO://HOST:PORT/PATH`

Example: `N:HTTP://localhost:3000/api/health`

### HTTP Operations

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

## JSON Parsing

Simple JSON parser for extracting values from API responses:

```c
/* Extract string value */
json_get_string(json, "id", buffer, len);

/* Extract integer value */
int32_t value;
json_get_int(json, "x", &value);

/* Check for success */
if (json_is_success(json)) { ... }
```

## State Management

### Player State
```c
typedef struct {
    char id[32];
    uint8_t x, y;
    uint8_t health;
    char status[16];
} player_state_t;
```

### World State
```c
typedef struct {
    player_state_t local_player;
    player_state_t other_players[MAX_OTHER_PLAYERS];
    uint8_t other_player_count;
    uint8_t world_width, world_height;
} world_state_t;
```

### Client State Machine
- `STATE_INIT` - Initialization
- `STATE_CONNECTING` - Connecting to server
- `STATE_JOINING` - Joining game
- `STATE_PLAYING` - Main gameplay
- `STATE_DEAD` - Player eliminated
- `STATE_ERROR` - Error state

## Display System

Text-based 40x20 display:
- `.` - Empty cell
- `@` - Local player
- `*` - Other players
- `#` - Walls (future)

## Memory Considerations

Atari 8-bit has ~40KB RAM. Optimizations applied:

- **Code Size**: `-Os` flag minimizes binary size
- **Register Variables**: `--register-vars` keeps hot-path variables in 6502 registers
- **Buffer Sizes**: Limited to 1024 bytes for responses
- **Player Limit**: Maximum 10 other players visible

## Atari 8-bit Specifics

### Network (FujiNet)
- HTTP over serial connection
- Bandwidth limited (optimize JSON responses)
- Timeout handling required
- Device specification format: `N:PROTO://HOST:PORT/PATH`

### Display
- Text mode: 40x20 characters
- Simple printf-based rendering
- No graphics mode (future enhancement)

### Input (Future Phase 3)
- Joystick Port A
- Bits 0-3: Direction (up, down, left, right)
- Bit 4: Fire button
- Active low (0 = pressed)

## Compilation Details

```bash
# Full compilation command
cl65 -t atari -Os --register-vars \
  -o client.bin \
  main.c network.c state.c display.c json.c hello.c

# Produces Atari 800 executable binary
# Can be loaded into emulator or real hardware
```

## Testing

### Manual Testing

**Terminal 1: Start server**
```bash
cd ../../zoneserver
npm start
```

**Terminal 2: Build and run client**
```bash
cd src/atari
make
~/atari800 client.bin
```

**Terminal 3: Test API (optional)**
```bash
# Health check
curl http://localhost:3000/api/health

# Create player
curl -X POST http://localhost:3000/api/player/join \
  -H "Content-Type: application/json" \
  -d '{"name":"TestPlayer"}'
```

### Multi-Client Testing

Run multiple emulator instances to test multi-player scenarios:

```bash
# Terminal 2a
~/atari800 client.bin

# Terminal 2b (new terminal)
~/atari800 client.bin
```

## Debugging

### Console Output
- Network initialization status
- Server connection attempts
- Player join responses
- World state updates
- Error messages

### Emulator Debugging
- Atari 800 emulator has built-in debugger
- Monitor memory and registers
- Trace execution

## Next Steps (Phase 3)

- [ ] Joystick input handling
- [ ] Movement commands
- [ ] Real-time world synchronization
- [ ] Collision detection
- [ ] Combat system

## References

- **FujiNet Documentation**: https://fujinet.online/
- **cc65 Documentation**: https://cc65.github.io/
- **Atari 8-bit Hardware**: https://en.wikipedia.org/wiki/Atari_8-bit_family
- **Atari 800 Emulator**: https://atari800.sourceforge.io/
