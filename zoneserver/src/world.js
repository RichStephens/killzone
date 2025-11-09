/**
 * World State Management
 * 
 * Manages the shared game world state including:
 * - World dimensions (40x20 grid)
 * - Player entity tracking
 * - Position validation
 * - World persistence across client connections
 */

class World {
  constructor(width = 40, height = 20) {
    this.width = width;
    this.height = height;
    this.players = new Map(); // playerId -> Player object
    this.timestamp = Date.now();
    this.ticks = 0;
  }

  /**
   * Add a player to the world
   * @param {Player} player - Player object to add
   * @returns {boolean} - Success status
   */
  addPlayer(player) {
    if (!player || !player.id) {
      return false;
    }
    this.players.set(player.id, player);
    this.timestamp = Date.now();
    return true;
  }

  /**
   * Remove a player from the world
   * @param {string} playerId - ID of player to remove
   * @returns {boolean} - Success status
   */
  removePlayer(playerId) {
    const removed = this.players.delete(playerId);
    if (removed) {
      this.timestamp = Date.now();
    }
    return removed;
  }

  /**
   * Get a player by ID
   * @param {string} playerId - ID of player to retrieve
   * @returns {Player|null} - Player object or null if not found
   */
  getPlayer(playerId) {
    return this.players.get(playerId) || null;
  }

  /**
   * Get all players in the world
   * @returns {Array} - Array of all player objects
   */
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Get player count
   * @returns {number} - Number of players in world
   */
  getPlayerCount() {
    return this.players.size;
  }

  /**
   * Check if a position is valid (within bounds)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if position is valid
   */
  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Check if a position is occupied by another player
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} excludePlayerId - Player ID to exclude from check (optional)
   * @returns {Player|null} - Player at position or null if empty
   */
  getPlayerAtPosition(x, y, excludePlayerId = null) {
    for (const player of this.players.values()) {
      if (player.x === x && player.y === y) {
        if (excludePlayerId && player.id === excludePlayerId) {
          continue;
        }
        return player;
      }
    }
    return null;
  }

  /**
   * Get world state snapshot for API responses
   * @returns {Object} - World state object
   */
  getState() {
    this.ticks++;  /* Increment world ticks on each state query */
    return {
      width: this.width,
      height: this.height,
      players: this.getAllPlayers().map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        health: p.health,
        status: p.status
      })),
      ticks: this.ticks,
      timestamp: this.timestamp
    };
  }

  /**
   * Reset world to initial state
   */
  reset() {
    this.players.clear();
    this.timestamp = Date.now();
  }
}

module.exports = World;
