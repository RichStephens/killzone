/**
 * Player Entity Tests
 */

const Player = require('../src/player');

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('p1', 'Alice', 10, 10);
  });

  describe('initialization', () => {
    test('creates player with correct properties', () => {
      expect(player.id).toBe('p1');
      expect(player.name).toBe('Alice');
      expect(player.x).toBe(10);
      expect(player.y).toBe(10);
    });

    test('starts with full health', () => {
      expect(player.health).toBe(100);
    });

    test('starts with alive status', () => {
      expect(player.status).toBe('alive');
    });

    test('has join timestamp', () => {
      expect(player.joinedAt).toBeDefined();
      expect(typeof player.joinedAt).toBe('number');
    });
  });

  describe('position', () => {
    test('updates position', () => {
      player.setPosition(20, 15);
      expect(player.x).toBe(20);
      expect(player.y).toBe(15);
    });

    test('handles boundary positions', () => {
      player.setPosition(0, 0);
      expect(player.x).toBe(0);
      expect(player.y).toBe(0);

      player.setPosition(39, 19);
      expect(player.x).toBe(39);
      expect(player.y).toBe(19);
    });
  });

  describe('health', () => {
    test('sets health value', () => {
      player.setHealth(75);
      expect(player.health).toBe(75);
    });

    test('clamps health to 0-100 range', () => {
      player.setHealth(150);
      expect(player.health).toBe(100);

      player.setHealth(-10);
      expect(player.health).toBe(0);
    });

    test('sets status to dead when health reaches 0', () => {
      player.setHealth(0);
      expect(player.status).toBe('dead');
    });

    test('does not change status for non-zero health', () => {
      player.setHealth(50);
      expect(player.status).toBe('alive');
    });
  });

  describe('status', () => {
    test('sets valid status values', () => {
      player.setStatus('dead');
      expect(player.status).toBe('dead');

      player.setStatus('waiting');
      expect(player.status).toBe('waiting');

      player.setStatus('alive');
      expect(player.status).toBe('alive');
    });

    test('ignores invalid status values', () => {
      player.setStatus('invalid');
      expect(player.status).toBe('alive');
    });
  });

  describe('serialization', () => {
    test('converts to JSON object', () => {
      const json = player.toJSON();
      
      expect(json.id).toBe('p1');
      expect(json.name).toBe('Alice');
      expect(json.x).toBe(10);
      expect(json.y).toBe(10);
      expect(json.health).toBe(100);
      expect(json.status).toBe('alive');
      expect(json.joinedAt).toBeDefined();
    });

    test('JSON includes all properties', () => {
      player.setPosition(25, 12);
      player.setHealth(75);
      player.setStatus('waiting');

      const json = player.toJSON();
      expect(json.x).toBe(25);
      expect(json.y).toBe(12);
      expect(json.health).toBe(75);
      expect(json.status).toBe('waiting');
    });
  });
});
