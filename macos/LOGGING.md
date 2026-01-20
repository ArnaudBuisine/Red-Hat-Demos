# macOS App Logging

This document explains where to find logs for the Red Hat AI Chatbot macOS application.

## Log Locations

### 1. Log File (Primary Location for Packaged App) ⭐

When running the packaged `.app` file, logs are written to a file:

**Location:** `~/Library/Logs/Red Hat AI Chatbot.log`

**To view logs:**
```bash
# View the log file
tail -f ~/Library/Logs/Red\ Hat\ AI\ Chatbot.log

# Or open in TextEdit
open ~/Library/Logs/Red\ Hat\ AI\ Chatbot.log
```

**In Finder:**
1. Press `Cmd+Shift+G` (Go to Folder)
2. Type: `~/Library/Logs/`
3. Look for `Red Hat AI Chatbot.log`

### 2. macOS Console.app (System Logs)

Logs also appear in the macOS system console, but may be harder to find.

**To view logs:**
1. Open **Console.app** (Applications > Utilities > Console)
2. In the search box, try:
   - The app's process name (may vary)
   - `node` or `Node.js`
   - Search for log prefixes: `[ELECTRON]`, `[STARTUP]`, `[REQUEST]`
3. Select your Mac in the sidebar
4. Check "All Messages" or filter by time

**Note:** Console.app can be noisy. The log file (above) is easier to use.

### 2. Terminal (Development Mode)

When running from command line:
```bash
cd Chatbot/macos
npm run electron
```

All logs appear directly in the terminal where you ran the command.

### 3. Application Log Files ✅

The app writes logs to a file for easy access:

**Location:** `~/Library/Logs/Red Hat AI Chatbot.log`

This file contains all logs with timestamps, making it easy to:
- Debug issues
- Track application behavior
- Review error messages
- Monitor API calls

The log file is automatically created when the app starts.

### 4. Crash Reports

If the app crashes, crash reports are stored in:
- `~/Library/Logs/DiagnosticReports/`
- Look for files named `Red Hat AI Chatbot_*.crash`

## Log Prefixes

The app uses prefixes to categorize logs:

- `[ELECTRON]` - Electron main process logs
- `[STARTUP]` - Server initialization and configuration
- `[REQUEST]` - Incoming chat requests
- `[UPSTREAM]` - Red Hat API calls and responses
- `[CRITICAL]` - Unhandled errors

## Viewing Logs in Console.app

1. **Open Console.app**
2. **Select your Mac** in the sidebar (under "Devices")
3. **Use the search box** and type: `Red Hat AI Chatbot`
4. **Filter by log level** if needed (Errors, Warnings, etc.)

## Tips

- Logs are real-time - you'll see new entries as they happen
- Use the search/filter to find specific errors
- Logs persist in Console.app for a limited time (system-dependent)
- For persistent logging, consider adding file-based logging to the app
