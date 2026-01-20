# Building macOS Application

Quick guide for building the Red Hat AI Chatbot as a macOS application.

## Prerequisites

- macOS (for building macOS apps)
- Node.js v14 or higher
- `secrets.md` in the parent directory

## Quick Build

```bash
# Install all dependencies (including Electron)
npm install

# Build the macOS app
npm run build:mac
```

The built application will be in `dist/mac/` directory.

## What Gets Built

- **Red Hat AI Chatbot.app** - The macOS application bundle
- **Red Hat AI Chatbot-1.0.0.dmg** - Disk image installer
- **Red Hat AI Chatbot-1.0.0-mac.zip** - Zip archive (for distribution)

Both Intel (x64) and Apple Silicon (arm64) versions are included.

## Running the Built App

1. Open `dist/mac/Red Hat AI Chatbot.app` in Finder
2. Double-click to launch
3. The app will automatically start the server and open the chat window

## Development Mode

To test the Electron app without building:

```bash
npm run electron
```

This runs the app in development mode with hot-reload capabilities.

## Troubleshooting

### Build Fails

- Ensure all dependencies are installed: `npm install`
- Check that you're on macOS (required for building macOS apps)
- Verify Node.js version: `node --version` (should be v14+)

### App Won't Start

- Check macOS Console.app for error messages
- Ensure `secrets.md` exists in the parent directory
- Try running in development mode first: `npm run electron`

### Icon Not Showing

- Add `assets/icon.icns` file (see `assets/README.md`)
- Rebuild the app after adding the icon

## Distribution

The `.dmg` file can be distributed to other macOS users. They can:
1. Open the DMG
2. Drag the app to Applications
3. Launch from Applications or Launchpad

Note: Users may need to allow the app in System Preferences > Security & Privacy if it's not signed with an Apple Developer certificate.
