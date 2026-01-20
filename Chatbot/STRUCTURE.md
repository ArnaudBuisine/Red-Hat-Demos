# Folder Structure Guide

This document explains the organization of folders in the Chatbot project.

## Folder Organization

### Root Level (`Chatbot/`)

**Common Files (used by both web and macOS versions):**
- `common/` - Shared code directory
  - `server.js` - Express backend server
  - `public/` - Frontend files (HTML, CSS, JS)
    - `index.html` - Chat UI
- `README.md` - Main documentation
- `.gitignore` - Git ignore rules
- `Prompts.md` - Documentation

**Note:** There is NO `node_modules/`, `package.json`, `package-lock.json`, or `dist/` in the root. Each version manages its own dependencies and build outputs.

### Web Version (`Chatbot/web/`)

**Contains:**
- `package.json` - Web-specific dependencies and scripts
- `node_modules/` - Created when you run `npm install` in this directory
- `README.md` - Web version quick start guide

**To use:**
```bash
cd Chatbot/web
npm install    # Creates node_modules/ here
npm start      # Starts the web server
```

### macOS Version (`Chatbot/macos/`)

**Contains:**
- `main.js` - Electron main process
- `preload.js` - Electron preload script
- `package.json` - macOS-specific dependencies and build config
- `package-lock.json` - Dependency lock file
- `electron-builder.yml` - Build configuration
- `build-mac.sh` - Build script
- `BUILD.md` - Build instructions
- `README.md` - macOS version quick start
- `assets/` - Application icons
- `node_modules/` - Created when you run `npm install` in this directory
- `dist/` - Created when you build the app (contains .app, .dmg files)

**To use:**
```bash
cd Chatbot/macos
npm install    # Creates node_modules/ here
npm run electron    # Run in development
npm run build:mac   # Creates dist/ here with built app
```

## Important Notes

1. **`common/` contains shared files** - `server.js` and `public/` are in `common/` and used by both versions
2. **Each version has its own `node_modules/`** - Run `npm install` in `web/` or `macos/` directories
3. **`dist/` is macOS-specific** - Only created when building the macOS app, located in `macos/dist/`
4. **No root `node_modules/`** - Removed to avoid confusion; each version manages its own dependencies

## Why This Structure?

- **Separation of concerns**: Web and macOS versions have different dependencies
- **Clear organization**: Easy to see what belongs to which version
- **Shared resources**: Common code (server.js, public/) is in `common/` and accessible to both
- **Independent builds**: Each version can be built/run independently
- **Better organization**: All shared files are clearly grouped in `common/`
