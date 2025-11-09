/**
 * Input Module Header
 * 
 * Joystick and keyboard input handling for Atari 8-bit.
 * Reads from Atari joystick port and converts to movement directions.
 */

#ifndef INPUT_H
#define INPUT_H

#include <stdint.h>

/* Input directions */
typedef enum {
    INPUT_NONE = 0,
    INPUT_UP = 1,
    INPUT_DOWN = 2,
    INPUT_LEFT = 3,
    INPUT_RIGHT = 4,
    INPUT_FIRE = 5
} input_direction_t;

/* Joystick port definitions (Atari 800) */
#define PORTA 0xD300  /* Joystick port A */
#define PORTB 0xD301  /* Joystick port B */

/* Joystick bit masks */
#define JOY_UP    0x01
#define JOY_DOWN  0x02
#define JOY_LEFT  0x04
#define JOY_RIGHT 0x08
#define JOY_FIRE  0x10

/* Input debouncing */
#define DEBOUNCE_FRAMES 3

/* Initialization and lifecycle */
void input_init(void);
void input_close(void);

/* Input reading */
input_direction_t input_read_direction(void);
uint8_t input_read_raw(void);
int input_is_fire_pressed(void);

/* Debouncing */
void input_update(void);
input_direction_t input_get_debounced(void);

#endif /* INPUT_H */
