# LevBoots RAG System - Project Structure

## 📁 Directory Overview

```
polo-rag-lev-boots-project/
├── server/                          # Node.js backend - RAG pipeline
│   ├── BusinessLogic/
│   │   ├── AskAI.ts                # Core RAG implementation
│   │   └── LoadDataToAI.ts         # Data loading orchestration
│   │
│   ├── services/
│   │   ├── embeddings.ts           # Gemini API integration for embeddings
│   │   ├── dataLoader.ts           # Main data loading pipeline
│   │   ├── pdfLoader.ts            # PDF parsing and extraction
│   │   ├── articleLoader.ts        # Article fetching from HTTP
│   │   ├── slackLoader.ts          # Slack API integration
│   │   ├── chunking.ts             # Text chunking logic
│   │   └── ragService.ts           # RAG service interface
│   │
│   ├── controllers/
│   │   └── ragController.ts        # Express route handlers
│   │
│   ├── models/
│   │   ├── KnowledgeBase.ts        # Sequelize model for KB table
│   │   └── index.ts                # Database initialization
│   │
│   ├── config/
│   │   ├── database.ts             # Database connection setup
│   │   └── config.cjs              # Sequelize configuration
│   │
│   ├── utils/
│   │   └── logger.ts               # Logging utility
│   │
│   ├── routes/
│   │   └── ragRoutes.ts            # Express routes
│   │
│   ├── migrations/
│   │   ├── 20250927100114-enable-pgvector-extension.cjs
│   │   └── 20250927100126-create-embeddings-table.cjs
│   │
│   ├── knowledge_pdfs/             # Source PDFs
│   │   ├── OpEd - A Revolution at Our Feet.pdf
│   │   ├── Research Paper - Gravitational Reversal Physics.pdf
│   │   └── White Paper - The Development of Localized Gravity Reversal Technology.pdf
│   │
│   ├── server.ts                   # Express server entry point
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── .env.example                # Environment template
│   └── dist/                        # Compiled JavaScript (generated)
│
├── public/                          # React frontend - Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── Home.tsx            # Main RAG interface component
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   └── vite-env.d.ts           # Vite type definitions
│   │
│   ├── vite.config.ts              # Vite configuration (API proxy)
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── index.html                  # HTML entry point
│   └── dist/                        # Built frontend (generated)
│
├── logs/                            # Application logs
│   └── server.log                   # Consolidated server logs
│
├── .gitignore                       # Git exclusion rules
├── PROJECT_STRUCTURE.md             # This file
├── HOW_TO_USE.md                    # Usage instructions
├── EXTRA_CHALLENGES.md              # Additional challenges
├── README.md                        # Original project spec
└── package.json                     # Root package.json


```

---

## 🏗️ Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Vite + Mantine UI Components)             │
│  - Question input                                        │
│  - Load Knowledge Base button                            │
│  - Answer display with Bibliography                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
                       │ (API proxy: localhost:5173 → 3030)
┌──────────────────────▼──────────────────────────────────┐
│                  Express Backend                         │
│              (/api routes on port 3030)                 │
│  - /api/ask           → Ask question & get answer        │
│  - /api/load_data     → Load KB from sources             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│             Postgres Database (Supabase)                 │
│              knowledge_base table with:                  │
│  - chunk_content      → Text chunks from sources         │
│  - embeddings_768     → Vector embeddings (768-dim)      │
│  - source             → Document name/URL                │
│  - source_id          → Unique chunk identifier          │
│  - chunk_index        → Position in document             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Question to Answer

### Step 1: Load Knowledge Base
```
Sources (PDFs, Articles, Slack)
    ↓
[pdfLoader.ts] [articleLoader.ts] [slackLoader.ts]
    ↓
[chunking.ts] → Split into ~400 word chunks
    ↓
[embeddings.ts] → Generate 768-dim vectors (Gemini API)
    ↓
[dataLoader.ts] → Batch insert to knowledge_base table
    ↓
PostgreSQL knowledge_base table
```

### Step 2: Ask a Question
```
User Question
    ↓
[Home.tsx] → User submits question via UI
    ↓
/api/ask endpoint
    ↓
[ragController.ts] → Route handler
    ↓
[ragService.ts] → Ask function
    ↓
[AskAI.ts] → RAG implementation:
    1. Embed question (Gemini API) → 768-dim vector
    2. Similarity search (cosine) → Find top 5 chunks
    3. Construct system prompt with retrieved context
    4. Call Perplexity API (sonar model) → Generate answer
    5. Extract unique sources
    6. Return: { answer, sources, bibliography }
    ↓
[Home.tsx] → Display answer + bibliography
```

---

## 📦 Key Files & Responsibilities

### Backend Core Files

#### `server/server.ts`
- Express app initialization
- Loads environment variables via `dotenv`
- Serves static frontend files
- Initializes database migrations

#### `server/BusinessLogic/AskAI.ts`
**Implements the RAG pipeline:**
- `askAI(userQuestion)` - Main RAG function
- `constructSystemPrompt()` - Creates LLM system prompt with context
- `retrieveRelevantChunks()` - Vector similarity search
- `cosineSimilarity()` - Calculates similarity between embeddings
- Constants:
  - `SIMILARITY_THRESHOLD = 0.3` - Minimum relevance score
  - `TOP_K = 5` - Number of chunks to retrieve
  - `PERPLEXITY_MODEL = 'sonar'` - LLM model name

#### `server/services/embeddings.ts`
**Handles Gemini embeddings:**
- `generateEmbeddings()` - Batch embedding generation
- `generateEmbedding()` - Single embedding
- `getEmbeddingDimension()` - Returns 768
- Features:
  - Retry logic with exponential backoff
  - 30-second timeout per API call
  - Rate limiting (1 second delay between requests)

#### `server/services/dataLoader.ts`
**Orchestrates the data loading pipeline:**
- Step 1: Load PDFs, articles, Slack messages
- Step 2: Chunk all content
- Step 3: Check for existing data (avoid duplicates)
- Step 4: Generate embeddings for all chunks
- Step 5: Store to database in batches (50 chunks per batch)

#### `server/models/KnowledgeBase.ts`
**Database model for chunks:**
```typescript
{
  source: string              // Document name
  source_id: string           // Unique chunk ID
  chunk_index: number         // Position in document
  chunk_content: string       // Actual text
  embeddings_768: number[]    // Vector representation
  embeddings_1536?: number[]  // Alternative embedding dimension
}
```

### Frontend Core Files

#### `public/src/components/Home.tsx`
**Main RAG UI component:**
- State management:
  - `question` - User input
  - `response` - API response (with answer, sources, bibliography)
  - `isLoading` - Loading indicator
  - `error` - Error message
  - `isDataLoaded` - KB loaded flag
- Functions:
  - `loadData()` - Call /api/load_data endpoint
  - `submitQuestion()` - Send question to /api/ask
  - `checkDataStatus()` - Verify KB is loaded
- Display:
  - Answer section (clean text, no inline citations)
  - Bibliography section (numbered list of sources)

#### `public/vite.config.ts`
**Frontend build & proxy config:**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3030',  // Backend URL
    changeOrigin: true,
  },
}
```

---

## 🔐 Security & Environment Variables

### Required Environment Variables
Create `server/.env` (use `server/.env.example` as template):
```
PERPLEXITY_API_KEY=your_api_key_here
Gemini_API_KEY=your_api_key_here
PERPLEXITY_MODEL=sonar
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Secrets Protection
- `.env` file is in `.gitignore` - never committed to GitHub
- `.env.example` shows required variables without values
- API keys safely stored locally only

---

## 🗄️ Database Schema

### `knowledge_base` Table
```sql
CREATE TABLE knowledge_base (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255),           -- Document source name
  source_id VARCHAR(255),        -- Unique chunk identifier
  chunk_index INTEGER,           -- Position in document
  chunk_content TEXT,            -- Text content (~400 words)
  embeddings_768 FLOAT8[],       -- Vector embeddings (768 dimensions)
  embeddings_1536 FLOAT8[],      -- Alternative embedding (1536 dimensions)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector for similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON knowledge_base USING ivfflat (embeddings_768 vector_cosine_ops);
```

---

## 🚀 API Endpoints

### POST `/api/ask`
**Ask a question and get RAG answer**

Request:
```json
{
  "userQuestion": "How do levboots work?"
}
```

Response:
```json
{
  "answer": "LevBoots work by using an Aetheric Field Generator...",
  "sources": [
    "White Paper - The Development of Localized Gravity Reversal Technology.pdf",
    "OpEd - A Revolution at Our Feet.pdf"
  ],
  "bibliography": [
    "White Paper - The Development of Localized Gravity Reversal Technology.pdf",
    "OpEd - A Revolution at Our Feet.pdf"
  ]
}
```

### POST `/api/load_data`
**Load and embed all knowledge base sources**

Request: (no body required)

Response:
```json
{
  "ok": true,
  "message": "Data loaded successfully"
}
```

---

## 📊 Configuration Constants

### Similarity Search
| Constant | Value | Purpose |
|----------|-------|---------|
| `SIMILARITY_THRESHOLD` | 0.3 | Min relevance score to include chunk |
| `TOP_K` | 5 | Number of top chunks to retrieve |
| `EMBEDDING_DIMENSION` | 768 | Vector dimensions |

### API Configuration
| Service | Model | Details |
|---------|-------|---------|
| Embeddings | Gemini text-embedding-004 | 768-dimensional vectors |
| LLM Answer | Perplexity sonar | Latest sonar model (replaces llama-3.1) |
| Database | Postgres + pgvector | Similarity search via cosine distance |

### Performance & Reliability
| Setting | Value | Purpose |
|---------|-------|---------|
| Request Timeout | 30 seconds | Per API call timeout |
| Max Retries | 3 attempts | Exponential backoff: 1s, 2s, 4s |
| Batch Size | 50 chunks | Database insert batch size |
| Delay Between Requests | 1 second | Rate limiting for embeddings |

---

## 🔄 Request Flow Diagram

```
Frontend (React)
    │
    ├─ User clicks "Load Knowledge Base"
    │   └─→ POST /api/load_data
    │       ├─ Load PDFs, Articles, Slack
    │       ├─ Chunk content (400 words each)
    │       ├─ Generate embeddings (Gemini)
    │       └─ Insert to DB
    │
    └─ User types question & submits
        └─→ POST /api/ask { userQuestion: "..." }
            ├─ Embed question (Gemini)
            ├─ Vector similarity search (cosine)
            ├─ Retrieve top 5 chunks
            ├─ Build system prompt with context
            ├─ Call Perplexity LLM (sonar)
            ├─ Extract unique sources
            └─→ Return { answer, sources, bibliography }

Frontend displays:
- Answer section (first)
- Bibliography section (numbered list below)
```

---

## 📚 Data Sources

### PDFs (3 documents)
- `server/knowledge_pdfs/OpEd - A Revolution at Our Feet.pdf`
- `server/knowledge_pdfs/Research Paper - Gravitational Reversal Physics.pdf`
- `server/knowledge_pdfs/White Paper - The Development of Localized Gravity Reversal Technology.pdf`

### Articles (5 articles from HTTP)
- military-deployment-report
- urban-commuting
- hover-polo
- warehousing
- consumer-safety

### Slack API (Simulated)
Three channels with paginated results:
- lab-notes
- engineering
- offtopic

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector
- **ORM**: Sequelize
- **APIs**:
  - Google Gemini (embeddings)
  - Perplexity (LLM answers)
- **HTTP Client**: Axios
- **Logging**: Custom logger to file + console

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: Mantine v8
- **Icons**: Tabler Icons
- **State Management**: MobX
- **Styling**: CSS-in-JS (Mantine theming)

### Infrastructure
- **Database**: Supabase (PostgreSQL + pgvector)
- **Port Assignment**:
  - Backend: 3030
  - Frontend Dev: 5173
  - Frontend Build: Static files in `/public/dist`

---

## 📖 Key Concepts

### Retrieval-Augmented Generation (RAG)
1. **Retrieval**: Find relevant documents based on query
2. **Augmentation**: Use retrieved docs to build context
3. **Generation**: LLM generates answer based on context

### Vector Embeddings
- Text converted to 768-dimensional vectors
- Vectors capture semantic meaning
- Similar text = similar vectors
- Cosine similarity measures proximity

### Chunking
- Large documents split into ~400 word chunks
- Preserves context while limiting token count
- Each chunk independently embedded

### Similarity Search
- Use cosine distance to find relevant chunks
- Formula: `(A·B) / (||A|| × ||B||)`
- Threshold 0.3 filters irrelevant results

---

## 🚦 Status Indicators

### Logging Levels
| Symbol | Level | Meaning |
|--------|-------|---------|
| ℹ️ | INFO | Important operations |
| 🔍 | DEBUG | Detailed debugging info |
| ⚠️ | WARN | Warning conditions |
| ❌ | ERROR | Error occurred |
| ✓ | SUCCESS | Operation completed |

All logs written to `logs/server.log` and console.

---

## 🔧 Running the Project

### Development
```bash
# Install dependencies
npm install

# Start backend (port 3030)
cd server && npm start

# Start frontend (port 5173) - in new terminal
cd public && npm run dev

# Open browser: http://localhost:5173
```

### Build for Production
```bash
# Build backend
cd server && npm run build

# Build frontend
cd public && npm run build

# Serve static frontend from backend
npm start (from server directory)
```

---

## 📝 Notes

- **First-time setup**: Click "Load Knowledge Base" to populate the database
- **Rate limiting**: API calls have delays to respect rate limits
- **Vector dimension**: Entire project uses 768-dimensional embeddings consistently
- **Model migration**: Updated from deprecated `llama-3.1-sonar-*` to current `sonar` model
- **Environment variables**: Ensure `.env` is created before starting server
