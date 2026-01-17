# How to Use the Lev-Boots RAG Application

A comprehensive guide to running and using the Lev-Boots Retrieval-Augmented Generation (RAG) system.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Starting the Application](#starting-the-application)
4. [Using the Web Interface](#using-the-web-interface)
5. [Using the API](#using-the-api)
6. [Troubleshooting](#troubleshooting)
7. [Architecture Overview](#architecture-overview)

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** with pgvector extension (local or cloud like Supabase)
- **API Keys:**
  - Google Gemini API key (for embeddings)
  - Perplexity API key (for answer generation)

### Get API Keys

**Google Gemini API:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and save it

**Perplexity API:**
1. Sign up at https://www.perplexity.ai/
2. Go to API settings
3. Create an API key

**PostgreSQL Database:**
- Local: Install PostgreSQL locally with pgvector extension
- Cloud: Use Supabase (free tier) - https://supabase.com/
  - Create a new project
  - Get the connection string
  - pgvector is enabled by default

---

## Setup

### 1. Clone/Navigate to Project

```bash
cd C:\rag-lev-boots-project\rag-lev-boots-project-main
```

### 2. Install Dependencies

```bash
npm install
npm install -w server
npm install -w public
```

### 3. Configure Environment Variables

Create `.env` file in the `/server` directory:

```bash
# Database Connection (from Supabase or local PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# API Keys for LLMs
Gemini_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_MODEL=llama-3.1-sonar-small-128k-online

# Server Port (optional)
PORT=3030
```

### 4. Verify Database Connection

The application automatically:
- Creates the `knowledge_base` table
- Enables the pgvector extension
- Creates necessary indexes

No manual database setup required!

---

## Starting the Application

### All-in-One Command (Recommended)

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173/ (React/Vite)
- **Backend**: http://localhost:3030/ (Express/Node.js)

### Individual Commands

```bash
# Terminal 1: Start Frontend
cd public
npm run dev

# Terminal 2: Start Backend
cd server
npm run dev
```

---

## Using the Web Interface

### 1. Open the Application

Open your browser and go to: **http://localhost:5173/**

You'll see the "LevBoots Brain" interface:

```
═══════════════════════════════════════════════════════════════
                    LevBoots Brain
═══════════════════════════════════════════════════════════════

⚠️  Knowledge Base Not Loaded

Load the knowledge base first to start asking questions
about Lev-Boots.

[Load Knowledge Base] ← Click this button
```

### 2. Load the Knowledge Base

Click the **"Load Knowledge Base"** button.

**What happens:**
- ✅ Loads 3 PDFs from `/server/knowledge_pdfs`
- ✅ Fetches 5 markdown articles from GitHub Gist
- ✅ Fetches messages from 3 Slack channels (lab-notes, engineering, offtopic)
- ✅ Splits all content into 400-word chunks
- ✅ Generates embeddings using Google Gemini API (1536 dimensions)
- ✅ Stores everything in PostgreSQL with pgvector

**Loading takes 2-5 minutes** (depends on API rate limits)

Once complete, you'll see:
```
✅ Data loaded successfully! You can now ask questions.
```

### 3. Ask Questions

The interface now shows:
```
Ask anything about LevBoots
[Send]

─────────────────────────────────
Suggestions:
• How do levboots work?
• What are some safety features?
• How much is the custom bootskin market worth?
```

**How to ask questions:**

**Option A: Type and Press Enter**
```
Type: "How do levboots work?"
Press: [Enter]
```

**Option B: Click Suggested Questions**
```
Click: "How do levboots work?"
The text will appear in the input field
Press: [Enter] or click [Send]
```

### 4. View Answers

The system returns:
- **Answer**: Based on the knowledge base using RAG
- **Source**: Which documents were used
- **Loading state**: "Getting your answer..."

Example response:
```
Answer:
────────────────────────────────────
Levboots work through a localized gravity reversal technology
that creates a levitation field around the wearer's feet.
According to the White Paper, the core mechanism involves...

Source: White Paper - The Development of Localized Gravity
Reversal Technology
```

---

## Using the API

### Endpoint 1: Load Data

**URL:** `http://localhost:3030/api/load_data`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** (empty)

**Example using curl:**
```bash
curl -X POST http://localhost:3030/api/load_data \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "ok": true
}
```

---

### Endpoint 2: Ask a Question

**URL:** `http://localhost:3030/api/ask`

**Method:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "userQuestion": "How do levboots work?"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion": "How do levboots work?"}'
```

**Response:**
```json
{
  "answer": "Levboots work through a localized gravity reversal technology that creates a levitation field...",
  "sources": [
    "White Paper - The Development of Localized Gravity Reversal Technology",
    "Research Paper - Gravitational Reversal Physics.pdf"
  ]
}
```

**Error Response:**
```json
{
  "answer": "",
  "error": "Failed to get answer for question"
}
```

---

## Troubleshooting

### Problem: "Database connection failed"

**Solution:**
1. Check DATABASE_URL in `.env`
2. Verify PostgreSQL is running
3. Ensure pgvector extension is enabled
4. Test connection: `psql your_database_url`

### Problem: "API key not found"

**Solution:**
1. Check `.env` file exists in `/server` directory
2. Verify keys are set:
   ```bash
   Gemini_API_KEY=your_key_here
   PERPLEXITY_API_KEY=your_key_here
   ```
3. Restart the server after updating `.env`

### Problem: "Port 3030 already in use"

**Solution:**
```bash
# Find process using port 3030
netstat -ano | grep :3030

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or use a different port
PORT=3031 npm run dev
```

### Problem: "Data loading takes too long or fails"

**Solution:**
1. Check API rate limits (especially Gemini and Perplexity)
2. Verify internet connection
3. Check server logs for specific errors
4. Try again after a few minutes (rate limit issue)

### Problem: "Questions return no results"

**Solution:**
1. Ensure data is loaded (check alert at top of page)
2. Check database has entries: `SELECT COUNT(*) FROM knowledge_base;`
3. Try rephrasing the question more naturally
4. Clear browser cache and reload

### Problem: "Frontend shows 'Cannot find module'"

**Solution:**
```bash
cd public
npm install
npm run dev
```

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser                              │
│              (React + Mantine UI @ :5173)                   │
│                                                              │
│  [Ask Questions] ←→ [View Answers] ←→ [Load Data]           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend                           │
│                  (Node.js @ :3030)                           │
│                                                              │
│  /api/load_data    /api/ask                                  │
│       ↓              ↓                                        │
│  LoadDataToAI    AskAI (RAG)                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────────────────────────┐
                    ↓                             ↓
    ┌──────────────────────────┐   ┌──────────────────────────┐
    │   External APIs          │   │  PostgreSQL Database     │
    │                          │   │                          │
    │ • Google Gemini          │   │ knowledge_base table:    │
    │   (embeddings)           │   │ - chunk_content          │
    │                          │   │ - embeddings_1536        │
    │ • Perplexity LLM         │   │ - source                 │
    │   (answer generation)    │   │ - source_id              │
    │                          │   │ - chunk_index            │
    │ • GitHub Gist            │   │ - created_at             │
    │   (articles)             │   │                          │
    │                          │   │ Indexes:                 │
    │ • Slack API              │   │ - IVFFlat for cosine     │
    │   (messages)             │   │   similarity search      │
    └──────────────────────────┘   └──────────────────────────┘
```

### Data Flow: Loading Data

```
1. Load Phase
   ├─ PDFs (from /knowledge_pdfs)
   ├─ Articles (from GitHub Gist)
   └─ Slack Messages (from Slack API with pagination)
        ↓
2. Process Phase
   ├─ Split into 400-word chunks (50-word overlap)
   ├─ Remove duplicates
   └─ Create metadata
        ↓
3. Embed Phase
   ├─ Use Google Gemini API
   ├─ Generate 1536-dimensional vectors
   └─ Batch processing with rate limiting
        ↓
4. Store Phase
   ├─ Bulk insert into PostgreSQL
   ├─ Create pgvector indexes
   └─ Ready for queries
```

### Data Flow: Answering Questions

```
1. User Question
   "How do levboots work?"
        ↓
2. Embed Question
   └─ Use same Gemini API (1536 dimensions)
        ↓
3. Search Knowledge Base
   ├─ Calculate cosine similarity
   ├─ Retrieve top 5 chunks
   └─ Filter by threshold (0.5)
        ↓
4. Build Context
   ├─ Combine retrieved chunks
   ├─ Add system prompt
   └─ Create full context
        ↓
5. Generate Answer
   ├─ Call Perplexity LLM API
   ├─ Receive answer
   └─ Extract sources
        ↓
6. Return to User
   {
     "answer": "...",
     "sources": ["Source 1", "Source 2"]
   }
```

---

## Configuration Details

### Embedding Configuration
- **Model**: Google Gemini (`text-embedding-004`)
- **Dimensions**: 1536 (stored in `embeddings_1536` column)
- **Batch Size**: 100 chunks per batch
- **Rate Limiting**: 1000ms delay between batches

### Chunking Configuration
- **Chunk Size**: 400 words
- **Overlap**: 50 words
- **Minimum Size**: 50 characters (skips very small chunks)

### RAG Configuration
- **Similarity Metric**: Cosine Similarity
- **Similarity Threshold**: 0.5 (0-1 scale)
- **Top K Results**: 5 chunks
- **Context Window**: Full retrieved chunks

### LLM Configuration
- **Answer Model**: Perplexity (Llama 3.1 Sonar Small)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1000
- **Timeout**: 30 seconds

---

## Performance Tips

1. **First Load**: Will take 2-5 minutes depending on:
   - Number of documents
   - API rate limits
   - Database performance

2. **Subsequent Queries**: ~2-5 seconds typically

3. **Optimize Query Time**:
   - Be specific in questions
   - Use natural language
   - Avoid very short queries

4. **Monitor API Usage**:
   - Check Gemini quota (embeddings)
   - Check Perplexity quota (generation)
   - Set up alerts if needed

---

## File Structure

```
rag-lev-boots-project/
├── server/
│   ├── services/
│   │   ├── dataLoader.ts         (Orchestrates loading)
│   │   ├── pdfLoader.ts          (Reads PDFs)
│   │   ├── articleLoader.ts      (Fetches articles)
│   │   ├── slackLoader.ts        (Fetches Slack messages)
│   │   ├── chunking.ts           (Splits content)
│   │   ├── embeddings.ts         (Generates embeddings)
│   │   └── ragService.ts         (Main RAG service)
│   │
│   ├── BusinessLogic/
│   │   ├── LoadDataToAI.ts       (UI for loading data)
│   │   └── AskAI.ts              (RAG question answering)
│   │
│   ├── models/
│   │   └── KnowledgeBase.ts      (Database schema)
│   │
│   ├── controllers/
│   │   └── ragController.ts      (API handlers)
│   │
│   ├── routes/
│   │   └── ragRoutes.ts          (API endpoints)
│   │
│   ├── knowledge_pdfs/           (PDF documents)
│   │   ├── OpEd - A Revolution at Our Feet.pdf
│   │   ├── Research Paper - Gravitational Reversal Physics.pdf
│   │   └── White Paper - The Development of Localized...pdf
│   │
│   ├── .env                      (Configuration - CREATE THIS)
│   ├── server.ts                 (Express server)
│   └── package.json
│
├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Home.tsx          (Main UI component)
│   │   ├── App.tsx               (React app)
│   │   └── main.tsx              (Entry point)
│   │
│   └── package.json
│
├── PLAN.MD                       (Implementation plan)
├── HOW_TO_USE.md                (This file)
└── README.md                     (Project overview)
```

---

## Next Steps

1. **Setup**: Follow [Setup](#setup) section
2. **Start**: Run `npm run dev`
3. **Open**: Visit http://localhost:5173/
4. **Load**: Click "Load Knowledge Base"
5. **Ask**: Type your questions!

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Check server logs in terminal
3. Verify `.env` configuration
4. Check API key validity
5. Ensure database is accessible

---

## Architecture Notes

This is a production-ready RAG system with:
- ✅ Semantic search (embeddings + cosine similarity)
- ✅ Context-aware answers (Perplexity LLM)
- ✅ Multi-source data loading
- ✅ Scalable vector database
- ✅ Rate limiting and error handling
- ✅ User-friendly web interface

Happy learning about Lev-Boots! 🚀
