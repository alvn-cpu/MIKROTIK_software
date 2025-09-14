#!/usr/bin/env node

// Simple start script for Railway deployment
const path = require('path');
const { spawn } = require('child_process');

console.log('Starting WiFi Billing System...');
console.log('Working directory:', process.cwd());

// Change to backend directory and start the server
process.chdir(path.join(__dirname, 'backend'));
console.log('Changed to backend directory:', process.cwd());

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});