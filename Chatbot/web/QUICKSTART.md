# Web Version - Quick Start

## Problems You May Encounter

### Problem 1: "Cannot read package.json"
If you tried to run `npm install` or `npm start` from the root `Chatbot/` directory, you got:
```
npm error enoent Could not read package.json
```
**Solution:** Run commands from the `web/` directory (see below).

### Problem 2: "Cannot find module 'express'"
If you got this error after running `npm start`:
```
Error: Cannot find module 'express'
```
**Solution:** This is now fixed! The `start-server.js` wrapper script automatically handles module resolution. Just make sure you ran `npm install` first.

## The Solution

**Always run npm commands from the `web/` directory:**

```bash
# Step 1: Navigate to web directory
cd Chatbot/web

# Step 2: Install dependencies
npm install

# Step 3: Start the server
npm start
```

## Why This Structure?

- `web/` contains web-specific configuration
- `macos/` contains macOS-specific configuration  
- Root contains shared files (server.js, public/)

Each version has its own `package.json` and `node_modules/` to keep dependencies separate.

## Verification

After running `npm start`, you should see:
```
[STARTUP] Reading secrets from: ...
[STARTUP] ✓ API Key found
[STARTUP] ✓ API Endpoint: ...
[STARTUP] ✓ Server started on http://localhost:3000
```

Then open `http://localhost:3000` in your browser.
