/**
 * Collision Detection Tests
 */

const CollisionDetector = require('../src/collision');
const Player = require('../src/player');

describe('CollisionDetector', () => {
  describe('checkCollision', () => {
    test('detects collision when players at same position', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const collision = CollisionDetector.checkCollision(p1, p2);
      expect(collision).toBe(true);
    });

    test('no collision when players at different positions', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 11, 10);

      const collision = CollisionDetector.checkCollision(p1, p2);
      expect(collision).toBe(false);
    });

    test('no collision with null players', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);

      expect(CollisionDetector.checkCollision(null, p1)).toBe(false);
      expect(CollisionDetector.checkCollision(p1, null)).toBe(false);
      expect(CollisionDetector.checkCollision(null, null)).toBe(false);
    });

    test('detects collision at boundaries', () => {
      const p1 = new Player('p1', 'Alice', 0, 0);
      const p2 = new Player('p2', 'Bob', 0, 0);

      expect(CollisionDetector.checkCollision(p1, p2)).toBe(true);
    });
  });

  describe('findCollisions', () => {
    test('finds no collisions in empty array', () => {
      const collisions = CollisionDetector.findCollisions([]);
      expect(collisions.length).toBe(0);
    });

    test('finds no collisions with single player', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const collisions = CollisionDetector.findCollisions([p1]);
      expect(collisions.length).toBe(0);
    });

    test('finds collision between two players', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);

      const collisions = CollisionDetector.findCollisions([p1, p2]);
      expect(collisions.length).toBe(1);
      expect(collisions[0].player1).toBe(p1);
      expect(collisions[0].player2).toBe(p2);
    });

    test('finds multiple collisions', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);
      const p3 = new Player('p3', 'Charlie', 20, 20);
      const p4 = new Player('p4', 'Diana', 20, 20);

      const collisions = CollisionDetector.findCollisions([p1, p2, p3, p4]);
      expect(collisions.length).toBe(2);
    });

    test('does not duplicate collision pairs', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);
      const p3 = new Player('p3', 'Charlie', 15, 15);

      const collisions = CollisionDetector.findCollisions([p1, p2, p3]);
      expect(collisions.length).toBe(1);
    });
  });

  describe('checkPositionCollision', () => {
    test('finds player at position', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 15, 15);
      const players = [p1, p2];

      const found = CollisionDetector.checkPositionCollision(10, 10, players);
      expect(found).toBe(p1);
    });

    test('returns null for empty position', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const players = [p1];

      const found = CollisionDetector.checkPositionCollision(20, 20, players);
      expect(found).toBeNull();
    });

    test('excludes specified player from check', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);
      const players = [p1, p2];

      const found = CollisionDetector.checkPositionCollision(10, 10, players, 'p1');
      expect(found).toBe(p2);
    });

    test('returns null when only excluded player at position', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const players = [p1];

      const found = CollisionDetector.checkPositionCollision(10, 10, players, 'p1');
      expect(found).toBeNull();
    });

    test('finds first player when multiple at position', () => {
      const p1 = new Player('p1', 'Alice', 10, 10);
      const p2 = new Player('p2', 'Bob', 10, 10);
      const players = [p1, p2];

      const found = CollisionDetector.checkPositionCollision(10, 10, players);
      expect([p1, p2]).toContain(found);
    });
  });
});
