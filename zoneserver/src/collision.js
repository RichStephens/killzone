/**
 * Collision Detection Engine
 * 
 * Detects when players occupy the same position and triggers combat resolution.
 */

class CollisionDetector {
  /**
   * Check if two players are at the same position
   * @param {Player} player1 - First player
   * @param {Player} player2 - Second player
   * @returns {boolean} - True if players collide
   */
  static checkCollision(player1, player2) {
    if (!player1 || !player2) {
      return false;
    }
    return player1.x === player2.x && player1.y === player2.y;
  }

  /**
   * Find all collisions in the world
   * @param {Array} players - Array of all players
   * @returns {Array} - Array of collision pairs [{player1, player2}, ...]
   */
  static findCollisions(players) {
    const collisions = [];
    const checked = new Set();

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const key = `${players[i].id}-${players[j].id}`;
        if (!checked.has(key)) {
          if (this.checkCollision(players[i], players[j])) {
            collisions.push({
              player1: players[i],
              player2: players[j]
            });
          }
          checked.add(key);
        }
      }
    }

    return collisions;
  }

  /**
   * Check if a position would cause a collision with existing players
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Array} players - Array of all players
   * @param {string} excludePlayerId - Player ID to exclude from check
   * @returns {Player|null} - Player at position or null if no collision
   */
  static checkPositionCollision(x, y, players, excludePlayerId = null) {
    for (const player of players) {
      if (excludePlayerId && player.id === excludePlayerId) {
        continue;
      }
      if (player.x === x && player.y === y) {
        return player;
      }
    }
    return null;
  }
}

module.exports = CollisionDetector;
