import { Agent } from '@mastra/core';
import { MCPClient } from '@mastra/mcp';  // Client for pulling from server

const mcpClient = new MCPClient({
  servers: {
    local: {
      url: 'http://localhost:4112',  // Our SSE endpoint
    },
  },
});

export const personalAssistant = new Agent({
  name: 'Personal Assistant',
  model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:0.6b',
  llmProvider: { apiUrl: process.env.OLLAMA_API_URL },
  tools: await mcpClient.getTools(),  // Dynamic from MCP
  async beforeToolCall(context) {
    const userCtx = await mcpClient.getContext?.('userContext') || {};
    if (userCtx.preferences?.timezone) context.timezone = userCtx.preferences.timezone;
    return context;
  },
  systemPrompt: 'You are a helpful assistant. Use MCP for context and tools.',
});