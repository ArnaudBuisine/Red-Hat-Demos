// Preload script for Electron
// This runs in a context with access to Node.js APIs but isolated from the renderer

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the APIs in a safe way
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any Electron-specific APIs here if needed
  platform: process.platform,
  versions: process.versions
});
