# Common Files

This directory contains files shared between the web and macOS versions of the Red Hat AI Chatbot.

## Contents

- `server.js` - Express backend server (used by both versions)
- `public/` - Frontend files
  - `index.html` - Chat UI (used by both versions)

## Usage

These files are automatically referenced by:
- **Web version**: `web/start-server.js` loads `../common/server.js`
- **macOS version**: `macos/main.js` loads `../common/server.js`

## Notes

- Do not modify these files unless the change should apply to both versions
- The server automatically finds `public/` using `__dirname`, so paths are relative to this directory
- Secrets are read from `../../secrets.md` (parent of Chatbot directory)
