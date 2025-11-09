/**
 * KillZone Simple JSON Parser - Atari 8-bit
 * 
 * Minimal JSON parsing for API responses.
 * Extracts key values from JSON strings.
 */

#ifndef KILLZONE_JSON_H
#define KILLZONE_JSON_H

#include <stdint.h>

/* JSON parsing functions */

/**
 * Extract string value from JSON
 * @param json - JSON string
 * @param key - Key to search for (e.g., "id")
 * @param value - Buffer to store extracted value
 * @param value_len - Size of value buffer
 * @return Length of extracted value, 0 if not found
 */
uint16_t json_get_string(const char *json, const char *key, char *value, uint16_t value_len);

/**
 * Extract integer value from JSON
 * @param json - JSON string
 * @param key - Key to search for (e.g., "x")
 * @param value - Pointer to store extracted integer
 * @return 1 if found, 0 if not found
 */
uint8_t json_get_int(const char *json, const char *key, int32_t *value);

/**
 * Extract unsigned integer value from JSON
 * @param json - JSON string
 * @param key - Key to search for
 * @param value - Pointer to store extracted value
 * @return 1 if found, 0 if not found
 */
uint8_t json_get_uint(const char *json, const char *key, uint32_t *value);

/**
 * Check if JSON contains "success": true
 * @param json - JSON string
 * @return 1 if success, 0 otherwise
 */
uint8_t json_is_success(const char *json);

#endif /* KILLZONE_JSON_H */
