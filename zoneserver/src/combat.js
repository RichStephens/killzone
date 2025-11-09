/**
 * Combat Resolution Logic
 * 
 * Handles combat between players when collisions occur.
 * Uses simple 50/50 random winner determination.
 */

class CombatResolver {
  /**
   * Resolve combat between two players
   * @param {Player} player1 - First player in combat
   * @param {Player} player2 - Second player in combat
   * @returns {Object} - Combat result with winner and loser
   */
  static resolveCombat(player1, player2) {
    if (!player1 || !player2) {
      return null;
    }

    // 50/50 random winner determination
    const winner = Math.random() < 0.5 ? player1 : player2;
    const loser = winner === player1 ? player2 : player1;

    // Mark loser as dead
    loser.setStatus('dead');
    loser.setHealth(0);

    return {
      type: 'combat',
      winner: winner.name,
      loser: loser.name,
      winnerId: winner.id,
      loserId: loser.id,
      timestamp: Date.now()
    };
  }

  /**
   * Resolve multiple simultaneous combats
   * @param {Array} collisions - Array of collision pairs
   * @returns {Array} - Array of combat results
   */
  static resolveMultipleCombats(collisions) {
    return collisions.map(collision => 
      this.resolveCombat(collision.player1, collision.player2)
    );
  }
}

module.exports = CombatResolver;
