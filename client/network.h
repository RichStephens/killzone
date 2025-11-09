/**
 * Network Module Header
 * 
 * FujiNet HTTP wrapper for KillZone client.
 * Provides high-level HTTP communication with the game server.
 */

#ifndef NETWORK_H
#define NETWORK_H

#include <stdint.h>
#include <stddef.h>

/* Network configuration */
#define SERVER_HOST "localhost"
#define SERVER_PORT 3000
#define RESPONSE_BUFFER_SIZE 2048
#define REQUEST_TIMEOUT 5000  /* milliseconds */

/* Network status codes */
typedef enum {
    NET_DISCONNECTED = 0,
    NET_CONNECTING = 1,
    NET_CONNECTED = 2,
    NET_ERROR = 3
} network_status_t;

/* Initialization and lifecycle */
int network_init(void);
int network_close(void);
network_status_t network_get_status(void);

/* HTTP operations */
int network_get(const char *path, char *response, size_t response_len);
int network_post(const char *path, const char *body, 
                 char *response, size_t response_len);

/* Server communication */
int network_health_check(void);
int network_join_player(const char *name, char *response, size_t response_len);
int network_move_player(const char *player_id, const char *direction,
                        char *response, size_t response_len);
int network_get_world_state(char *response, size_t response_len);
int network_get_player_status(const char *player_id, 
                              char *response, size_t response_len);
int network_leave_player(const char *player_id, 
                         char *response, size_t response_len);

#endif /* NETWORK_H */
