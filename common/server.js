const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const expressApp = express();
const PORT = process.env.PORT || 3000;

// Middleware
expressApp.use(cors());
expressApp.use(express.json());
// Use __dirname to ensure public folder is found (public is in same common/ directory)
expressApp.use(express.static(path.join(__dirname, 'public')));

// Parse secrets.md
function parseSecrets() {
  // Try multiple paths: packaged app (resources), development (parent dir), same dir
  const possiblePaths = [
    // Packaged app locations (extraResources)
    process.resourcesPath ? path.join(process.resourcesPath, 'secrets.md') : null,
    // Also try common folder (in case it's there)
    process.resourcesPath ? path.join(process.resourcesPath, 'common', 'secrets.md') : null,
    // Development locations
    path.join(__dirname, '..', '..', 'secrets.md'), // Development (parent of Chatbot)
    path.join(__dirname, '..', 'secrets.md'), // Parent directory (Chatbot/)
    path.join(__dirname, 'secrets.md'), // Same directory
  ].filter(p => p !== null); // Remove null entries
  
  // Debug: log what we're checking
  console.log(`[STARTUP] process.resourcesPath: ${process.resourcesPath || 'undefined'}`);
  console.log(`[STARTUP] __dirname: ${__dirname}`);
  console.log(`[STARTUP] Checking ${possiblePaths.length} paths for secrets.md...`);
  
  let secretsPath = null;
  for (const p of possiblePaths) {
    const exists = fs.existsSync(p);
    console.log(`[STARTUP]   ${exists ? '✓' : '✗'} ${p}`);
    if (exists) {
      secretsPath = p;
      break;
    }
  }
  
  console.log(`[STARTUP] Reading secrets from: ${secretsPath || 'not found'}`);
  
  try {
    if (!secretsPath || !fs.existsSync(secretsPath)) {
      throw new Error(`secrets.md not found. Tried: ${possiblePaths.join(', ')}`);
    }
    
    const content = fs.readFileSync(secretsPath, 'utf-8');
    const secrets = {};
    
    // Parse key-value pairs
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+?)\s*=\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        secrets[key] = value;
      }
    }
    
    const apiKey = secrets['Red Hat API Key'];
    let apiEndpoint = secrets['Red Hat API endpoint'];
    
    if (!apiKey) {
      throw new Error('Red Hat API Key not found in secrets.md');
    }
    if (!apiEndpoint) {
      throw new Error('Red Hat API endpoint not found in secrets.md');
    }
    
    // Ensure endpoint has /v1 if not present
    if (!apiEndpoint.endsWith('/v1') && !apiEndpoint.endsWith('/v1/')) {
      apiEndpoint = apiEndpoint.replace(/\/$/, '') + '/v1';
    }
    
    console.log(`[STARTUP] ✓ API Key found`);
    console.log(`[STARTUP] ✓ API Endpoint: ${apiEndpoint}`);
    
    return { apiKey, apiEndpoint };
  } catch (error) {
    console.error(`[STARTUP] ERROR: ${error.message}`);
    throw error;
  }
}

// Initialize secrets
let secrets;
try {
  secrets = parseSecrets();
} catch (error) {
  console.error(`[STARTUP] CRITICAL: Failed to load secrets: ${error.message}`);
  console.error(`[STARTUP] Please ensure secrets.md exists with Red Hat API Key and endpoint`);
  // Don't exit if running in Electron - let it handle the error
  if (!process.versions.electron) {
    process.exit(1);
  }
}

// Conversation history storage (in-memory, per session)
const conversations = new Map();

// Make HTTP/HTTPS request with retry logic
function makeRequest(url, options, data, retries = 2) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
      timeout: 60000, // 60 second timeout
    };
    
    const attemptRequest = (attempt) => {
      console.log(`[UPSTREAM] Attempt ${attempt + 1}/${retries + 1}: Calling Red Hat API...`);
      
      const req = client.request(requestOptions, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          // Read error response body
          let errorBody = '';
          res.on('data', (chunk) => { errorBody += chunk.toString(); });
          res.on('end', () => {
            const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
            error.statusCode = res.statusCode;
            error.body = errorBody;
            
            // Log error details
            console.error(`[UPSTREAM] HTTP Error ${res.statusCode}: ${errorBody.substring(0, 200)}`);
            
            // Retry on 5xx errors or rate limits
            if ((res.statusCode >= 500 || res.statusCode === 429) && attempt < retries) {
              console.log(`[UPSTREAM] Retryable error, retrying in 1s...`);
              setTimeout(() => attemptRequest(attempt + 1), 1000);
              return;
            }
            
            reject(error);
          });
          return;
        }
        
        resolve(res);
      });
      
      req.on('error', (error) => {
        console.error(`[UPSTREAM] Request error: ${error.message}`);
        if (attempt < retries) {
          console.log(`[UPSTREAM] Network error, retrying in 1s...`);
          setTimeout(() => attemptRequest(attempt + 1), 1000);
          return;
        }
        reject(error);
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempt < retries) {
          console.log(`[UPSTREAM] Timeout, retrying...`);
          setTimeout(() => attemptRequest(attempt + 1), 1000);
          return;
        }
        reject(new Error('Request timeout'));
      });
      
      if (data) {
        req.write(data);
      }
      req.end();
    };
    
    attemptRequest(0);
  });
}

// Chat endpoint with streaming
expressApp.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message || typeof message !== 'string') {
    console.log(`[REQUEST] ERROR: Invalid message`);
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const sid = sessionId || 'default';
  console.log(`[REQUEST] Received message from session ${sid}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  
  // Get or create conversation history
  if (!conversations.has(sid)) {
    conversations.set(sid, []);
    console.log(`[REQUEST] Created new conversation session: ${sid}`);
  }
  
  const conversationHistory = conversations.get(sid);
  
  // Add user message to history
  conversationHistory.push({ role: 'user', content: message });
  
  // Prepare messages for API (include system message and history)
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
  ];
  
  // Prepare request payload
  const payload = JSON.stringify({
    model: 'mistral-small-24b-w8a8',
    messages: messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048
  });
  
  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Check if secrets are loaded
  if (!secrets || !secrets.apiEndpoint || !secrets.apiKey) {
    console.error(`[REQUEST] ERROR: API credentials not configured`);
    res.write(`data: ${JSON.stringify({ error: 'API credentials not configured. Please ensure secrets.md exists with Red Hat API Key and endpoint.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }
  
  try {
    console.log(`[UPSTREAM] Starting upstream call to Red Hat API...`);
    
    const url = `${secrets.apiEndpoint}/chat/completions`;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${secrets.apiKey}`,
      }
    };
    
    const upstreamRes = await makeRequest(url, requestOptions, payload);
    
    console.log(`[UPSTREAM] ✓ Connection established, streaming response...`);
    
    let fullResponse = '';
    let buffer = '';
    
    upstreamRes.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            console.log(`[UPSTREAM] ✓ Stream completed`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    });
    
    upstreamRes.on('end', () => {
      console.log(`[UPSTREAM] ✓ Stream ended`);
      
      // Add assistant response to conversation history
      if (fullResponse) {
        conversationHistory.push({ role: 'assistant', content: fullResponse });
        console.log(`[REQUEST] ✓ Conversation updated, total messages: ${conversationHistory.length}`);
      }
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });
    
    upstreamRes.on('error', (error) => {
      console.error(`[UPSTREAM] ERROR: ${error.message}`);
      const userMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
      res.end();
    });
    
  } catch (error) {
    console.error(`[REQUEST] ERROR: ${error.message}`);
    console.error(`[REQUEST] Stack: ${error.stack}`);
    
    const userMessage = error.statusCode === 401 
      ? 'Authentication failed. Please check your API credentials in secrets.md.'
      : error.statusCode === 429
      ? 'Rate limit exceeded. Please try again in a moment.'
      : 'Sorry, I encountered an error while processing your request. Please try again.';
    
    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
    res.end();
  }
});

// Health check endpoint
expressApp.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server - only if not being imported by Electron
const server = expressApp.listen(PORT, () => {
  console.log(`[STARTUP] ✓ Server started on http://localhost:${PORT}`);
  console.log(`[STARTUP] ✓ Chat UI available at http://localhost:${PORT}`);
  console.log(`[STARTUP] Ready to accept requests`);
});

// Export for Electron use
module.exports = { expressApp, server, PORT };

// Graceful error handling
process.on('uncaughtException', (error) => {
  console.error(`[CRITICAL] Uncaught exception: ${error.message}`);
  console.error(`[CRITICAL] Stack: ${error.stack}`);
  // Don't exit - keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[CRITICAL] Unhandled rejection: ${reason}`);
  // Don't exit - keep the server running
});
