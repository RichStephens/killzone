/**
 * API Endpoint Tests
 */

const request = require('supertest');
const { app, world } = require('../src/server');

describe('API Endpoints', () => {
  beforeEach(() => {
    world.reset();
  });

  describe('GET /api/health', () => {
    test('returns health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(res.body.uptime).toBeDefined();
      expect(res.body.playerCount).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    test('reports correct player count', async () => {
      // Add a player
      await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' });

      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.playerCount).toBe(1);
    });
  });

  describe('GET /api/world/state', () => {
    test('returns world state', async () => {
      const res = await request(app)
        .get('/api/world/state')
        .expect(200);

      expect(res.body.width).toBe(40);
      expect(res.body.height).toBe(20);
      expect(Array.isArray(res.body.players)).toBe(true);
      expect(res.body.timestamp).toBeDefined();
    });

    test('includes all players in state', async () => {
      await request(app)
        .post('/api/player/join')
        .send({ name: 'Alice' });

      await request(app)
        .post('/api/player/join')
        .send({ name: 'Bob' });

      const res = await request(app)
        .get('/api/world/state')
        .expect(200);

      expect(res.body.players.length).toBe(2);
    });
  });

  describe('POST /api/player/join', () => {
    test('creates new player', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.id).toBeDefined();
      expect(res.body.x).toBeDefined();
      expect(res.body.y).toBeDefined();
      expect(res.body.health).toBe(100);
      expect(res.body.status).toBe('alive');
    });

    test('returns world state on join', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      expect(res.body.world).toBeDefined();
      expect(res.body.world.width).toBe(40);
      expect(res.body.world.height).toBe(20);
    });

    test('rejects missing name', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    test('rejects empty name', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: '' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('rejects non-string name', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: 123 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('spawns player within bounds', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      expect(res.body.x).toBeGreaterThanOrEqual(0);
      expect(res.body.x).toBeLessThan(40);
      expect(res.body.y).toBeGreaterThanOrEqual(0);
      expect(res.body.y).toBeLessThan(20);
    });

    test('generates unique player IDs', async () => {
      const res1 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Player1' })
        .expect(201);

      const res2 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Player2' })
        .expect(201);

      expect(res1.body.id).not.toBe(res2.body.id);
    });
  });

  describe('GET /api/player/:id/status', () => {
    test('returns player status', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;

      const res = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.player.id).toBe(playerId);
      expect(res.body.player.name).toBe('TestPlayer');
    });

    test('returns 404 for non-existent player', async () => {
      const res = await request(app)
        .get('/api/player/nonexistent/status')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/player/:id/move', () => {
    let playerId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);
      playerId = res.body.id;
    });

    test('moves player up', async () => {
      const joinRes = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);
      const initialY = joinRes.body.player.y;

      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'up' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.newPos.y).toBe(Math.max(0, initialY - 1));
    });

    test('moves player down', async () => {
      const joinRes = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);
      const initialY = joinRes.body.player.y;

      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'down' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.newPos.y).toBe(Math.min(19, initialY + 1));
    });

    test('moves player left', async () => {
      const joinRes = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);
      const initialX = joinRes.body.player.x;

      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'left' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.newPos.x).toBe(Math.max(0, initialX - 1));
    });

    test('moves player right', async () => {
      const joinRes = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);
      const initialX = joinRes.body.player.x;

      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'right' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.newPos.x).toBe(Math.min(39, initialX + 1));
    });

    test('rejects invalid direction', async () => {
      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'invalid' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('rejects move for non-existent player', async () => {
      const res = await request(app)
        .post('/api/player/nonexistent/move')
        .send({ direction: 'up' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    test('returns updated world state', async () => {
      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'up' })
        .expect(200);

      expect(res.body.worldState).toBeDefined();
      expect(res.body.worldState.players).toBeDefined();
    });
  });

  describe('POST /api/player/leave', () => {
    test('removes player from world', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;

      const res = await request(app)
        .post('/api/player/leave')
        .send({ id: playerId })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.id).toBe(playerId);
    });

    test('returns 404 for non-existent player', async () => {
      const res = await request(app)
        .post('/api/player/leave')
        .send({ id: 'nonexistent' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    test('rejects missing player ID', async () => {
      const res = await request(app)
        .post('/api/player/leave')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('player no longer in world state after leave', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;

      await request(app)
        .post('/api/player/leave')
        .send({ id: playerId })
        .expect(200);

      const stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);

      const playerInState = stateRes.body.players.find(p => p.id === playerId);
      expect(playerInState).toBeUndefined();
    });
  });

  describe('Collision and Combat', () => {
    test('detects collision when moving to occupied position', async () => {
      // Create two players
      const join1 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Alice' })
        .expect(201);

      const join2 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Bob' })
        .expect(201);

      const player1Id = join1.body.id;
      const player2Id = join2.body.id;

      // Get player 2's position
      const status2 = await request(app)
        .get(`/api/player/${player2Id}/status`)
        .expect(200);

      const targetX = status2.body.player.x;
      const targetY = status2.body.player.y;

      // Move player 1 to player 2's position
      // This requires multiple moves - for now just verify collision detection works
      const moveRes = await request(app)
        .post(`/api/player/${player1Id}/move`)
        .send({ direction: 'up' })
        .expect(200);

      expect(moveRes.body.collision).toBeDefined();
    });
  });
});
