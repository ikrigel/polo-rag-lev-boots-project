/**
 * Main MCP Server for Lev-Boots RAG System
 * Exposes three tools: rag_search, list_knowledge_sources, read_source
 */

// CRITICAL: Suppress all stdout immediately to prevent MCP protocol corruption
// Some dependencies output to stdout on import, which breaks the MCP protocol
const originalWrite = process.stdout.write;
let suppressedOutput = '';
process.stdout.write = (chunk: any): boolean => {
  suppressedOutput += chunk;
  return true;
};

// Load environment variables first, before any other imports
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const SERVER_NAME = 'lev-boots-rag-server';
const SERVER_VERSION = '1.0.0';

/**
 * Lazy-load tool implementations only when needed to avoid early database initialization
 * Suppress any stdout output from module imports to prevent breaking MCP protocol
 */
let tools: any = null;

async function loadTools() {
  if (!tools) {
    // Suppress stdout during tool loading to prevent MCP protocol corruption
    const originalWrite = process.stdout.write;
    let capturedOutput = '';

    process.stdout.write = (chunk: any): boolean => {
      capturedOutput += chunk;
      return true;
    };

    try {
      const { ragSearchTool } = await import('./tools/ragSearch.js');
      const { listKnowledgeSourcesTool } = await import('./tools/listKnowledgeSources.js');
      const { readSourceTool } = await import('./tools/readSource.js');
      tools = {
        ragSearch: ragSearchTool,
        listSources: listKnowledgeSourcesTool,
        readSource: readSourceTool
      };
    } finally {
      process.stdout.write = originalWrite;
      if (capturedOutput) {
        console.error(`[loadTools] Suppressed stdout output: ${capturedOutput.substring(0, 100)}`);
      }
    }
  }
  return tools;
}

/**
 * Initialize MCP server
 */
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Handler for ListTools request - returns available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const loadedTools = await loadTools();
  return {
    tools: [
      loadedTools.ragSearch.definition,
      loadedTools.listSources.definition,
      loadedTools.readSource.definition
    ]
  };
});

/**
 * Handler for CallTool request - executes tool with given arguments
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[MCP Server] Handling tool call: ${name}`);

  const loadedTools = await loadTools();

  switch (name) {
    case 'rag_search':
      return loadedTools.ragSearch.handler(args);
    case 'list_knowledge_sources':
      return loadedTools.listSources.handler(args);
    case 'read_source':
      return loadedTools.readSource.handler(args);
    default:
      return {
        content: [
          {
            type: 'text',
            text: `Error: Unknown tool: ${name}`
          }
        ],
        isError: true
      };
  }
});

/**
 * Main entry point - start the server
 */
async function main() {
  // Restore stdout now that all imports are complete
  // This allows MCP protocol messages to be sent properly to Claude Desktop
  process.stdout.write = originalWrite;
  if (suppressedOutput) {
    console.error(`[startup] Suppressed ${suppressedOutput.length} bytes of stdout output during imports`);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] MCP Server running on stdio`);
}

// Start server
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
