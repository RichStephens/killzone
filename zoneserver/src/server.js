/**
 * KillZone Server
 * 
 * Central authority for world state, entity management, and game logic.
 * REST API server managing shared game state across all connected clients.
 */

const express = require('express');
const cors = require('cors');
const World = require('./world');
const createApiRoutes = require('./routes/api');

const PORT = process.env.PORT || 3000;

// Initialize world
const world = new World(40, 20);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method.padEnd(6);
  const path = req.path;
  
  // Log request details
  let logMsg = `[${timestamp}] ${method} ${path}`;
  
  // Add body info for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
    logMsg += ` | Body: ${JSON.stringify(req.body)}`;
  }
  
  console.log(logMsg);
  
  // Capture response status
  const originalJson = res.json;
  res.json = function(data) {
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '❌' : '✅';
    console.log(`  ${statusColor} Response [${statusCode}]: ${JSON.stringify(data).substring(0, 100)}${JSON.stringify(data).length > 100 ? '...' : ''}`);
    return originalJson.call(this, data);
  };
  
  next();
});

// API routes
app.use('/api', createApiRoutes(world));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server only if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`KillZone Server running on http://localhost:${PORT}`);
    console.log(`World dimensions: 40x20`);
    console.log(`API health check: GET http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = { app, world };
