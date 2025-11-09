/**
 * Graphics Module Implementation
 * 
 * Display rendering for Atari 8-bit.
 */

#include "graphics.h"
#include <stdio.h>
#include <string.h>

/* Screen buffer */
static char screen_buffer[SCREEN_BUFFER_SIZE];

/* ANTIC/GTIA memory addresses (Atari 800) */
#define SCREEN_MEMORY 0x0400  /* Default screen memory location */
#define COLPF0 0xD016         /* Playfield color 0 */
#define COLPF1 0xD017         /* Playfield color 1 */
#define COLPF2 0xD018         /* Playfield color 2 */
#define COLPF3 0xD019         /* Playfield color 3 */

/**
 * Initialize graphics system
 */
void graphics_init(void) {
    graphics_clear_screen();
}

/**
 * Close graphics system
 */
void graphics_close(void) {
    graphics_clear_screen();
}

/**
 * Clear screen buffer
 */
void graphics_clear_screen(void) {
    memset(screen_buffer, CHAR_EMPTY, SCREEN_BUFFER_SIZE);
}

/**
 * Draw a character at position
 */
void graphics_draw_char(uint8_t x, uint8_t y, char c) {
    if (x < SCREEN_WIDTH && y < SCREEN_HEIGHT) {
        screen_buffer[y * SCREEN_WIDTH + x] = c;
    }
}

/**
 * Draw a character with color
 */
void graphics_draw_char_color(uint8_t x, uint8_t y, char c, uint8_t color) {
    /* In a real implementation, this would set color registers */
    graphics_draw_char(x, y, c);
}

/**
 * Draw the game world
 * 
 * @param player_x - Player X position
 * @param player_y - Player Y position
 * @param other_players_x - Array of other player X positions
 * @param other_players_y - Array of other player Y positions
 * @param other_player_count - Number of other players
 */
void graphics_draw_world(uint8_t player_x, uint8_t player_y,
                         const uint8_t *other_players_x,
                         const uint8_t *other_players_y,
                         uint8_t other_player_count) {
    graphics_clear_screen();
    
    /* Draw other players */
    for (uint8_t i = 0; i < other_player_count; i++) {
        if (other_players_x[i] < SCREEN_WIDTH && other_players_y[i] < SCREEN_HEIGHT) {
            graphics_draw_char(other_players_x[i], other_players_y[i], CHAR_ENEMY);
        }
    }
    
    /* Draw player (last so it appears on top) */
    if (player_x < SCREEN_WIDTH && player_y < SCREEN_HEIGHT) {
        graphics_draw_char(player_x, player_y, CHAR_PLAYER);
    }
}

/**
 * Draw player status line
 */
void graphics_draw_status(const char *player_id, uint8_t health, uint8_t x, uint8_t y) {
    /* In a real implementation, this would draw status at bottom of screen */
    /* For now, just a stub */
}

/**
 * Draw message on screen
 */
void graphics_draw_message(const char *message) {
    /* In a real implementation, this would display message */
    /* For now, just a stub */
}

/**
 * Update screen display
 * 
 * Copies screen buffer to Atari video memory
 */
void graphics_update(void) {
    /* In a real implementation, this would copy buffer to SCREEN_MEMORY */
    /* For now, print to console for testing */
    printf("\033[2J\033[H");  /* Clear screen and move cursor to top */
    
    for (uint8_t y = 0; y < SCREEN_HEIGHT; y++) {
        for (uint8_t x = 0; x < SCREEN_WIDTH; x++) {
            printf("%c", screen_buffer[y * SCREEN_WIDTH + x]);
        }
        printf("\n");
    }
}
