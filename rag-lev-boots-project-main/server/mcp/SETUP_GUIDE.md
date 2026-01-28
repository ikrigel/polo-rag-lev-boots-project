# Lev-Boots MCP Server - Setup Guide for Users

This guide will help you set up and use the Lev-Boots MCP Server on your system.

## Prerequisites

- Node.js v18+ (v20+ recommended)
- npm or yarn
- Three API keys/credentials:
  - **Google Gemini API Key** - For embeddings
  - **Perplexity API Key** - For LLM responses
  - **PostgreSQL Database URL** - For the knowledge base

## Step 1: Get Your API Keys

### 1.1 Google Gemini API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google AI for Developers" API
4. Create an API key in the Credentials section
5. Copy your API key

### 1.2 Perplexity API Key

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up or log in to your account
3. Go to your API settings
4. Generate or copy your API key
5. Save your API key

### 1.3 PostgreSQL Database

You need a PostgreSQL database. Options:

- **Supabase (Recommended)** - Free tier available
  - Go to [Supabase](https://supabase.com)
  - Create a new project
  - Get your connection string from Project Settings > Database

- **Local PostgreSQL**
  - Install PostgreSQL locally
  - Create a database
  - Connection string: `postgresql://username:password@localhost:5432/database_name`

- **Other Providers**
  - AWS RDS
  - DigitalOcean
  - Cloud SQL (Google Cloud)
  - Any PostgreSQL-compatible database

## Step 2: Configure Environment Variables

### Option A: Using the Web UI (Easiest)

1. Navigate to the `server/mcp/` folder
2. Open `client.html` in your web browser
3. Fill in the configuration fields:
   - Gemini API Key
   - Perplexity API Key
   - Database URL
   - Perplexity Model (default: `sonar`)
4. Click **"Save Configuration"**
5. Click **"Export as .env"** to download the `.env` file
6. Save the downloaded `.env` file to `server/mcp/.env`

### Option B: Manual Configuration

1. Navigate to `server/mcp/`
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your credentials:
   ```bash
   Gemini_API_KEY=your_gemini_key_here
   PERPLEXITY_API_KEY=your_perplexity_key_here
   DATABASE_URL=postgresql://username:password@host:port/database
   PERPLEXITY_MODEL=sonar
   ```

4. Save the file

### Option C: Environment Variables

Set environment variables in your shell:

```bash
export Gemini_API_KEY=your_gemini_key_here
export PERPLEXITY_API_KEY=your_perplexity_key_here
export DATABASE_URL=postgresql://username:password@host:port/database
export PERPLEXITY_MODEL=sonar
```

## Step 3: Test the Server

### Start the Server

```bash
cd server
npm run mcp
```

You should see:
```
[lev-boots-rag-server] MCP Server running on stdio
```

### Test with MCP Inspector

In another terminal:

```bash
npx @modelcontextprotocol/inspector node --import tsx/esm server/mcp/server.ts
```

This opens a web interface where you can:
- List all available tools
- Test each tool with different inputs
- View responses in real-time

### Test the Three Tools

**Tool 1: list_knowledge_sources**
- Input: `{}` (empty)
- Expected: List of 3 PDFs and 5 articles

**Tool 2: rag_search**
- Input: `{ "question": "How do levboots work?" }`
- Expected: Detailed answer with sources

**Tool 3: read_source**
- Input: `{ "sourceName": "military-deployment-report" }`
- Expected: Full article content

## Step 4: Configure for Claude Desktop

### 4.1 Find Your Config File

**macOS:**
```
~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 4.2 Add the MCP Server

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lev-boots-rag": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/rag-lev-boots-project/server"
    }
  }
}
```

**Replace `/path/to/` with the actual path to your project.**

### 4.3 Restart Claude

Restart Claude Desktop for the changes to take effect.

### 4.4 Use the Tools in Claude

Now you can ask Claude questions like:

- "How do levboots work?"
- "What knowledge sources are available?"
- "Summarize the military deployment article"
- "Tell me about the gravitational reversal physics"

Claude will automatically use the MCP tools to answer your questions!

## Troubleshooting

### "DATABASE_URL environment variable is required"

**Solution:** Make sure you have a `.env` file in `server/mcp/` with the `DATABASE_URL` variable set.

### Server won't start

**Check:**
1. Node.js version: `node --version` (should be v18+)
2. Dependencies installed: `cd server && npm install`
3. Environment variables set: `echo $Gemini_API_KEY`

### API Key errors

**Solution:** Verify your API keys:
- Check for typos
- Make sure keys are active (not revoked)
- Check API quota limits
- Verify correct API key format

### Database connection errors

**Solution:**
1. Test your connection string locally
2. Check database server is running
3. Verify credentials are correct
4. Check firewall/security rules allow connection
5. Try with a different database if available

### Claude doesn't show the tools

**Solution:**
1. Check the config file path is correct
2. Verify the `cwd` path exists and points to the server directory
3. Restart Claude Desktop after changing config
4. Check terminal for error messages when Claude loads

## File Structure

```
server/mcp/
├── .env                   # Your configuration (DO NOT commit)
├── .env.example          # Template for configuration
├── server.ts             # Main MCP server
├── types.ts              # Type definitions
├── schemas.ts            # Input validation
├── client.html           # Web UI for configuration
├── README.md             # Quick reference
├── claude.md             # Full documentation
├── SETUP_GUIDE.md        # This file
├── utils/
│   └── errorHandler.ts   # Error handling
└── tools/
    ├── ragSearch.ts      # RAG search tool
    ├── listKnowledgeSources.ts  # List sources
    └── readSource.ts     # Read source content
```

## Next Steps

1. ✅ Get your API keys
2. ✅ Configure `.env` file
3. ✅ Test with MCP Inspector
4. ✅ Configure Claude Desktop
5. ✅ Start using the tools in Claude!

## Support

For issues:
1. Check the Troubleshooting section above
2. Review the full documentation in `claude.md`
3. Check error messages in the terminal
4. Verify all environment variables are set correctly

## Security Notes

- Never commit the `.env` file to version control
- Keep your API keys confidential
- Use strong, unique passwords for database access
- Rotate API keys periodically
- The `client.html` stores configuration in local browser storage (not secure for production)

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Google Gemini API](https://ai.google.dev/)
- [Perplexity API](https://www.perplexity.ai/api)
- [Supabase PostgreSQL](https://supabase.com/)

---

Happy using the Lev-Boots MCP Server! 🚀
