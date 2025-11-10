/**
 * Multi-Client Integration Tests
 * 
 * Tests for handling multiple concurrent clients connecting to the server.
 * Ensures the server can handle up to 10 simultaneous players.
 */

const request = require('supertest');
const { app, world } = require('../src/server');

describe('Multi-Client Integration Tests', () => {
  beforeEach(() => {
    world.reset();
  });

  describe('Sequential Client Connections', () => {
    it('should allow first client to join', (done) => {
      request(app)
        .post('/api/player/join')
        .send({ name: 'Player1' })
        .expect(201)
        .expect((res) => {
          if (!res.body.success) throw new Error('Join failed');
          if (!res.body.id) throw new Error('No player ID returned');
          if (res.body.x === undefined || res.body.y === undefined) throw new Error('No spawn position');
        })
        .end(done);
    });

    it('should allow second client to join after first', (done) => {
      // First client joins
      request(app)
        .post('/api/player/join')
        .send({ name: 'Player1' })
        .expect(201)
        .end((err, res1) => {
          if (err) return done(err);
          
          // Second client joins
          request(app)
            .post('/api/player/join')
            .send({ name: 'Player2' })
            .expect(201)
            .expect((res) => {
              if (!res.body.success) throw new Error('Second join failed');
              if (!res.body.id) throw new Error('No player ID for second client');
              // Verify different player IDs
              if (res.body.id === res1.body.id) throw new Error('Players have same ID');
            })
            .end(done);
        });
    });

    it('should have correct player count after multiple joins', (done) => {
      const joinPromises = [];
      const playerCount = 5;

      // Create promises for sequential joins
      for (let i = 0; i < playerCount; i++) {
        joinPromises.push(
          new Promise((resolve, reject) => {
            request(app)
              .post('/api/player/join')
              .send({ name: `Player${i + 1}` })
              .expect(201)
              .end((err, res) => {
                if (err) reject(err);
                else resolve(res.body);
              });
          })
        );
      }

      Promise.all(joinPromises)
        .then((results) => {
          // Verify all joins succeeded
          results.forEach((res) => {
            if (!res.success) throw new Error('Join failed');
          });

          // Verify world has correct player count
          if (world.getPlayerCount() !== playerCount) {
            throw new Error(`Expected ${playerCount} players, got ${world.getPlayerCount()}`);
          }

          done();
        })
        .catch(done);
    });

    it('should assign unique spawn positions to players', (done) => {
      const joinPromises = [];
      const playerCount = 5;

      for (let i = 0; i < playerCount; i++) {
        joinPromises.push(
          new Promise((resolve, reject) => {
            request(app)
              .post('/api/player/join')
              .send({ name: `Player${i + 1}` })
              .expect(201)
              .end((err, res) => {
                if (err) reject(err);
                else resolve({ x: res.body.x, y: res.body.y });
              });
          })
        );
      }

      Promise.all(joinPromises)
        .then((positions) => {
          // Check for duplicates
          const positionSet = new Set();
          positions.forEach((pos) => {
            const key = `${pos.x},${pos.y}`;
            if (positionSet.has(key)) {
              throw new Error(`Duplicate spawn position: (${pos.x}, ${pos.y})`);
            }
            positionSet.add(key);
          });

          done();
        })
        .catch(done);
    });
  });

  describe('Concurrent Client Connections', () => {
    it('should handle 3 concurrent join requests', (done) => {
      const requests = [
        request(app)
          .post('/api/player/join')
          .send({ name: 'Player1' }),
        request(app)
          .post('/api/player/join')
          .send({ name: 'Player2' }),
        request(app)
          .post('/api/player/join')
          .send({ name: 'Player3' })
      ];

      Promise.all(requests)
        .then((responses) => {
          responses.forEach((res) => {
            if (res.status !== 201) throw new Error(`Unexpected status: ${res.status}`);
            if (!res.body.success) throw new Error('Join failed');
          });

          if (world.getPlayerCount() !== 3) {
            throw new Error(`Expected 3 players, got ${world.getPlayerCount()}`);
          }

          done();
        })
        .catch(done);
    });

    it('should handle 10 concurrent join requests', (done) => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/player/join')
            .send({ name: `Player${i + 1}` })
        );
      }

      Promise.all(requests)
        .then((responses) => {
          // Verify all succeeded
          responses.forEach((res) => {
            if (res.status !== 201) throw new Error(`Unexpected status: ${res.status}`);
            if (!res.body.success) throw new Error('Join failed');
          });

          // Verify player count
          if (world.getPlayerCount() !== 10) {
            throw new Error(`Expected 10 players, got ${world.getPlayerCount()}`);
          }

          // Verify all have unique IDs
          const ids = new Set(responses.map((r) => r.body.id));
          if (ids.size !== 10) {
            throw new Error('Not all players have unique IDs');
          }

          done();
        })
        .catch(done);
    });
  });

  describe('Multi-Client World State', () => {
    it('should include all players in world state', (done) => {
      const joinPromises = [];
      const playerCount = 3;

      // Join multiple players
      for (let i = 0; i < playerCount; i++) {
        joinPromises.push(
          new Promise((resolve, reject) => {
            request(app)
              .post('/api/player/join')
              .send({ name: `Player${i + 1}` })
              .end((err, res) => {
                if (err) reject(err);
                else resolve(res.body.id);
              });
          })
        );
      }

      Promise.all(joinPromises)
        .then(() => {
          // Get world state
          request(app)
            .get('/api/world/state')
            .expect(200)
            .expect((res) => {
              if (!res.body.players) throw new Error('No players in world state');
              if (res.body.players.length < playerCount) {
                throw new Error(`Expected at least ${playerCount} players in world state`);
              }
            })
            .end(done);
        })
        .catch(done);
    });

    it('should show correct player positions in world state', (done) => {
      let player1Id, player2Id;

      // First player joins
      request(app)
        .post('/api/player/join')
        .send({ name: 'Player1' })
        .end((err, res1) => {
          if (err) return done(err);
          player1Id = res1.body.id;

          // Second player joins
          request(app)
            .post('/api/player/join')
            .send({ name: 'Player2' })
            .end((err, res2) => {
              if (err) return done(err);
              player2Id = res2.body.id;

              // Get world state
              request(app)
                .get('/api/world/state')
                .expect(200)
                .expect((res) => {
                  const players = res.body.players;
                  if (!players || players.length < 2) {
                    throw new Error('Not enough players in world state');
                  }

                  // Find our players
                  const p1 = players.find((p) => p.id === player1Id);
                  const p2 = players.find((p) => p.id === player2Id);

                  if (!p1) throw new Error('Player1 not found in world state');
                  if (!p2) throw new Error('Player2 not found in world state');

                  // Verify positions are valid
                  if (p1.x === undefined || p1.y === undefined) {
                    throw new Error('Player1 has invalid position');
                  }
                  if (p2.x === undefined || p2.y === undefined) {
                    throw new Error('Player2 has invalid position');
                  }
                })
                .end(done);
            });
        });
    });
  });

  describe('Multi-Client Movement', () => {
    it('should handle movement from multiple clients', (done) => {
      let player1Id, player2Id;

      // First player joins
      request(app)
        .post('/api/player/join')
        .send({ name: 'Player1' })
        .end((err, res1) => {
          if (err) return done(err);
          player1Id = res1.body.id;

          // Second player joins
          request(app)
            .post('/api/player/join')
            .send({ name: 'Player2' })
            .end((err, res2) => {
              if (err) return done(err);
              player2Id = res2.body.id;

              // Both players move simultaneously
              const moveRequests = [
                request(app)
                  .post(`/api/player/${player1Id}/move`)
                  .send({ direction: 'right' }),
                request(app)
                  .post(`/api/player/${player2Id}/move`)
                  .send({ direction: 'up' })
              ];

              Promise.all(moveRequests)
                .then((responses) => {
                  responses.forEach((res) => {
                    if (res.status !== 200) throw new Error(`Unexpected status: ${res.status}`);
                    if (!res.body.success) throw new Error('Move failed');
                  });
                  done();
                })
                .catch(done);
            });
        });
    });
  });

  describe('Player Limits', () => {
    it('should handle exactly 10 players', (done) => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/player/join')
            .send({ name: `Player${i + 1}` })
        );
      }

      Promise.all(requests)
        .then((responses) => {
          responses.forEach((res) => {
            if (res.status !== 201) throw new Error(`Unexpected status: ${res.status}`);
          });

          if (world.getPlayerCount() !== 10) {
            throw new Error(`Expected 10 players, got ${world.getPlayerCount()}`);
          }

          done();
        })
        .catch(done);
    });

    it('should still accept 11th player (no hard limit)', (done) => {
      const requests = [];
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app)
            .post('/api/player/join')
            .send({ name: `Player${i + 1}` })
        );
      }

      Promise.all(requests)
        .then((responses) => {
          // All should succeed
          responses.forEach((res) => {
            if (res.status !== 201) throw new Error(`Join failed for player`);
          });

          if (world.getPlayerCount() !== 11) {
            throw new Error(`Expected 11 players, got ${world.getPlayerCount()}`);
          }

          done();
        })
        .catch(done);
    });
  });
});
