const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const Module = require('module');
const os = require('os');

let mainWindow = null;
let server = null;
const PORT = 3000;

// Set up logging to file for packaged apps
const logFile = app.isPackaged 
  ? path.join(os.homedir(), 'Library', 'Logs', 'Red Hat AI Chatbot.log')
  : path.join(__dirname, 'chatbot.log');

// Override console methods to also write to file
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function writeToFile(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    // Silently fail if can't write to log file
  }
  
  // Also call original console method
  if (level === 'LOG') originalLog.apply(console, args);
  else if (level === 'ERROR') originalError.apply(console, args);
  else if (level === 'WARN') originalWarn.apply(console, args);
}

console.log = function(...args) {
  writeToFile('LOG', ...args);
};

console.error = function(...args) {
  writeToFile('ERROR', ...args);
};

console.warn = function(...args) {
  writeToFile('WARN', ...args);
};

// Log startup info
console.log(`[ELECTRON] Red Hat AI Chatbot starting...`);
console.log(`[ELECTRON] Log file: ${logFile}`);
console.log(`[ELECTRON] Process ID: ${process.pid}`);
console.log(`[ELECTRON] App version: ${app.getVersion()}`);
console.log(`[ELECTRON] Electron version: ${process.versions.electron}`);

// Start the Express server directly in this process
function startServer() {
  console.log('[ELECTRON] Starting Express server...');
  
  const macosNodeModules = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(macosNodeModules)) {
    const error = 'node_modules not found in macos/ directory. Please run: cd macos && npm install';
    console.error(`[ELECTRON] ERROR: ${error}`);
    if (mainWindow) {
      mainWindow.loadURL(`data:text/html,<html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h1>Error Starting Server</h1><p>${error}</p></body></html>`);
    }
    setTimeout(() => startServer(), 2000);
    return;
  }
  
  try {
    // Use Module._nodeModulePaths to add macos/node_modules to module search
    // This is the internal function Node.js uses to determine module paths
    const Module = require('module');
    const originalNodeModulePaths = Module._nodeModulePaths;
    
    Module._nodeModulePaths = function(from) {
      const paths = originalNodeModulePaths(from);
      // Add macos/node_modules to the paths
      if (!paths.includes(macosNodeModules)) {
        paths.unshift(macosNodeModules);
      }
      return paths;
    };
    
    // Also set NODE_PATH as backup
    const currentNodePath = process.env.NODE_PATH || '';
    process.env.NODE_PATH = macosNodeModules + (currentNodePath ? path.delimiter + currentNodePath : '');
    
    console.log('[ELECTRON] ✓ Module paths configured');
    
    // Import and start the server (server.js is in common/ directory)
    // Handle both development and packaged app paths
    let serverPath;
    if (app.isPackaged) {
      // In packaged app, files are in app.asar
      // app.getAppPath() returns the path to app.asar (e.g., .../app.asar)
      const appPath = app.getAppPath();
      console.log(`[ELECTRON] Packaged app - App path: ${appPath}`);
      
      // Try multiple possible locations for common/server.js
      // extraResources are placed in Resources/ folder (process.resourcesPath)
      const possiblePaths = [
        path.join(process.resourcesPath, 'common', 'server'),  // In extraResources (most likely)
        path.join(appPath, 'common', 'server'),                // Inside app.asar/common/
        path.join(appPath, '..', 'common', 'server'),          // Outside app.asar, in Resources/common/
        path.join(process.resourcesPath, 'app', 'common', 'server'), // Alternative resources path
        path.join(__dirname, '..', 'common', 'server'),        // Relative to main.js location
      ];
      
      let found = false;
      for (const tryPath of possiblePaths) {
        console.log(`[ELECTRON] Trying path: ${tryPath}.js`);
        if (fs.existsSync(tryPath + '.js')) {
          serverPath = tryPath;
          found = true;
          console.log(`[ELECTRON] ✓ Found server at: ${serverPath}`);
          break;
        }
      }
      
      if (!found) {
        // List what's actually in the app path for debugging
        console.log(`[ELECTRON] DEBUG - Contents of appPath: ${appPath}`);
        try {
          const contents = fs.readdirSync(appPath);
          console.log(`[ELECTRON] DEBUG - Files in appPath:`, contents);
        } catch (e) {
          console.log(`[ELECTRON] DEBUG - Cannot read appPath directory`);
        }
        
        throw new Error(`Server file not found. Tried paths: ${possiblePaths.map(p => p + '.js').join(', ')}`);
      }
    } else {
      // In development, use relative path
      serverPath = path.join(__dirname, '..', 'common', 'server');
      console.log(`[ELECTRON] Development mode - Server path: ${serverPath}`);
    }
    
    const serverModule = require(serverPath);
    server = serverModule.server;
    
    // Server should already be listening, just verify
    console.log('[ELECTRON] ✓ Server module loaded');
    
    // Wait a bit for server to be ready
    setTimeout(() => {
      checkServerReady();
    }, 500);
  } catch (error) {
    console.error('[ELECTRON] Failed to start server:', error);
    
    if (mainWindow) {
      mainWindow.loadURL(`data:text/html,<html><body style="font-family: sans-serif; padding: 40px; text-align: center;"><h1>Error Starting Server</h1><p>${error.message}</p><p>Please check the console for details.</p><p>Make sure you ran: cd macos && npm install</p></body></html>`);
    }
    setTimeout(() => startServer(), 2000);
  }
}

// Check if server is ready
function checkServerReady() {
  const http = require('http');
  const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
    if (res.statusCode === 200) {
      console.log('[ELECTRON] ✓ Server is ready');
      if (mainWindow) {
        mainWindow.loadURL(`http://localhost:${PORT}`);
      }
    } else {
      console.log('[ELECTRON] Server not ready yet, retrying...');
      setTimeout(checkServerReady, 500);
    }
  });
  
  req.on('error', () => {
    console.log('[ELECTRON] Server not ready yet, retrying...');
    setTimeout(checkServerReady, 500);
  });
  
  req.setTimeout(2000, () => {
    req.destroy();
    setTimeout(checkServerReady, 500);
  });
}

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    title: 'Red Hat AI Chatbot',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#667eea',
    show: false // Don't show until ready
  });
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('[ELECTRON] ✓ Window ready');
  });
  
  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Start server and load URL
  startServer();
}

// App event handlers
app.whenReady().then(() => {
  console.log('[ELECTRON] App ready, creating window...');
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[ELECTRON] Quitting, stopping server...');
  if (server) {
    server.close(() => {
      console.log('[ELECTRON] Server closed');
    });
  }
});

// Handle app termination
process.on('SIGTERM', () => {
  if (server) {
    server.close();
  }
  app.quit();
});

process.on('SIGINT', () => {
  if (server) {
    server.close();
  }
  app.quit();
});
