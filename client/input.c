/**
 * Input Module Implementation
 * 
 * Joystick and keyboard input handling for Atari 8-bit.
 */

#include "input.h"
#include <stdio.h>

/* Input state for debouncing */
static input_direction_t last_direction = INPUT_NONE;
static uint8_t debounce_counter = 0;

/**
 * Initialize input system
 */
void input_init(void) {
    last_direction = INPUT_NONE;
    debounce_counter = 0;
}

/**
 * Close input system
 */
void input_close(void) {
    /* Nothing to clean up for now */
}

/**
 * Read raw joystick input from port A
 * 
 * Atari joystick port layout:
 * Bit 0: Up
 * Bit 1: Down
 * Bit 2: Left
 * Bit 3: Right
 * Bit 4: Fire
 */
uint8_t input_read_raw(void) {
    /* In a real implementation, this would read from PORTA */
    /* For now, return 0 (no input) */
    return 0;
}

/**
 * Convert raw joystick input to direction
 */
input_direction_t input_read_direction(void) {
    uint8_t raw = input_read_raw();
    
    /* Check directions (active low on Atari) */
    if (raw & JOY_UP) {
        return INPUT_UP;
    }
    if (raw & JOY_DOWN) {
        return INPUT_DOWN;
    }
    if (raw & JOY_LEFT) {
        return INPUT_LEFT;
    }
    if (raw & JOY_RIGHT) {
        return INPUT_RIGHT;
    }
    
    return INPUT_NONE;
}

/**
 * Check if fire button is pressed
 */
int input_is_fire_pressed(void) {
    uint8_t raw = input_read_raw();
    return (raw & JOY_FIRE) != 0;
}

/**
 * Update input state with debouncing
 */
void input_update(void) {
    input_direction_t current = input_read_direction();
    
    if (current == last_direction) {
        debounce_counter++;
    } else {
        debounce_counter = 0;
        last_direction = current;
    }
}

/**
 * Get debounced input direction
 * 
 * Returns direction only after it's been stable for DEBOUNCE_FRAMES frames
 */
input_direction_t input_get_debounced(void) {
    if (debounce_counter >= DEBOUNCE_FRAMES) {
        return last_direction;
    }
    return INPUT_NONE;
}
