# Web Version

This directory contains the web-specific configuration for the Red Hat AI Chatbot.

## Quick Start

```bash
# Navigate to web directory
cd Chatbot/web

# Install dependencies
npm install

# Start the server
npm start
```

Then open `http://localhost:3000` in your browser.

## Important Notes

⚠️ **You must run `npm install` and `npm start` from the `web/` directory, not from the root `Chatbot/` directory.**

The `package.json` file is located in `web/`, so all npm commands must be run from here.

## Files

- `package.json` - Web version dependencies and scripts
- `start-server.js` - Wrapper script that handles module resolution (ensures node_modules in web/ is found)

## Shared Files

The web version uses these shared files from the `common/` directory:
- `../common/server.js` - Express backend server
- `../common/public/index.html` - Frontend chat UI
- `../../secrets.md` - API credentials (in parent directory)

## Troubleshooting

### "Cannot find package.json"
- Make sure you're in the `web/` directory: `cd Chatbot/web`
- Don't run npm commands from the root `Chatbot/` directory

### "Cannot find module 'express'" or similar module errors
- Make sure you ran `npm install` from the `web/` directory
- This creates `web/node_modules/` with the required dependencies
- The `start-server.js` wrapper script handles module resolution automatically
- If you still get errors, try: `rm -rf node_modules && npm install`

### "Cannot find public folder"
- The `public/` folder should be in `Chatbot/common/public/`
- The server automatically finds it using the correct path

See the main [README.md](../README.md) for full documentation.
