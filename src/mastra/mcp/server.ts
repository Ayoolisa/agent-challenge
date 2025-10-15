#!/usr/bin/env node

import express from 'express';
import { MCPServer } from '@mastra/mcp';
import { z } from 'zod';

// MCP config (same as before—tools/agents plug in later)
const mcpConfig = {
  name: 'personal-assistant-mcp',
  version: '1.0.0',
  tools: {},  // Add checkCalendarTool here next
};

// Register schema (for context validation)
const server = new MCPServer(mcpConfig);
if (server.registerSchema) {
  server.registerSchema('userContext', z.object({
    userId: z.string(),
    preferences: z.object({ timezone: z.string().default('UTC') }),
    history: z.array(z.object({ action: z.string(), timestamp: z.string() })),
  }));
}

// Express app for SSE transport
const app = express();
const PORT = 4112;
const ssePath = '/sse';
const messagePath = '/message';

app.use(express.json());

// SSE handler: Connects MCP stream
app.get(ssePath, async (req, res) => {
  try {
    // Build URL from req host (dynamic for dev/prod)
    const url = new URL(`http://${req.headers.host}${ssePath}`);
    await server.startSSE({
      url,
      ssePath,
      messagePath,
      req,
      res,
    });
  } catch (error) {
    console.error('SSE start error:', error);
    res.status(500).send('SSE failed');
  }
});

// Message handler: For POST sends from clients (MCP protocol)
app.post(messagePath, async (req, res) => {
  try {
    // Forward to MCP's handleRequest (covers prompts/tools)
    await server.handleRequest?.(req, res);
  } catch (error) {
    console.error('Message handle error:', error);
    res.status(500).send('Message failed');
  }
});

// Health check for curl
app.get('/health', (req, res) => res.send('MCP Server healthy!'));

app.listen(PORT, () => {
  console.log(`MCP Server running on http://localhost:${PORT}—SSE at /sse, messages at /message`);
});