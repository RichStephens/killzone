/**
 * Combat Resolution Tests
 */

const CombatResolver = require('../src/combat');
const Player = require('../src/player');

describe('CombatResolver', () => {
  describe('resolveCombat', () => {
    test('returns combat result with winner and loser', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);

      expect(result).toBeDefined();
      expect(result.type).toBe('combat');
      expect(result.winnerId).toBeDefined();
      expect(result.loserId).toBeDefined();
      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    test('winner is one of the combatants', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);

      expect([p1.id, p2.id]).toContain(result.winnerId);
      expect([p1.id, p2.id]).toContain(result.loserId);
    });

    test('winner and loser are different', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);

      expect(result.winnerId).not.toBe(result.loserId);
    });

    test('marks loser as dead', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);
      const loser = result.loserId === p1.id ? p1 : p2;

      expect(loser.status).toBe('dead');
      expect(loser.health).toBe(0);
    });

    test('winner remains alive', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);
      const winner = result.winnerId === p1.id ? p1 : p2;

      expect(winner.status).toBe('alive');
      expect(winner.health).toBe(100);
    });

    test('handles null players gracefully', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);

      expect(CombatResolver.resolveCombat(null, p1)).toBeNull();
      expect(CombatResolver.resolveCombat(p1, null)).toBeNull();
      expect(CombatResolver.resolveCombat(null, null)).toBeNull();
    });

    test('combat result has correct structure', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const result = CombatResolver.resolveCombat(p1, p2);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('loser');
      expect(result).toHaveProperty('winnerId');
      expect(result).toHaveProperty('loserId');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('resolveMultipleCombats', () => {
    test('resolves multiple combats', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);
      const p3 = new Player('p3', 'Charlie', 20, 20);
      const p4 = new Player('p4', 'Diana', 20, 20);

      const collisions = [
        { player1: p1, player2: p2 },
        { player1: p3, player2: p4 }
      ];

      const results = CombatResolver.resolveMultipleCombats(collisions);

      expect(results.length).toBe(2);
      expect(results[0].type).toBe('combat');
      expect(results[1].type).toBe('combat');
    });

    test('handles empty collision array', () => {
      const results = CombatResolver.resolveMultipleCombats([]);
      expect(results.length).toBe(0);
    });

    test('each combat has winner and loser', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const collisions = [{ player1: p1, player2: p2 }];
      const results = CombatResolver.resolveMultipleCombats(collisions);

      expect(results[0].winnerId).toBeDefined();
      expect(results[0].loserId).toBeDefined();
    });
  });

  describe('combat randomness', () => {
    test('combat can have different winners', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const results = [];
      for (let i = 0; i < 20; i++) {
        const player1 = new Player(`p${i}a`, 'Alice', 10, 10);
        const player2 = new Player(`p${i}b`, 'Bob', 10, 10);
        results.push(CombatResolver.resolveCombat(player1, player2));
      }

      const winners = results.map(r => r.winnerId);
      const uniqueWinners = new Set(winners.map(w => w.includes('a') ? 'a' : 'b'));

      // With 20 combats, we should see both types of winners
      expect(uniqueWinners.size).toBeGreaterThan(1);
    });
  });
});
