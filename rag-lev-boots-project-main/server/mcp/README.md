# Lev-Boots MCP Server

Model Context Protocol (MCP) server for the Lev-Boots RAG system.

## Quick Links

- 📖 **Full Documentation:** See [claude.md](./claude.md)
- 🚀 **Start Server:** `npm run mcp`
- 🧪 **Test Tools:** `npx @modelcontextprotocol/inspector node --loader tsx server/mcp/server.ts`
- 🌐 **Web Client:** Open [client.html](./client.html) in your browser

## Overview

This MCP server exposes the Lev-Boots RAG system through three tools:

1. **rag_search** - Query the knowledge base about Lev-Boots technology
2. **list_knowledge_sources** - Discover available PDFs and articles
3. **read_source** - Read full content of any source

## Installation

Dependencies are already installed. If needed:

```bash
cd server
npm install @modelcontextprotocol/sdk zod
```

## Configuration

Before running the server, configure your environment:

### 1. Copy the Example .env File

```bash
cp server/mcp/.env.example server/mcp/.env
```

### 2. Edit with Your Credentials

Add your API keys to `server/mcp/.env`:

```bash
Gemini_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
DATABASE_URL=postgresql://username:password@host:port/database
PERPLEXITY_MODEL=sonar
```

### 3. Or Use Web UI

Open `server/mcp/client.html` in your browser to configure via the UI.

## Running the Server

```bash
cd server
npm run mcp
```

The server requires a `.env` file in the `server/mcp/` directory or environment variables set.

## Testing

### Option 1: MCP Inspector (Recommended)

```bash
npx @modelcontextprotocol/inspector node --loader tsx server/mcp/server.ts
```

Opens an interactive web UI for testing tools.

### Option 2: Web Client

Open `server/mcp/client.html` in your browser for a simple test interface.

### Option 3: Claude Desktop

Configure in your Claude Desktop settings to use the server.

## File Structure

```
mcp/
├── server.ts                    # Main server
├── types.ts                     # TypeScript definitions
├── schemas.ts                   # Input validation
├── client.html                  # Test UI
├── claude.md                    # Full documentation
├── README.md                    # This file
├── utils/
│   └── errorHandler.ts         # Error handling
└── tools/
    ├── ragSearch.ts            # RAG search tool
    ├── listKnowledgeSources.ts # List sources tool
    └── readSource.ts           # Read source tool
```

## Documentation

For complete documentation, see [claude.md](./claude.md).

### Quick Tool Reference

**rag_search:**
- Input: `{ "question": "Your question here" }`
- Returns: Answer with sources

**list_knowledge_sources:**
- Input: `{}` (no input)
- Returns: List of available PDFs and articles

**read_source:**
- Input: `{ "sourceName": "source-name", "sourceType": "pdf|article" }`
- Returns: Full content of the source

## Configuration

The server uses environment variables from `server/.env`:
- `Gemini_API_KEY` - Google Gemini API
- `PERPLEXITY_API_KEY` - Perplexity API
- `DATABASE_URL` - PostgreSQL connection

## Adding to Claude Desktop

Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "lev-boots-rag": {
      "command": "npx",
      "args": ["tsx", "path/to/server/mcp/server.ts"]
    }
  }
}
```

## Development

- All files are <250 lines (per requirement)
- Uses ES Modules (import with `.js` extension)
- Input validation with Zod schemas
- Error logging to stderr
- Type-safe TypeScript

## Support

See [claude.md](./claude.md) for troubleshooting and full documentation.
