/**
 * Integration Tests
 * 
 * End-to-end scenario tests for realistic game flows
 */

const request = require('supertest');
const { app, world } = require('../src/server');

describe('Integration Tests', () => {
  beforeEach(() => {
    world.reset();
  });

  describe('Player Lifecycle', () => {
    test('complete player lifecycle: join -> move -> leave', async () => {
      // Join
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;
      expect(joinRes.body.world.players.length).toBe(1);

      // Move
      const moveRes = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'up' })
        .expect(200);

      expect(moveRes.body.success).toBe(true);
      expect(moveRes.body.worldState.players.length).toBe(1);

      // Leave
      const leaveRes = await request(app)
        .post('/api/player/leave')
        .send({ id: playerId })
        .expect(200);

      expect(leaveRes.body.success).toBe(true);

      // Verify removed from world
      const stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);

      expect(stateRes.body.players.length).toBe(0);
    });
  });

  describe('Multiple Player Scenarios', () => {
    test('two players can join and move independently', async () => {
      // Player 1 joins
      const join1 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Alice' })
        .expect(201);

      const player1Id = join1.body.id;
      const player1InitialPos = { x: join1.body.x, y: join1.body.y };

      // Player 2 joins
      const join2 = await request(app)
        .post('/api/player/join')
        .send({ name: 'Bob' })
        .expect(201);

      const player2Id = join2.body.id;
      const player2InitialPos = { x: join2.body.x, y: join2.body.y };

      // Verify both in world
      let stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);
      expect(stateRes.body.players.length).toBe(2);

      // Player 1 moves
      const move1 = await request(app)
        .post(`/api/player/${player1Id}/move`)
        .send({ direction: 'up' })
        .expect(200);

      expect(move1.body.newPos.y).toBeLessThanOrEqual(player1InitialPos.y);

      // Player 2 moves
      const move2 = await request(app)
        .post(`/api/player/${player2Id}/move`)
        .send({ direction: 'right' })
        .expect(200);

      expect(move2.body.newPos.x).toBeGreaterThanOrEqual(player2InitialPos.x);

      // Verify both still in world with updated positions
      stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);

      expect(stateRes.body.players.length).toBe(2);
      const p1 = stateRes.body.players.find(p => p.id === player1Id);
      const p2 = stateRes.body.players.find(p => p.id === player2Id);

      expect(p1).toBeDefined();
      expect(p2).toBeDefined();
    });

    test('three players can coexist', async () => {
      const players = [];

      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/api/player/join')
          .send({ name: `Player${i}` })
          .expect(201);
        players.push(res.body.id);
      }

      const stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);

      expect(stateRes.body.players.length).toBe(3);
    });
  });

  describe('State Consistency', () => {
    test('world state remains consistent across requests', async () => {
      // Add player
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;
      const initialState = joinRes.body.world;

      // Get state multiple times
      const state1 = await request(app)
        .get('/api/world/state')
        .expect(200);

      const state2 = await request(app)
        .get('/api/world/state')
        .expect(200);

      // Both should have same player
      expect(state1.body.players.length).toBe(1);
      expect(state2.body.players.length).toBe(1);
      expect(state1.body.players[0].id).toBe(playerId);
      expect(state2.body.players[0].id).toBe(playerId);
    });

    test('player status reflects in world state', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;

      // Get status
      const statusRes = await request(app)
        .get(`/api/player/${playerId}/status`)
        .expect(200);

      const playerStatus = statusRes.body.player;

      // Get world state
      const stateRes = await request(app)
        .get('/api/world/state')
        .expect(200);

      const playerInWorld = stateRes.body.players.find(p => p.id === playerId);

      // Should match
      expect(playerInWorld.x).toBe(playerStatus.x);
      expect(playerInWorld.y).toBe(playerStatus.y);
      expect(playerInWorld.health).toBe(playerStatus.health);
      expect(playerInWorld.status).toBe(playerStatus.status);
    });
  });

  describe('Error Handling', () => {
    test('handles invalid moves gracefully', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;

      // Try invalid direction
      const res = await request(app)
        .post(`/api/player/${playerId}/move`)
        .send({ direction: 'diagonal' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test('handles non-existent player requests', async () => {
      const res = await request(app)
        .get('/api/player/nonexistent/status')
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    test('handles malformed requests', async () => {
      const res = await request(app)
        .post('/api/player/join')
        .send({ name: null })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Boundary Conditions', () => {
    test('player cannot move beyond world bounds', async () => {
      const joinRes = await request(app)
        .post('/api/player/join')
        .send({ name: 'TestPlayer' })
        .expect(201);

      const playerId = joinRes.body.id;
      let currentX = joinRes.body.x;
      let currentY = joinRes.body.y;

      // Move to left boundary
      for (let i = 0; i < 50; i++) {
        const res = await request(app)
          .post(`/api/player/${playerId}/move`)
          .send({ direction: 'left' })
          .expect(200);
        currentX = res.body.newPos.x;
      }

      expect(currentX).toBe(0);

      // Move to right boundary
      for (let i = 0; i < 50; i++) {
        const res = await request(app)
          .post(`/api/player/${playerId}/move`)
          .send({ direction: 'right' })
          .expect(200);
        currentX = res.body.newPos.x;
      }

      expect(currentX).toBe(39);

      // Move to top boundary
      for (let i = 0; i < 50; i++) {
        const res = await request(app)
          .post(`/api/player/${playerId}/move`)
          .send({ direction: 'up' })
          .expect(200);
        currentY = res.body.newPos.y;
      }

      expect(currentY).toBe(0);

      // Move to bottom boundary
      for (let i = 0; i < 50; i++) {
        const res = await request(app)
          .post(`/api/player/${playerId}/move`)
          .send({ direction: 'down' })
          .expect(200);
        currentY = res.body.newPos.y;
      }

      expect(currentY).toBe(19);
    });
  });

  describe('Server Recovery', () => {
    test('server remains responsive after errors', async () => {
      // Cause an error
      await request(app)
        .post('/api/player/join')
        .send({ name: null })
        .expect(400);

      // Server should still respond
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('healthy');
    });

    test('health check always responds', async () => {
      for (let i = 0; i < 10; i++) {
        const res = await request(app)
          .get('/api/health')
          .expect(200);

        expect(res.body.status).toBe('healthy');
      }
    });
  });
});
