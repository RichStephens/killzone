/**
 * KillZone Simple JSON Parser Implementation - Atari 8-bit
 * 
 * Minimal JSON parsing for API responses.
 */

#include "json.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

/**
 * Extract string value from JSON
 * Looks for: "key":"value" or "key": "value"
 */
uint16_t json_get_string(const char *json, const char *key, char *value, uint16_t value_len) {
    const char *pos;
    const char *start;
    const char *end;
    uint16_t len;
    char search_key[128];
    
    if (!json || !key || !value || value_len == 0) {
        return 0;
    }
    
    /* Build search pattern: "key": */
    snprintf(search_key, sizeof(search_key), "\"%s\":", key);
    
    /* Find key in JSON */
    pos = strstr(json, search_key);
    if (!pos) {
        return 0;
    }
    
    /* Move past the key and colon */
    pos += strlen(search_key);
    
    /* Skip whitespace */
    while (*pos && isspace(*pos)) {
        pos++;
    }
    
    /* Check for opening quote */
    if (*pos != '"') {
        return 0;
    }
    pos++;
    
    /* Find closing quote */
    start = pos;
    end = strchr(pos, '"');
    if (!end) {
        return 0;
    }
    
    /* Calculate length */
    len = (uint16_t)(end - start);
    if (len >= value_len) {
        len = value_len - 1;
    }
    
    /* Copy value */
    strncpy(value, start, len);
    value[len] = '\0';
    
    return len;
}

/**
 * Extract integer value from JSON
 * Looks for: "key":123 or "key": 123
 */
uint8_t json_get_int(const char *json, const char *key, int32_t *value) {
    const char *pos;
    char search_key[128];
    
    if (!json || !key || !value) {
        return 0;
    }
    
    /* Build search pattern: "key": */
    snprintf(search_key, sizeof(search_key), "\"%s\":", key);
    
    /* Find key in JSON */
    pos = strstr(json, search_key);
    if (!pos) {
        return 0;
    }
    
    /* Move past the key and colon */
    pos += strlen(search_key);
    
    /* Skip whitespace */
    while (*pos && isspace(*pos)) {
        pos++;
    }
    
    /* Parse integer */
    *value = strtol(pos, NULL, 10);
    return 1;
}

/**
 * Extract unsigned integer value from JSON
 */
uint8_t json_get_uint(const char *json, const char *key, uint32_t *value) {
    int32_t signed_value;
    
    if (!json_get_int(json, key, &signed_value)) {
        return 0;
    }
    
    if (signed_value < 0) {
        return 0;
    }
    
    *value = (uint32_t)signed_value;
    return 1;
}

/**
 * Check if JSON contains "success": true
 */
uint8_t json_is_success(const char *json) {
    const char *pos;
    
    if (!json) {
        return 0;
    }
    
    /* Look for "success":true */
    pos = strstr(json, "\"success\":");
    if (!pos) {
        return 0;
    }
    
    pos += strlen("\"success\":");
    
    /* Skip whitespace */
    while (*pos && isspace(*pos)) {
        pos++;
    }
    
    /* Check for true */
    if (strncmp(pos, "true", 4) == 0) {
        return 1;
    }
    
    return 0;
}
