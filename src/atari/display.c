/**
 * KillZone Display Module Implementation - Atari 8-bit
 * 
 * Text-based display rendering.
 */

#include "display.h"
#include <stdio.h>
#include <string.h>

/* Screen buffer */
static char screen_buffer[DISPLAY_HEIGHT][DISPLAY_WIDTH];

/**
 * Initialize display system
 */
void display_init(void) {
    display_clear();
    printf("\033[2J\033[H");  /* Clear screen and move cursor to top */
}

/**
 * Close display system
 */
void display_close(void) {
    display_clear();
}

/**
 * Clear screen buffer
 */
void display_clear(void) {
    uint8_t x, y;
    for (y = 0; y < DISPLAY_HEIGHT; y++) {
        for (x = 0; x < DISPLAY_WIDTH; x++) {
            screen_buffer[y][x] = CHAR_EMPTY;
        }
    }
}

/**
 * Draw a character at position
 */
void display_draw_char(uint8_t x, uint8_t y, char c) {
    if (x < DISPLAY_WIDTH && y < DISPLAY_HEIGHT) {
        screen_buffer[y][x] = c;
    }
}

/**
 * Draw the game world
 */
void display_draw_world(const world_state_t *world) {
    uint8_t i;
    
    if (!world) {
        return;
    }
    
    display_clear();
    
    /* Draw other players */
    for (i = 0; i < world->other_player_count; i++) {
        const player_state_t *player = &world->other_players[i];
        if (player->x < DISPLAY_WIDTH && player->y < DISPLAY_HEIGHT) {
            display_draw_char(player->x, player->y, CHAR_ENEMY);
        }
    }
    
    /* Draw local player (last so it appears on top) */
    if (world->local_player.x < DISPLAY_WIDTH && world->local_player.y < DISPLAY_HEIGHT) {
        display_draw_char(world->local_player.x, world->local_player.y, CHAR_PLAYER);
    }
}

/**
 * Draw player status line
 */
void display_draw_status(const player_state_t *player) {
    if (!player) {
        return;
    }
    
    printf("\nPlayer: %s | Pos: (%d,%d) | Health: %d | Status: %s\n",
           player->id, player->x, player->y, player->health, player->status);
}

/**
 * Draw message on screen
 */
void display_draw_message(const char *message) {
    if (message) {
        printf("\n%s\n", message);
    }
}

/**
 * Update screen display
 * 
 * Copies screen buffer to console
 */
void display_update(void) {
    uint8_t x, y;
    
    printf("\033[2J\033[H");  /* Clear screen and move cursor to top */
    
    for (y = 0; y < DISPLAY_HEIGHT; y++) {
        for (x = 0; x < DISPLAY_WIDTH; x++) {
            printf("%c", screen_buffer[y][x]);
        }
        printf("\n");
    }
}

/**
 * Draw status bar (last 4 lines of screen)
 * 
 * Shows: player name, player count, connection status, world ticks
 */
void display_draw_status_bar(const char *player_name, uint8_t player_count, 
                             const char *connection_status, uint16_t world_ticks) {
    if (!player_name || !connection_status) {
        return;
    }
    
    /* Line 1: Player info */
    printf("%-15s | Players: %2d | Conn: %s\n", player_name, player_count, connection_status);
    
    /* Line 2: World state */
    printf("World Ticks: %5d\n", world_ticks);
    
    /* Line 3: Separator */
    printf("----------------------------------------\n");
    
    /* Line 4: Command help */
    printf("WASD/Arrows=Move | Q=Quit | A=Attack\n");
}

/**
 * Draw command help line
 */
void display_draw_command_help(void) {
    printf("WASD/Arrows=Move | Q=Quit | A=Attack\n");
}
