# KillZone Atari 8-bit Client

Game client for Atari 800/XL emulator communicating with KillZone server via HTTP over FujiNet.

## Quick Start

### Prerequisites

- **cc65 Toolchain** - Cross-platform 6502 C compiler
  - Install: https://cc65.github.io/
  - Verify: `cl65 --version`

- **Atari 800 Emulator** - Located at `~/atari800`
  - Download: https://atari800.sourceforge.io/

- **Server Running** - KillZone server on `localhost:3000`
  - Start: `cd ../zoneserver && npm start`

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

Output binary: `build/client.bin`

### Run

```bash
# Launch emulator with client
~/atari800 build/client.bin
```

## Architecture

### Core Modules

- **main.c** - Main game loop and state machine
- **network.c/h** - FujiNet HTTP communication wrapper
- **input.c/h** - Joystick input handling
- **graphics.c/h** - Display rendering (ANTIC/GTIA)
- **state.c/h** - Local client state management
- **fujinet.h** - FujiNet library interface

### Build System

- **Makefile** - cc65 compilation with size optimization (`-Os`)
- **Compiler Flags**:
  - `-t atari` - Target Atari 8-bit
  - `-Os` - Size optimization (important for 40KB RAM)
  - `--register-vars` - Enable register variable allocation
  - `-Wall -Wextra` - Enable all warnings

## Game Flow

1. **Initialization** - Connect to server, verify health
2. **Join** - Enter player name, receive player ID and initial world state
3. **Playing** - Read joystick input, move, see other players
4. **Combat** - Collision detection, combat resolution
5. **Respawn** - Rejoin after elimination

## Input

**Joystick (Port A)**
- Up/Down/Left/Right - Move player
- Fire - (Reserved for future use)

**Keyboard**
- Q - Quit game

## Network Communication

### Join Player
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

### Move Player
```
POST /api/player/{id}/move
{"direction":"up|down|left|right"}

Response:
{
  "success": true,
  "playerId": "player_...",
  "newPos": {"x": 20, "y": 9},
  "collision": false,
  "combatResult": null,
  "worldState": {...}
}
```

### World State
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

## Testing

### Validation Script

```bash
# Run automated validation
cd tests
./validate.sh

# This will:
# 1. Check prerequisites (cc65, curl, server)
# 2. Build client
# 3. Test all API endpoints
# 4. Verify binary creation
```

### Manual Testing

**Terminal 1: Start server**
```bash
cd ../zoneserver
npm start
```

**Terminal 2: Build and run client**
```bash
cd ../client
make
~/atari800 build/client.bin
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

## Memory Considerations

Atari 8-bit has ~40KB RAM. Optimizations applied:

- **Code Size**: `-Os` flag minimizes binary size
- **Register Variables**: `--register-vars` keeps hot-path variables in 6502 registers
- **Zero Page**: Reserved for fast access variables
- **Stack Monitoring**: Use `#pragma check-stack` during development

## Atari 8-bit Specifics

### Display (ANTIC/GTIA)
- Text mode: 40x20 characters
- Colors: Playfield colors (COLPF0-COLPF3)
- Display list: Controlled by ANTIC chip

### Input (Joystick Port A)
- Bits 0-3: Direction (up, down, left, right)
- Bit 4: Fire button
- Active low (0 = pressed)

### Network (FujiNet)
- HTTP over serial connection
- Bandwidth limited (optimize JSON responses)
- Timeout handling required

## Compilation Details

```bash
# Full compilation command
cl65 -t atari -Os --register-vars \
  -o build/client.bin \
  main.c network.c input.c graphics.c state.c

# Produces Atari 800 executable binary
# Can be loaded into emulator or real hardware
```

## Debugging

### Console Output
- Main game loop prints status messages
- Network requests logged with responses
- Input events displayed

### Emulator Debugging
- Atari 800 emulator has built-in debugger
- Monitor memory and registers
- Trace execution

## Future Enhancements

- Smooth animation (sub-cell movement)
- Sound effects (POKEY audio)
- Advanced graphics (player/missile graphics)
- Network resilience (retry logic, reconnection)
- Multi-client coordination
- Performance optimization for many players

## References

- **cc65 Documentation**: https://cc65.github.io/
- **Atari 8-bit Hardware**: https://en.wikipedia.org/wiki/Atari_8-bit_family
- **FujiNet Project**: https://fujinet.online/
- **Atari 800 Emulator**: https://atari800.sourceforge.io/
