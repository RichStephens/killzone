/**
 * Graphics Module Header
 * 
 * Display rendering for Atari 8-bit using ANTIC/GTIA.
 * Renders game world, player position, and status information.
 */

#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <stdint.h>

/* Screen dimensions */
#define SCREEN_WIDTH 40
#define SCREEN_HEIGHT 20
#define SCREEN_BUFFER_SIZE (SCREEN_WIDTH * SCREEN_HEIGHT)

/* Display characters */
#define CHAR_EMPTY '.'
#define CHAR_PLAYER '@'
#define CHAR_ENEMY '*'
#define CHAR_WALL '#'

/* Color definitions (GTIA) */
#define COLOR_BLACK 0
#define COLOR_WHITE 1
#define COLOR_RED 2
#define COLOR_GREEN 3
#define COLOR_BLUE 4
#define COLOR_YELLOW 5

/* Initialization and lifecycle */
void graphics_init(void);
void graphics_close(void);

/* Rendering */
void graphics_clear_screen(void);
void graphics_draw_world(uint8_t player_x, uint8_t player_y,
                         const uint8_t *other_players_x,
                         const uint8_t *other_players_y,
                         uint8_t other_player_count);
void graphics_draw_status(const char *player_id, uint8_t health, uint8_t x, uint8_t y);
void graphics_draw_message(const char *message);
void graphics_update(void);

/* Direct drawing */
void graphics_draw_char(uint8_t x, uint8_t y, char c);
void graphics_draw_char_color(uint8_t x, uint8_t y, char c, uint8_t color);

#endif /* GRAPHICS_H */
