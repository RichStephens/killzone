# KillZone Atari 8-bit Client Build System
# Builds C code with cc65 toolchain for Atari 800/XL target

# Compiler and tools
CC = cl65
CFLAGS = -t atari -Os --register-vars -Wall -Wextra
LDFLAGS = 

# Source files
SOURCES = main.c network.c state.c display.c json.c hello.c
HEADERS = network.h state.h display.h json.h hello.h
OBJECTS = $(SOURCES:.c=.o)

# Output
TARGET = client.bin

# Directories
BUILD_DIR = build
SRC_DIR = .

# Phony targets
.PHONY: all clean watch help

# Default target
all: $(TARGET)

# Build target
$(TARGET): $(SOURCES) $(HEADERS)
	$(CC) $(CFLAGS) -o $(TARGET) $(SOURCES)
	@echo "Build complete: $(TARGET)"

# Clean build artifacts
clean:
	rm -f $(TARGET) *.o
	@echo "Clean complete"

# Watch mode - rebuild on file changes
watch:
	@echo "Watching for changes (requires fswatch)..."
	@fswatch -r . --exclude build | xargs -I {} make clean all

# Help
help:
	@echo "KillZone Atari Client Build"
	@echo ""
	@echo "Targets:"
	@echo "  make              - Build client binary"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make watch        - Auto-rebuild on file changes"
	@echo "  make help         - Show this help"
	@echo ""
	@echo "After building, run emulator:"
	@echo "  ~/atari800 $(TARGET)"
