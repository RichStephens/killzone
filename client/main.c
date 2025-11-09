/**
 * KillZone Atari 8-bit Client
 * 
 * Main game loop and state machine.
 * Handles client initialization, server communication, and game logic.
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#include "network.h"
#include "input.h"
#include "graphics.h"
#include "state.h"

/* Game constants */
#define GAME_TITLE "KillZone"
#define PLAYER_NAME_MAX 32
#define FRAME_DELAY 100  /* milliseconds */

/* Function declarations */
void game_init(void);
void game_loop(void);
void game_close(void);
void handle_state_init(void);
void handle_state_connecting(void);
void handle_state_joining(void);
void handle_state_playing(void);
void handle_state_dead(void);
void handle_state_error(void);

/**
 * Main entry point
 */
int main(void) {
    printf("\n%s - Atari 8-bit Multiplayer Game\n", GAME_TITLE);
    printf("Initializing...\n");
    
    game_init();
    game_loop();
    game_close();
    
    printf("Goodbye!\n\n");
    return 0;
}

/**
 * Initialize game systems
 */
void game_init(void) {
    state_init();
    network_init();
    input_init();
    graphics_init();
    
    state_set_current(STATE_CONNECTING);
    printf("Game initialized. Connecting to server...\n");
}

/**
 * Close game systems
 */
void game_close(void) {
    graphics_close();
    input_close();
    network_close();
    state_close();
}

/**
 * Main game loop
 */
void game_loop(void) {
    int running = 1;
    
    while (running) {
        client_state_t current = state_get_current();
        
        switch (current) {
            case STATE_INIT:
                handle_state_init();
                break;
            case STATE_CONNECTING:
                handle_state_connecting();
                break;
            case STATE_JOINING:
                handle_state_joining();
                break;
            case STATE_PLAYING:
                handle_state_playing();
                break;
            case STATE_DEAD:
                handle_state_dead();
                break;
            case STATE_ERROR:
                handle_state_error();
                running = 0;
                break;
            default:
                running = 0;
                break;
        }
    }
}

/**
 * Handle STATE_INIT
 */
void handle_state_init(void) {
    state_set_current(STATE_CONNECTING);
}

/**
 * Handle STATE_CONNECTING
 * 
 * Attempt to connect to server and verify it's running
 */
void handle_state_connecting(void) {
    printf("Checking server health...\n");
    
    if (network_health_check() == 0) {
        printf("Server is healthy. Ready to join.\n");
        state_set_current(STATE_JOINING);
    } else {
        printf("ERROR: Cannot reach server at %s:%d\n", SERVER_HOST, SERVER_PORT);
        state_set_error("Server connection failed");
        state_set_current(STATE_ERROR);
    }
}

/**
 * Handle STATE_JOINING
 * 
 * Join the game world with a player name
 */
void handle_state_joining(void) {
    char player_name[PLAYER_NAME_MAX];
    char response[2048];
    
    printf("Enter player name (max %d chars): ", PLAYER_NAME_MAX - 1);
    fgets(player_name, sizeof(player_name), stdin);
    
    /* Remove newline */
    size_t len = strlen(player_name);
    if (len > 0 && player_name[len - 1] == '\n') {
        player_name[len - 1] = '\0';
    }
    
    if (strlen(player_name) == 0) {
        strcpy(player_name, "Player");
    }
    
    printf("Joining as '%s'...\n", player_name);
    
    if (network_join_player(player_name, response, sizeof(response)) > 0) {
        printf("Successfully joined the game!\n");
        printf("Response: %s\n", response);
        
        /* In a real implementation, parse response and set local player state */
        state_set_current(STATE_PLAYING);
    } else {
        printf("ERROR: Failed to join game\n");
        state_set_error("Join request failed");
        state_set_current(STATE_ERROR);
    }
}

/**
 * Handle STATE_PLAYING
 * 
 * Main gameplay loop
 */
void handle_state_playing(void) {
    static int frame_count = 0;
    
    /* Update input */
    input_update();
    input_direction_t direction = input_get_debounced();
    
    /* Handle movement */
    if (direction != INPUT_NONE) {
        const char *dir_str = NULL;
        
        switch (direction) {
            case INPUT_UP:
                dir_str = "up";
                break;
            case INPUT_DOWN:
                dir_str = "down";
                break;
            case INPUT_LEFT:
                dir_str = "left";
                break;
            case INPUT_RIGHT:
                dir_str = "right";
                break;
            default:
                break;
        }
        
        if (dir_str) {
            char response[2048];
            const player_state_t *player = state_get_local_player();
            
            printf("Moving %s...\n", dir_str);
            
            if (network_move_player(player->id, dir_str, response, sizeof(response)) > 0) {
                printf("Move response: %s\n", response);
            }
        }
    }
    
    /* Update display every few frames */
    if (frame_count++ % 5 == 0) {
        const player_state_t *local = state_get_local_player();
        uint8_t other_count = 0;
        const player_state_t *others = state_get_other_players(&other_count);
        
        /* Prepare other player positions */
        uint8_t other_x[MAX_OTHER_PLAYERS];
        uint8_t other_y[MAX_OTHER_PLAYERS];
        for (uint8_t i = 0; i < other_count; i++) {
            other_x[i] = others[i].x;
            other_y[i] = others[i].y;
        }
        
        graphics_draw_world(local->x, local->y, other_x, other_y, other_count);
        graphics_update();
    }
    
    /* Check for quit command (ESC key or 'q') */
    /* In a real implementation, this would read keyboard input */
}

/**
 * Handle STATE_DEAD
 * 
 * Player has been eliminated, offer to rejoin
 */
void handle_state_dead(void) {
    printf("You have been eliminated!\n");
    printf("Rejoin? (y/n): ");
    
    int c = getchar();
    if (c == 'y' || c == 'Y') {
        state_set_current(STATE_JOINING);
    } else {
        state_set_current(STATE_ERROR);
    }
}

/**
 * Handle STATE_ERROR
 * 
 * Error state - game ends
 */
void handle_state_error(void) {
    printf("ERROR: %s\n", state_get_error());
}
