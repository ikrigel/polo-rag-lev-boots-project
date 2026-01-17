# Getting Started with LevBoots RAG System

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites
- Node.js v16+ installed
- PostgreSQL database with pgvector extension (or [Supabase](https://supabase.com) account)
- API Keys:
  - Google Gemini (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))
  - Perplexity (free tier at [perplexity.ai/api-platform](https://www.perplexity.ai/api-platform))

### 2. Clone & Setup
```bash
# Clone repository
git clone https://github.com/ikrigel/polo-rag-lev-boots-project.git
cd polo-rag-lev-boots-project

# Install dependencies
npm install
cd server && npm install
cd ../public && npm install
cd ..
```

### 3. Configure Environment
```bash
# Create .env file in server directory
cp server/.env.example server/.env

# Edit server/.env and add your credentials:
# PERPLEXITY_API_KEY=your_key_here
# Gemini_API_KEY=your_key_here
# PERPLEXITY_MODEL=sonar
# DATABASE_URL=your_postgres_connection_string
```

### 4. Run the Application
```bash
# Terminal 1: Start backend (port 3030)
cd server
npm start

# Terminal 2: Start frontend dev server (port 5173)
cd public
npm run dev

# Open browser: http://localhost:5173
```

### 5. Load Knowledge Base
1. Click **"Load Knowledge Base"** button
2. Wait for it to complete (loads PDFs, articles, and Slack messages)
3. Once complete, you can start asking questions!

---

## 🎯 First Question

Try asking: **"How do levboots work?"**

Expected output:
- ✅ Answer explaining the Aetheric Field Generator, Stabilized Coil Array, etc.
- ✅ Bibliography section with 4 sources listed below

---

## 📋 Configuration Guide

### Environment Variables (`server/.env`)

#### Required
```env
# Gemini API for embeddings
Gemini_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Perplexity API for answer generation
PERPLEXITY_API_KEY=pplx-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Perplexity model (use current: sonar)
PERPLEXITY_MODEL=sonar

# PostgreSQL connection with pgvector
DATABASE_URL=postgresql://user:password@localhost:5432/levboots_db
```

#### Supabase Setup (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://postgres.XXXXX:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

---

## 🗄️ Database Setup

### Automatic Migration
The system automatically:
1. Creates `knowledge_base` table
2. Enables pgvector extension
3. Creates necessary indexes

No manual database setup required!

### Manual Verification (Optional)
```bash
# Connect to your database and verify:
psql $DATABASE_URL

# Check tables
\dt

# Check pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

# Check knowledge_base structure
\d knowledge_base
```

---

## 🚀 Project Structure

### Key Directories
```
server/                          # Backend RAG pipeline
├── BusinessLogic/AskAI.ts       # Core RAG implementation
├── services/                    # Data loading & embeddings
├── models/KnowledgeBase.ts      # Database model
└── server.ts                    # Express app

public/                          # React frontend
├── src/components/Home.tsx      # Main UI component
└── vite.config.ts              # Build config & proxy

logs/                            # Application logs
└── server.log                   # Consolidated logs
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture.

---

## 🔄 Data Flow

### Loading Knowledge Base
```
Click "Load Knowledge Base"
    ↓
Fetch from 3 sources:
  - 3 PDFs (local)
  - 5 Articles (HTTP)
  - Slack messages (paginated API)
    ↓
Chunk content (~400 words per chunk)
    ↓
Generate embeddings (Gemini API) → 768-dim vectors
    ↓
Store to PostgreSQL knowledge_base table
    ↓
Ready to answer questions!
```

### Asking a Question
```
User types question & presses Enter
    ↓
Embed question (Gemini) → 768-dim vector
    ↓
Find top 5 similar chunks (cosine similarity)
    ↓
Build system prompt with retrieved context
    ↓
Call Perplexity API (sonar model)
    ↓
Display answer + bibliography
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load data"
**Cause**: Database connection failed

**Solution**:
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Issue: "No relevant information found"
**Cause**: Similarity threshold too high or wrong embedding dimension

**Solution**:
- Check knowledge_base table has data:
  ```bash
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM knowledge_base;"
  ```
- Verify embeddings_768 column has values

### Issue: "Invalid model 'sonar'" (400 error)
**Cause**: Old Perplexity model name in code

**Solution**: Code already fixed to use `sonar` (current model)

### Issue: Gemini API rate limit
**Cause**: Too many embedding requests

**Solution**:
- System has 1-second delay between requests
- Retry logic with exponential backoff
- First run takes longer (~10-20 minutes to embed all content)

### Issue: Frontend shows no answer
**Cause**: Response not being set in state

**Solution**:
- Check browser console for errors
- Verify backend is running on port 3030
- Check network tab in browser DevTools

---

## 📊 Performance Notes

### Embedding Generation
- **First load**: 10-20 minutes (depends on API rate limits)
- **Subsequent loads**: Skipped (checks for existing data)
- **Per chunk**: ~0.3-0.5 seconds (Gemini API)

### Query Response
- **Embedding query**: 1-2 seconds
- **Similarity search**: <100ms
- **LLM generation**: 5-10 seconds (Perplexity API)
- **Total**: ~6-12 seconds per question

### Database Size
- **Total chunks**: ~33
- **Total characters**: ~100KB
- **Embeddings size**: ~26MB (33 chunks × 768 dims × 8 bytes)

---

## 🔐 Security

### Sensitive Data Protection
- ✅ API keys stored in `.env` (not in git)
- ✅ `.env.example` shows template without values
- ✅ `.gitignore` excludes `.env` files
- ✅ Database credentials in connection string

### Best Practices
1. Never commit `.env` file
2. Use strong database passwords
3. Rotate API keys regularly
4. Use environment-specific configs

---

## 🧪 Testing

### Manual Test: Question & Answer
```bash
# Test via curl:
curl -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

# Expected: JSON with answer, sources, bibliography
```

### Manual Test: Load Data
```bash
# Test via curl:
curl -X POST http://localhost:3030/api/load_data \
  -H "Content-Type: application/json"

# Expected: { "ok": true, "message": "..." }
```

---

## 📚 API Reference

### POST `/api/ask`
Ask a question and get RAG answer

**Request:**
```json
{
  "userQuestion": "How do levboots work?"
}
```

**Response (Success - 200):**
```json
{
  "answer": "LevBoots work by using an Aetheric Field Generator...",
  "sources": ["pdf1.pdf", "article1.md"],
  "bibliography": ["pdf1.pdf", "article1.md"]
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Error message",
  "answer": "",
  "sources": [],
  "bibliography": []
}
```

### POST `/api/load_data`
Load and embed all knowledge sources

**Request:** (empty body)

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Data loaded successfully",
  "success": true
}
```

**Response (Error - 400/500):**
```json
{
  "ok": false,
  "error": "Error message"
}
```

---

## 🛠️ Development

### TypeScript Compilation
```bash
# Compile TypeScript to JavaScript
cd server
npm run build

# Output in dist/ directory
```

### Running in Production
```bash
# Build frontend
cd public && npm run build

# Start server (serves built frontend)
cd ../server && npm start

# Visit http://localhost:3030
```

### Logging
All logs are written to `logs/server.log`:
- ℹ️ INFO: Important operations
- 🔍 DEBUG: Detailed debugging
- ⚠️ WARN: Warnings
- ❌ ERROR: Errors
- ✓ SUCCESS: Operations completed

View logs:
```bash
tail -f logs/server.log
```

---

## 📖 Additional Resources

- **Project Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Original Spec**: [README.md](./README.md)
- **Challenges**: [EXTRA_CHALLENGES.md](./EXTRA_CHALLENGES.md)
- **How to Use**: [HOW_TO_USE.md](./HOW_TO_USE.md)

---

## 🚪 Next Steps

1. ✅ Complete quick start setup
2. ✅ Load knowledge base
3. ✅ Ask test questions
4. 📖 Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for deep dive
5. 🔧 Explore code in `server/BusinessLogic/AskAI.ts`
6. 🎯 Try [EXTRA_CHALLENGES.md](./EXTRA_CHALLENGES.md) features

---

## 💬 Support

### Common Questions

**Q: How long does it take to load the knowledge base?**
A: First load: 10-20 minutes. Subsequent loads: instant (skipped if data exists).

**Q: Which LLM model is used?**
A: Perplexity `sonar` (replaces deprecated `llama-3.1-sonar-*` models).

**Q: Can I use a different embedding model?**
A: Yes, modify `EMBEDDING_DIMENSION` in `server/services/embeddings.ts`.

**Q: Is the database required?**
A: Yes, PostgreSQL with pgvector is required for vector similarity search.

**Q: Can I run this locally without Supabase?**
A: Yes, install local PostgreSQL with pgvector extension.

---

## 🎉 You're Ready!

Your RAG system is now configured. Start with the quick start section above and you'll be up and running in minutes!
