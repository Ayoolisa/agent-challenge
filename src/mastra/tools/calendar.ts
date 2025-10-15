import { createTool } from '@mastra/core';  // Mastra's tool decorator
import { z } from 'zod';  // Validation—keeps inputs sane
import { mcpClient } from '../mcp/client';
export const checkCalendarTool = createTool({
  name: 'check_calendar',
  description: 'Fetch and summarize upcoming events from the user\'s calendar. Use for scheduling queries.',
  schema: z.object({
    date: z.string().describe('Date to check in YYYY-MM-DD format'),
  }),
  async execute({ date }, context) {  // Context includes MCP-pulled stuff like timezone
    const timezone = context.timezone || 'UTC';  // Fallback from MCP

    // Mock data—real: Fetch from Google Calendar API (add key to .env)
    const mockEvents = [
      { title: 'Team Sprint Planning', start: '10:00 AM', end: '11:00 AM' },
      { title: 'Lunch Break', start: '12:00 PM', end: '1:00 PM' },
      { title: 'Code Review Session', start: '3:00 PM', end: '4:00 PM' },
    ];

    // Filter for the date (simple mock—add date lib like date-fns for prod)
    const eventsForDate = mockEvents;  // Pretend all on this date for demo

    const summary = `Events on ${date} (${timezone}): ${eventsForDate.map(e => `${e.title} (${e.start} - ${e.end})`).join('; ')}`;

    // Persist to MCP for history (enhances "enhanced capabilities")
    const userCtx = await mcpClient.getContext('userContext') || { history: [] };
    userCtx.history.push({ action: 'checked_calendar', date, timestamp: new Date().toISOString() });
    await mcpClient.setContext('userContext', userCtx);  // Assuming MCPClient has set (stub if not)

    return summary;
  },
});