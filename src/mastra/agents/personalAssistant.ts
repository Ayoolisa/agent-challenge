import { Agent } from '@mastra/core';
import { MCPClient } from '@mastra/mcp';
import { checkCalendarTool } from '../tools/calendar';

// MCP client (from our server)
import { mcpClient } from '../mcp/client';

export const personalAssistant = new Agent({
  name: 'Personal Assistant',
  model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:0.6b',
  llmProvider: { apiUrl: process.env.OLLAMA_API_URL },
  tools: [checkCalendarTool],  // Our new tool—LLM calls dynamically
  async beforeToolCall(context) {
    // Pull from MCP before acting
    const userCtx = await mcpClient.getContext('userContext') || {};
    context.timezone = userCtx.preferences?.timezone || 'UTC';
    return context;
  },
  systemPrompt: `You are a smart personal assistant. Use check_calendar for schedule questions. Remember user details via context.`,
});