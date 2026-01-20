#!/usr/bin/env node

// Wrapper script to start the server with correct module resolution
// This ensures node_modules in web/ directory is found when running server.js from common/

const path = require('path');
const fs = require('fs');
const Module = require('module');

// Add web/node_modules to module search paths
const webNodeModules = path.join(__dirname, 'node_modules');

// Verify node_modules exists
if (!fs.existsSync(webNodeModules)) {
  console.error('ERROR: node_modules not found in web/ directory');
  console.error('Please run: cd web && npm install');
  process.exit(1);
}

// Use Module._nodeModulePaths to add web/node_modules to module search
// This is the internal function Node.js uses to determine module paths
const originalNodeModulePaths = Module._nodeModulePaths;

Module._nodeModulePaths = function(from) {
  const paths = originalNodeModulePaths(from);
  // Add web/node_modules to the paths
  if (!paths.includes(webNodeModules)) {
    paths.unshift(webNodeModules);
  }
  return paths;
};

// Also set NODE_PATH as backup
const currentNodePath = process.env.NODE_PATH || '';
process.env.NODE_PATH = webNodeModules + (currentNodePath ? path.delimiter + currentNodePath : '');

// Now require and run the server (server.js is in common/ directory)
require('../common/server.js');
