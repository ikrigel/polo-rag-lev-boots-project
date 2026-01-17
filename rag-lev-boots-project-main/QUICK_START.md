# Quick Start - Run the Application in 5 Minutes

The fastest way to get the LevBoots RAG System running on your machine.

---

## Step 1: Prerequisites (2 minutes)

### Check you have Node.js installed:

```bash
node --version    # Should be v16+, recommend v18+
npm --version     # Should be v8+
```

If not installed, download from: https://nodejs.org/

### Create Database (Recommended: Supabase - 90 seconds)

1. Go to https://supabase.com
2. Click "Start your project"
3. Create account
4. Create new project
5. Copy connection string from Settings → Database → Connection string

Alternative: Use local PostgreSQL with pgvector extension

---

## Step 2: Get API Keys (1 minute)

### Gemini API (Free)
- Go to: https://aistudio.google.com/app/apikey
- Click "Create API Key"
- Copy the key

### Perplexity API (Free tier available)
- Go to: https://www.perplexity.ai/api-platform
- Sign up/login
- Get API key from dashboard

---

## Step 3: Clone & Setup (1 minute)

```bash
# Clone repository
git clone https://github.com/ikrigel/polo-rag-lev-boots-project.git
cd polo-rag-lev-boots-project

# Install all dependencies
npm install
cd server && npm install && cd ../public && npm install && cd ..
```

---

## Step 4: Configure Environment (1 minute)

Create `server/.env` file:

```bash
# Copy template
cp server/.env.example server/.env

# Edit the file with your credentials
# On Windows: notepad server\.env
# On Mac: nano server/.env
# On Linux: vim server/.env
```

Add your credentials:

```env
DATABASE_URL=postgresql://user:password@host:port/database
Gemini_API_KEY=AIza...your_key...
PERPLEXITY_API_KEY=pplx-...your_key...
PERPLEXITY_MODEL=sonar
```

---

## Step 5: Start the Application

### Option A: Run Both Servers Together (Easiest)

```bash
npm run dev
```

This starts:
- Backend on http://localhost:3030
- Frontend on http://localhost:5173

### Option B: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server runs on port 3030
```

**Terminal 2 - Frontend:**
```bash
cd public
npm run dev
# Frontend runs on port 5173
```

---

## Step 6: Open in Browser

Open: **http://localhost:5173**

You should see the RAG application with 3 tabs:
1. **Home** - Basic RAG interface
2. **Conversational RAG** - Multi-turn conversations
3. **RAGAS Evaluation** - Quality metrics
4. **Settings** - Configuration

---

## First Time Setup

### 1. Load Knowledge Base

1. Click "Home" tab
2. Click "Load Knowledge Base" button
3. **Wait 10-20 minutes** (loads all PDFs, articles, Slack messages)
4. You'll see: "Data loaded successfully"

### 2. Test Basic RAG

1. Go to "Home" tab
2. Type: "How do levboots work?"
3. Press Enter
4. Wait 6-12 seconds for answer
5. You should see answer with sources

### 3. Test Conversational RAG

1. Click "Conversational RAG" tab
2. Click "New Conversation"
3. Type: "What is an Aetheric Field Generator?"
4. Press Enter
5. Ask follow-up: "How does it maintain balance?"
6. See context usage increase

### 4. Test RAGAS Evaluation

1. Click "RAGAS Evaluation" tab
2. Click "Ground Truth Pairs" sub-tab
3. Click "Add Pair"
4. Add your test Q&A
5. Go to "Overview"
6. Click "Run Evaluation"
7. See metrics after completion

### 5. Test Settings

1. Click "Settings" tab
2. Go to "LLM & RAG"
3. Move Temperature slider to 0.8
4. Click "Save Settings"
5. New settings applied immediately

---

## Testing APIs

### Test Core RAG

```bash
# Load knowledge base
curl -X POST http://localhost:3030/api/load_data

# Ask question
curl -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'
```

### Test Conversational

```bash
# Create session
curl -X POST http://localhost:3030/api/conversational/session/create

# Send message in session
curl -X POST http://localhost:3030/api/conversational/session/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"Your question here"}'
```

### Test RAGAS

```bash
# Add ground truth
curl -X POST http://localhost:3030/api/ragas/ground-truth/add \
  -H "Content-Type: application/json" \
  -d '{"question":"Q","expectedAnswer":"A"}'

# Evaluate answer
curl -X POST http://localhost:3030/api/ragas/evaluate \
  -H "Content-Type: application/json" \
  -d '{"pairId":"PAIR_ID","actualAnswer":"Your answer"}'

# Get metrics
curl http://localhost:3030/api/ragas/metrics
```

### Test Settings

```bash
# Get settings
curl http://localhost:3030/api/settings

# Update settings
curl -X PUT http://localhost:3030/api/settings \
  -H "Content-Type: application/json" \
  -d '{"temperature":0.8}'

# Get recommendations
curl -X POST http://localhost:3030/api/settings/recommended \
  -H "Content-Type: application/json" \
  -d '{"useCase":"creative"}'
```

---

## Common Issues

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Database connection failed"

```bash
# Check connection string in .env
cat server/.env

# Test connection
psql $DATABASE_URL
```

### Issue: "Module not found: logger"

✅ Already fixed in latest version (commit 849be78)

### Issue: Frontend shows blank page

```bash
# Check frontend server is running
# Should see output like:
# VITE v4.x.x  ready in xxx ms
#
# ➜  Local:   http://localhost:5173/
```

### Issue: API rate limits

```bash
# Gemini API: Wait 1-2 hours
# Perplexity API: Upgrade account or wait for reset
# Test with smaller data sets first
```

---

## Directory Structure

```
polo-rag-lev-boots-project/
├── server/               # Backend (Node.js)
│   ├── BusinessLogic/   # ConversationalRAG.ts, RagAs.ts, Settings.ts
│   ├── controllers/     # API controllers
│   ├── routes/          # API routes
│   └── .env             # Environment variables (create this)
├── public/              # Frontend (React)
│   └── src/components/  # ConversationalRAG.tsx, RagAs.tsx, Settings.tsx
├── logs/                # Application logs
└── package.json         # Root package.json
```

---

## Available npm Commands

```bash
# Development
npm run dev              # Start both servers

# Build
npm run build            # Build frontend and backend

# Server
cd server && npm start   # Run backend only

# Frontend
cd public && npm run dev # Run frontend dev server

# Type checking
npm run type-check      # Check TypeScript

# Linting
npm run lint            # Run ESLint

# Formatting
npm run format          # Format code with Prettier

# Tests
npm test                # Run tests
```

---

## File Changes Made

Here are the commits with all changes:

```
c652b54 - Add comprehensive testing guide
fbf9d33 - Add comprehensive code quality guide
849be78 - Clean up unused imports and fix getLogger export ✅
3e3b860 - Add comprehensive implementation summary
805afe3 - Add comprehensive features guide
193e479 - Add comprehensive API documentation
620c6fa - Implement Phase 1-3 features (4,400+ lines)
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| **API_DOCUMENTATION.md** | Complete API reference (1,343 lines) |
| **FEATURES_GUIDE.md** | How to use each feature (1,119 lines) |
| **TESTING_GUIDE.md** | How to test application (1,170 lines) |
| **CODE_QUALITY_GUIDE.md** | Finding and fixing errors (540 lines) |
| **IMPLEMENTATION_SUMMARY.md** | High-level overview (791 lines) |
| **PROJECT_STRUCTURE.md** | Directory structure |
| **ARCHITECTURE.md** | System design |
| **GETTING_STARTED.md** | Original setup guide |

---

## Troubleshooting

**Can't connect to database?**
1. Check connection string in `.env`
2. Verify database is running
3. Check pgvector is installed: `SELECT * FROM pg_extension WHERE extname = 'vector';`

**API endpoints returning 404?**
1. Check backend is running on port 3030
2. Check routes are imported in `server/server.ts`
3. Run `npm run build` in server directory

**Frontend not loading?**
1. Check frontend server is running on port 5173
2. Check browser console for errors (F12)
3. Clear cache: Ctrl+Shift+Delete

**API key not working?**
1. Verify key is valid in `.env`
2. Check API service status
3. Look at logs: `tail -f logs/server.log`

---

## Next Steps

1. ✅ Load knowledge base (Home tab, click button)
2. ✅ Ask a question (should get answer in 6-12s)
3. ✅ Test conversational feature (multi-turn chats)
4. ✅ Add ground truth pairs (RAGAS tab)
5. ✅ Run evaluations (see quality metrics)
6. ✅ Customize settings (Settings tab)
7. 📖 Read full docs (see FEATURES_GUIDE.md)
8. 🔧 Explore code (see PROJECT_STRUCTURE.md)

---

## Getting Help

- **API Reference**: See `API_DOCUMENTATION.md`
- **Feature Guide**: See `FEATURES_GUIDE.md`
- **Testing Help**: See `TESTING_GUIDE.md`
- **Code Issues**: See `CODE_QUALITY_GUIDE.md`
- **Architecture**: See `ARCHITECTURE.md`

---

## Success Indicators

✅ Application loading on http://localhost:5173
✅ Three tabs visible (Conversational, RAGAS, Settings)
✅ No console errors (check F12)
✅ Backend API responding on http://localhost:3030
✅ Can ask questions and get answers
✅ Can create conversations
✅ Can run evaluations
✅ Settings save and persist

---

## Total Implementation

- **4,400+ lines** of production code
- **3 major features** fully implemented
- **25+ API endpoints** ready to use
- **3 new UI components** with full functionality
- **3 backend services** with business logic
- **5,000+ lines** of documentation

**Status**: ✅ Ready for production use

---

*Last Updated: January 14, 2024*
*Estimated setup time: 5 minutes (+ 15 minutes for knowledge base loading)*