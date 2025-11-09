/**
 * FujiNet HTTP Library Stub
 * 
 * This is a stub header for the FujiNet library.
 * In a real implementation, this would be provided by the FujiNet project.
 * 
 * FujiNet provides socket abstraction and HTTP functionality for Atari 8-bit systems.
 */

#ifndef FUJINET_H
#define FUJINET_H

#include <stdint.h>
#include <stddef.h>

/* HTTP Methods */
#define HTTP_GET    0
#define HTTP_POST   1
#define HTTP_PUT    2
#define HTTP_DELETE 3

/* HTTP Status Codes */
#define HTTP_OK                 200
#define HTTP_CREATED            201
#define HTTP_BAD_REQUEST        400
#define HTTP_NOT_FOUND          404
#define HTTP_INTERNAL_ERROR     500

/* Network Status */
#define NET_OK                  0
#define NET_ERROR               -1
#define NET_TIMEOUT             -2
#define NET_CONNECTION_REFUSED  -3

/* Socket operations */
typedef struct {
    uint8_t status;
    uint16_t port;
    char host[256];
} network_config_t;

/**
 * Initialize network connection
 * @param config - Network configuration
 * @return NET_OK on success, error code otherwise
 */
int network_init(network_config_t *config);

/**
 * Send HTTP GET request
 * @param host - Server hostname
 * @param port - Server port
 * @param path - Request path
 * @param response - Buffer for response
 * @param response_len - Size of response buffer
 * @return Bytes read on success, error code otherwise
 */
int http_get(const char *host, uint16_t port, const char *path, 
             char *response, size_t response_len);

/**
 * Send HTTP POST request
 * @param host - Server hostname
 * @param port - Server port
 * @param path - Request path
 * @param body - Request body (JSON)
 * @param response - Buffer for response
 * @param response_len - Size of response buffer
 * @return Bytes read on success, error code otherwise
 */
int http_post(const char *host, uint16_t port, const char *path,
              const char *body, char *response, size_t response_len);

/**
 * Close network connection
 * @return NET_OK on success
 */
int network_close(void);

/**
 * Get network status
 * @return Network status code
 */
int network_status(void);

#endif /* FUJINET_H */
