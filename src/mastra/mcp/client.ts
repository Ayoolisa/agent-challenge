import { MCPClient } from '@mastra/mcp';

// Shared MCP client—import this in agents/tools
export const mcpClient = new MCPClient({
  servers: {
    local: { url: 'http://localhost:4112' },  // Points to our Express SSE server
  },
});