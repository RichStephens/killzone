/**
 * Network Module Implementation
 * 
 * FujiNet HTTP wrapper for KillZone client.
 * Handles all server communication.
 */

#include "network.h"
#include "fujinet.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

/* Network state */
static network_status_t current_status = NET_DISCONNECTED;
static char response_buffer[RESPONSE_BUFFER_SIZE];

/**
 * Initialize network connection
 */
int network_init(void) {
    current_status = NET_CONNECTING;
    
    /* In a real implementation, this would initialize FujiNet */
    /* For now, we simulate successful initialization */
    current_status = NET_CONNECTED;
    
    return 0;
}

/**
 * Close network connection
 */
int network_close(void) {
    current_status = NET_DISCONNECTED;
    return 0;
}

/**
 * Get current network status
 */
network_status_t network_get_status(void) {
    return current_status;
}

/**
 * Send HTTP GET request
 */
int network_get(const char *path, char *response, size_t response_len) {
    if (current_status != NET_CONNECTED) {
        return -1;
    }

    /* In a real implementation, this would use FujiNet's http_get */
    /* For now, return stub response */
    if (response && response_len > 0) {
        strncpy(response, "{\"status\":\"ok\"}", response_len - 1);
        response[response_len - 1] = '\0';
    }

    return strlen(response);
}

/**
 * Send HTTP POST request
 */
int network_post(const char *path, const char *body,
                 char *response, size_t response_len) {
    if (current_status != NET_CONNECTED) {
        return -1;
    }

    /* In a real implementation, this would use FujiNet's http_post */
    /* For now, return stub response */
    if (response && response_len > 0) {
        strncpy(response, "{\"success\":true}", response_len - 1);
        response[response_len - 1] = '\0';
    }

    return strlen(response);
}

/**
 * Health check endpoint
 */
int network_health_check(void) {
    int result = network_get("/api/health", response_buffer, RESPONSE_BUFFER_SIZE);
    return result > 0 ? 0 : -1;
}

/**
 * Join player endpoint
 */
int network_join_player(const char *name, char *response, size_t response_len) {
    char body[256];
    snprintf(body, sizeof(body), "{\"name\":\"%s\"}", name);
    
    return network_post("/api/player/join", body, response, response_len);
}

/**
 * Move player endpoint
 */
int network_move_player(const char *player_id, const char *direction,
                        char *response, size_t response_len) {
    char path[256];
    char body[256];
    
    snprintf(path, sizeof(path), "/api/player/%s/move", player_id);
    snprintf(body, sizeof(body), "{\"direction\":\"%s\"}", direction);
    
    return network_post(path, body, response, response_len);
}

/**
 * Get world state endpoint
 */
int network_get_world_state(char *response, size_t response_len) {
    return network_get("/api/world/state", response, response_len);
}

/**
 * Get player status endpoint
 */
int network_get_player_status(const char *player_id,
                              char *response, size_t response_len) {
    char path[256];
    snprintf(path, sizeof(path), "/api/player/%s/status", player_id);
    
    return network_get(path, response, response_len);
}

/**
 * Leave player endpoint
 */
int network_leave_player(const char *player_id,
                         char *response, size_t response_len) {
    char body[256];
    snprintf(body, sizeof(body), "{\"id\":\"%s\"}", player_id);
    
    return network_post("/api/player/leave", body, response, response_len);
}
