# Lev-Boots MCP Server

## Overview

This directory contains the Model Context Protocol (MCP) server implementation for the Lev-Boots RAG (Retrieval Augmented Generation) system. The MCP server exposes three tools that allow Claude and other MCP clients to query and interact with the Lev-Boots knowledge base.

## Quick Start

### Start the MCP Server

```bash
cd server
npm run mcp
```

The server will start and listen on stdio (standard input/output), which is how MCP clients communicate with servers.

### Test with MCP Inspector

Use the official MCP Inspector to test the server interactively:

```bash
npx @modelcontextprotocol/inspector node --import tsx/esm server/mcp/server.ts
```

This opens a web interface where you can:
- See all available tools
- Test each tool with different inputs
- View responses in real-time
- Debug issues

## Configuration

### Environment Variables

The MCP server requires three environment variables to function:

1. **Gemini_API_KEY** - Google Gemini API key for embeddings
   - Get from: https://console.cloud.google.com/apis/credentials

2. **PERPLEXITY_API_KEY** - Perplexity API key for LLM responses
   - Get from: https://www.perplexity.ai/

3. **DATABASE_URL** - PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`
   - Example with Supabase: `postgresql://postgres.xyz:password@aws-1-region.pooler.supabase.com:6543/postgres`

4. **PERPLEXITY_MODEL** - (Optional) Model name, defaults to `sonar`

### Setting Up Configuration

**Option 1: Using .env File (Recommended)**

Create a `.env` file in the `server/mcp/` directory:

```bash
cp server/mcp/.env.example server/mcp/.env
# Edit server/mcp/.env with your actual credentials
```

**Option 2: Using Environment Variables**

Set environment variables before starting the server:

```bash
export Gemini_API_KEY=your_key_here
export PERPLEXITY_API_KEY=your_key_here
export DATABASE_URL=postgresql://...
npm run mcp
```

**Option 3: Using the Web UI Configuration**

Open `server/mcp/client.html` in your browser and use the configuration panel to:
- Enter your API keys and database URL
- Save to browser local storage
- Export as a `.env` file

## Tools

### 1. `rag_search`

**Purpose:** Query the Lev-Boots knowledge base about gravitational reversal technology.

**Input:**
- `question` (string, required): Your question about Lev-Boots (1-1000 characters)

**Output:**
- Detailed answer from the RAG system
- List of source documents used
- Bibliography references

**Example:**
```json
{
  "question": "How do levboots work?"
}
```

**Response:**
```
The Lev-Boots technology harnesses gravitational reversal principles...

**Sources Used:**
1. Research Paper - Gravitational Reversal Physics.pdf
2. White Paper - The Development of Localized Gravity Reversal Technology.pdf

**Bibliography:**
1. [citation info...]
```

---

### 2. `list_knowledge_sources`

**Purpose:** Discover all available PDFs and articles in the knowledge base.

**Input:**
- None (empty object `{}`)

**Output:**
- List of available PDFs with filenames
- List of available articles with IDs

**Example Input:**
```json
{}
```

**Response:**
```
# Available Knowledge Sources

## PDFs (3)
1. OpEd - A Revolution at Our Feet.pdf
2. Research Paper - Gravitational Reversal Physics.pdf
3. White Paper - The Development of Localized Gravity Reversal Technology.pdf

## Articles (5)
1. military-deployment-report
2. urban-commuting
3. hover-polo
4. warehousing
5. consumer-safety
```

---

### 3. `read_source`

**Purpose:** Read the full text content of any PDF or article.

**Input:**
- `sourceName` (string, required): PDF filename or article ID
- `sourceType` (optional): `"pdf"` or `"article"` - auto-detected if omitted

**Output:**
- Full text content of the source (can be very long)

**Example - Reading a PDF:**
```json
{
  "sourceName": "Research Paper - Gravitational Reversal Physics.pdf",
  "sourceType": "pdf"
}
```

**Example - Reading an Article (auto-detect):**
```json
{
  "sourceName": "military-deployment-report"
}
```

**Response:**
```
# research-paper-file.pdf

[Full PDF text content...]
```

---

## Architecture

### Directory Structure

```
server/mcp/
├── server.ts                    # Main MCP server entry point
├── types.ts                     # TypeScript type definitions
├── schemas.ts                   # Zod validation schemas
├── client.html                  # Simple test client
├── claude.md                    # This file
├── utils/
│   └── errorHandler.ts         # Error handling utilities
└── tools/
    ├── ragSearch.ts            # RAG search tool implementation
    ├── listKnowledgeSources.ts # List sources tool implementation
    └── readSource.ts           # Read source tool implementation
```

### File Descriptions

- **server.ts** (~120 lines)
  - Main MCP server using @modelcontextprotocol/sdk
  - Handles ListTools and CallTool requests
  - Routes tool calls to appropriate handlers
  - Uses stdio transport for communication

- **types.ts** (~50 lines)
  - TypeScript interfaces for MCP tools
  - Shared type definitions
  - Response format types

- **schemas.ts** (~80 lines)
  - Zod validation schemas for each tool's input
  - Automatic JSON Schema generation for MCP
  - Input validation and error handling

- **tools/ragSearch.ts** (~120 lines)
  - Implements the `rag_search` tool
  - Integrates with existing ragService.ask()
  - Formats RAG responses with sources

- **tools/listKnowledgeSources.ts** (~80 lines)
  - Implements the `list_knowledge_sources` tool
  - Reads PDFs from server/knowledge_pdfs/
  - References article IDs from articleLoader.ts

- **tools/readSource.ts** (~200 lines)
  - Implements the `read_source` tool
  - Reads PDFs using pdfjs-dist
  - Fetches articles from GitHub Gist URLs
  - Auto-detects source type

- **utils/errorHandler.ts** (~40 lines)
  - Centralized error handling
  - Consistent error response formatting
  - Input validation utilities

---

## Configuration

### Environment Variables

The MCP server uses the same environment variables as the main Express server (from `server/.env`):

- `Gemini_API_KEY` - Google Gemini API key for embeddings
- `PERPLEXITY_API_KEY` - Perplexity API key for LLM responses
- `DATABASE_URL` - PostgreSQL connection string

These are automatically loaded via `dotenv` config in server.ts.

### Dependencies

The MCP server requires:

```bash
npm install @modelcontextprotocol/sdk zod
```

These are already installed in the server workspace.

---

## Usage in Claude Desktop

### Configuration File

On macOS:
```
~/Library/Application\ Support/Claude/claude_desktop_config.json
```

On Windows:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Configuration Example

```json
{
  "mcpServers": {
    "lev-boots-rag": {
      "command": "npx",
      "args": [
        "tsx",
        "c:\\path\\to\\rag-lev-boots-project\\server\\mcp\\server.ts"
      ]
    }
  }
}
```

### Testing in Claude

Once configured in Claude Desktop, you can:

1. Ask Claude: "What knowledge sources are available?"
   - Claude will call `list_knowledge_sources` to discover sources

2. Ask Claude: "How do levboots work?"
   - Claude will call `rag_search` to query the knowledge base

3. Ask Claude: "Summarize the article about military deployment"
   - Claude will call `list_knowledge_sources`, then `read_source`, then summarize

---

## Testing

### Using MCP Inspector

The official MCP Inspector is the best way to test tools:

```bash
npx @modelcontextprotocol/inspector node --loader tsx server/mcp/server.ts
```

**Test Cases:**

1. **list_knowledge_sources:**
   - Input: `{}` (empty)
   - Expected: 3 PDFs and 5 articles

2. **rag_search:**
   - Input: `{ "question": "How do levboots work?" }`
   - Expected: Detailed answer with sources

3. **read_source:**
   - Input: `{ "sourceName": "military-deployment-report" }`
   - Expected: Full article content

### Using the Test Client

Open `server/mcp/client.html` in your browser for a simple UI to understand how the tools work.

---

## Development

### Adding New Tools

To add a new tool to the MCP server:

1. **Create tool file** in `server/mcp/tools/newTool.ts`
2. **Define schema** in `server/mcp/schemas.ts`
3. **Import tool** in `server/mcp/server.ts`
4. **Add to ListTools handler** in server.ts
5. **Add to CallTool switch** in server.ts

### Code Quality Standards

- All imports must include `.js` extension (ES modules)
- Each file should not exceed 250 lines
- Use Zod schemas for all input validation
- Log errors to stderr (not stdout)
- Type all function parameters and returns

---

## Troubleshooting

### Server won't start

Check that dependencies are installed:
```bash
cd server
npm install @modelcontextprotocol/sdk zod
```

### Tools not appearing in MCP Inspector

1. Verify the server started successfully (look for "MCP Server running on stdio" message)
2. Check that all tool definitions are exported from their respective files
3. Verify server.ts imports all tools

### "Cannot find module" errors

Ensure all imports include the `.js` extension:
```typescript
// ✓ Correct
import { ask } from '../../services/ragService.js';

// ✗ Wrong
import { ask } from '../../services/ragService';
```

### PDFs not being read

Check that `server/knowledge_pdfs/` contains the PDF files and the paths are correct.

### Articles not loading

Verify network connectivity to GitHub Gist. Articles are fetched from:
```
https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw/
```

---

## Security Considerations

- **Input Validation:** All tool inputs are validated with Zod schemas before processing
- **File System Access:** Limited to `server/knowledge_pdfs/` directory only
- **Path Traversal:** Filenames validated to prevent directory traversal attacks
- **API Keys:** Never logged or exposed in error messages
- **Error Messages:** Designed to provide helpful info without exposing internals

---

## References

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP GitHub](https://github.com/anthropics/model-context-protocol)
- [Zod Documentation](https://zod.dev/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Run `npm run mcp` to verify the server starts
3. Use MCP Inspector to debug tool calls
4. Review the individual tool files for implementation details
