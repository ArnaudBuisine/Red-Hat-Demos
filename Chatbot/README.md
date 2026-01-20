# Red Hat AI Chatbot

A minimal, production-grade ChatGPT-like application with streaming responses, powered by Red Hat AI Services (Mistral-Small-24B-W8A8). Available in both **web** and **macOS** versions.

## Features

- 🚀 **Streaming Responses**: Real-time streaming of AI responses for a smooth chat experience
- 💬 **Multi-turn Conversations**: Maintains conversation context within a session
- 🎨 **Clean UI**: Modern, responsive chat interface
- 🛡️ **Robust Error Handling**: Comprehensive error handling with user-friendly messages
- 📊 **Live Logging**: Detailed console logs for monitoring and debugging
- 🔄 **Retry Logic**: Automatic retries for transient failures
- ⚡ **Simple Setup**: Minimal dependencies, runs out-of-the-box
- 🖥️ **Multiple Platforms**: Available as web app and native macOS application

## Project Structure

```
Chatbot/
├── common/                # Shared files (used by both versions)
│   ├── server.js         # Express backend server
│   └── public/           # Frontend files
│       └── index.html    # Chat UI
├── web/                   # Web version specific files
│   ├── package.json      # Web dependencies and scripts
│   ├── start-server.js   # Server wrapper for module resolution
│   ├── node_modules/     # Web dependencies (created on npm install)
│   └── README.md         # Web version guide
├── macos/                 # macOS version specific files
│   ├── main.js           # Electron main process
│   ├── preload.js        # Electron preload script
│   ├── package.json      # macOS dependencies and scripts
│   ├── package-lock.json # Lock file
│   ├── electron-builder.yml  # Build configuration
│   ├── build-mac.sh      # Build script
│   ├── BUILD.md          # Build instructions
│   ├── README.md         # macOS version guide
│   ├── assets/           # App icons
│   ├── node_modules/     # macOS dependencies (created on npm install)
│   └── dist/             # Build output (created on build)
├── README.md             # This file
├── .gitignore           # Git ignore rules
└── Prompts.md           # Documentation
```

**Note:** 
- `common/` contains shared files (server.js, public/) used by both versions
- Each version (`web/` and `macos/`) has its own `node_modules/` directory
- `macos/dist/` contains the built macOS application

## Prerequisites

- Node.js (v14 or higher)
- `secrets.md` file in the parent directory with Red Hat API credentials:
  - `Red Hat API Key=your-api-key`
  - `Red Hat API endpoint=https://your-endpoint-url`

---

## Web Version

### Setup

⚠️ **Important:** You must run all commands from the `web/` directory, not from the root `Chatbot/` directory.

1. **Navigate to web directory:**
   ```bash
   cd Chatbot/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This creates `web/node_modules/` with the required dependencies.

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open the chat interface:**
   Navigate to `http://localhost:3000` in your browser

**Note:** If you get "Cannot find package.json" errors, make sure you're in the `web/` directory, not the root `Chatbot/` directory.

### How It Works

- **Backend (`../server.js`)**: Express server that handles chat requests
- **Frontend (`../public/index.html`)**: Single-page chat interface
- Server reads API credentials from `../../secrets.md`
- Maintains conversation history per session
- Handles errors gracefully with retries

---

## macOS Application

### Running as Electron App (Development)

1. **Navigate to macos directory:**
   ```bash
   cd Chatbot/macos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Electron app:**
   ```bash
   npm run electron
   ```

   This will:
   - Start the Express server in the background
   - Open a native macOS window with the chat interface
   - Automatically handle server lifecycle

### Building macOS Application

1. **Navigate to macos directory:**
   ```bash
   cd Chatbot/macos
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the macOS app:**
   ```bash
   npm run build:mac
   ```
   
   Or use the build script:
   ```bash
   chmod +x build-mac.sh
   ./build-mac.sh
   ```

4. **Find the built app:**
   - The `.app` bundle will be in the `dist/mac/` directory
   - A `.dmg` installer will also be created in `dist/`
   - Both Intel (x64) and Apple Silicon (arm64) versions are built

5. **Run the app:**
   - Double-click the `.app` file in Finder
   - Or drag the `.app` to Applications and launch from there

### macOS App Features

- ✅ Native macOS application window
- ✅ Automatic server startup when app launches
- ✅ Server runs in background (no terminal needed)
- ✅ Standalone executable (includes all dependencies)
- ✅ Works offline (server runs locally)
- ✅ Auto-restart on server errors

### Packaging Notes

- The app includes the Express server and all Node.js dependencies
- `secrets.md` should be in the parent directory (same as web version)
- The app will look for `secrets.md` in multiple locations:
  - Packaged app resources folder
  - Parent directory (development)
  - Same directory as the app
- Console logs appear in the macOS Console app (search for "Red Hat AI Chatbot")

For detailed build instructions, see `macos/BUILD.md`.

---

## Verification

### Web Version

1. Start the server - you should see:
   ```
   [STARTUP] Reading secrets from: ...
   [STARTUP] ✓ API Key found
   [STARTUP] ✓ API Endpoint: ...
   [STARTUP] ✓ Server started on http://localhost:3000
   ```

2. Open `http://localhost:3000` in your browser

3. Send a test message - you should see:
   - Your message appears immediately
   - Assistant response streams in real-time
   - Console shows detailed logs of the request flow

### macOS Version

1. Launch the app - window should open automatically
2. Send a test message - same behavior as web version
3. Check Console.app for detailed logs if needed

---

## Error Handling

- **Authentication Errors**: Clear message if API key is invalid
- **Network Errors**: Automatic retries with exponential backoff
- **Rate Limits**: User-friendly message with retry suggestion
- **Critical Errors**: Application continues running, errors logged to console

## Console Logging

The application provides detailed console logs:
- `[STARTUP]` - Server initialization
- `[REQUEST]` - Incoming chat requests
- `[UPSTREAM]` - Red Hat API calls and responses
- `[CRITICAL]` - Unhandled errors (app continues running)
- `[ELECTRON]` - Electron-specific logs (macOS version only)

### Where to Find Logs

**Web Version:**
- Logs appear in the terminal where you ran `npm start`

**macOS Version:**
- **Development:** Logs appear in the terminal where you ran `npm run electron`
- **Packaged App:** Logs go to **Console.app** (Applications > Utilities > Console)
  - Search for "Red Hat AI Chatbot" or "electron" to filter logs
  - See `macos/LOGGING.md` for detailed instructions

## Notes

- Secrets are read from `../secrets.md` (parent directory) or app resources
- Conversation history is stored in-memory (resets on server restart)
- Default port is 3000 (change in `server.js` if needed)
- The application uses the Mistral-Small-24B-W8A8 model via Red Hat AI Services
- Both web and macOS versions share the same backend (`server.js`) and frontend (`public/index.html`)

## Troubleshooting

### Web Version

- **Port already in use**: Another instance might be running, or change PORT in `server.js`
- **Can't find secrets.md**: Ensure `secrets.md` is in the parent directory
- **Module not found**: Run `npm install` in the `web/` directory

### macOS Version

- **App won't start**: Check Console.app for error messages
- **Can't find secrets.md**: Ensure `secrets.md` is in the parent directory
- **Build fails**: Ensure you're on macOS and have all dependencies installed
- **Icon not showing**: Add `macos/assets/icon.icns` file (see `macos/assets/README.md`)
