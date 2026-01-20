# macOS Version

This directory contains the macOS-specific files for building the Red Hat AI Chatbot as a native macOS application.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run the Electron app
npm run electron
```

### Building

```bash
# Build the macOS app
npm run build:mac

# Or use the build script
chmod +x build-mac.sh
./build-mac.sh
```

## Files

- `main.js` - Electron main process
- `preload.js` - Electron preload script (security)
- `package.json` - macOS dependencies and build configuration
- `electron-builder.yml` - Electron Builder configuration
- `build-mac.sh` - Build script
- `BUILD.md` - Detailed build instructions
- `assets/` - Application icons

## Shared Files

The macOS version uses these shared files from the `common/` directory:
- `../common/server.js` - Express backend server
- `../common/public/index.html` - Frontend chat UI
- `../../secrets.md` - API credentials

## Documentation

- See `BUILD.md` for detailed build instructions
- See `LOGGING.md` for information about where to find app logs
- See the main [README.md](../README.md) for full documentation

## Logs

When running the packaged app, logs are written to **macOS Console.app**:
1. Open Console.app (Applications > Utilities)
2. Search for "Red Hat AI Chatbot" or "electron"
3. Filter by log prefixes: `[ELECTRON]`, `[STARTUP]`, `[REQUEST]`, `[UPSTREAM]`

For development mode, logs appear in the terminal.

See `LOGGING.md` for complete logging information.
