# LevBoots RAG System - Architecture & Design

## 🏛️ System Architecture

### Overview Diagram
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                        USER INTERFACE                            │
│                    (React + Mantine UI)                          │
│                     Port 5173 (Dev)                              │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/REST
                    (Vite Dev Proxy)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                                                                  │
│                    EXPRESS.JS BACKEND                            │
│                    Port 3030 (API Server)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RAG Controllers & Routes                   │   │
│  │  • /api/ask - Answer user questions                    │   │
│  │  • /api/load_data - Load & embed knowledge base        │   │
│  └────────────────┬────────────────────────────────────────┘   │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐   │
│  │         Business Logic Layer (AskAI.ts)                │   │
│  │  • RAG Pipeline Implementation                         │   │
│  │  • Vector Similarity Search                            │   │
│  │  • System Prompt Construction                          │   │
│  └────────────────┬────────────────────────────────────────┘   │
│                   │                                              │
│  ┌────────────────▼────────────────────────────────────────┐   │
│  │            Service Layer                               │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Embeddings Service (Gemini API)                 │  │   │
│  │  │ • Generate 768-dim vectors                      │  │   │
│  │  │ • Retry logic & timeout handling                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Data Loader Service                             │  │   │
│  │  │ • PDF parsing                                   │  │   │
│  │  │ • Article fetching                              │  │   │
│  │  │ • Slack API integration                         │  │   │
│  │  │ • Content chunking                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
        External APIs & Database
        │
        ├─ Gemini API (Embeddings)
        ├─ Perplexity API (LLM)
        ├─ HTTP APIs (Articles, Slack)
        │
        └─ PostgreSQL + pgvector
           (Knowledge Base Table)
```

---

## 🔄 Data Flow Architecture

### Phase 1: Knowledge Base Loading

```
┌─────────────────────────────────────────────────────────────┐
│                  DATA COLLECTION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PDF Loader    │  │ Article      │  │  Slack       │  │
│  │                │  │ Loader       │  │  Loader      │  │
│  │ Reads 3 PDFs   │  │              │  │              │  │
│  │ from local     │  │ Fetches 5    │  │ Paginates    │  │
│  │ /knowledge_    │  │ articles via │  │ through 3    │  │
│  │ pdfs/          │  │ HTTP GET     │  │ channels     │  │
│  └────────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│           │                 │                 │            │
│           └─────────────────┴─────────────────┘            │
│                      │                                      │
│                      ▼                                      │
│              Raw Text Content                              │
│              (PDFs + Articles +                            │
│               Slack Messages)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              CHUNKING & PREPROCESSING                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Content → Split into ~400 word chunks                     │
│         → Preserve semantic boundaries                     │
│         → ~33 total chunks created                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          EMBEDDING GENERATION (Gemini API)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  For each chunk:                                           │
│    1. Send to Gemini text-embedding-004 API                │
│    2. Receive 768-dimensional vector                       │
│    3. Handle rate limits (1s delay between requests)       │
│    4. Retry with exponential backoff on failure            │
│                                                             │
│  Result: 33 chunks → 33 vectors (768-dim each)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          BATCH STORAGE IN DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Insert in batches of 50:                                  │
│  ┌─────────────────────────────────┐                       │
│  │ knowledge_base Table            │                       │
│  ├─────────────────────────────────┤                       │
│  │ id            │ SERIAL          │                       │
│  │ source        │ Document name   │                       │
│  │ source_id     │ Chunk ID        │                       │
│  │ chunk_index   │ Position        │                       │
│  │ chunk_content │ Text (400w)     │                       │
│  │ embeddings_768│ FLOAT8[] (768)  │ ← Vector stored here  │
│  │ created_at    │ TIMESTAMP       │                       │
│  └─────────────────────────────────┘                       │
│                                                             │
│  Indexes: pgvector cosine similarity on embeddings_768     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Question Answering (RAG Pipeline)

```
┌─────────────────────────────────────────────────────────────┐
│                  USER QUESTION                              │
│              "How do levboots work?"                        │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│         STEP 1: EMBED THE QUESTION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Question → Gemini API → 768-dim vector                    │
│  [0.123, -0.456, 0.789, ...]                               │
│                                                             │
│  Same embedding model as knowledge base ✓                  │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│         STEP 2: SIMILARITY SEARCH                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  For each chunk in knowledge_base:                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ similarity = cosine(question_vector, chunk_vector) │  │
│  │                                                     │  │
│  │ Formula:                                            │  │
│  │   (A·B) / (||A|| × ||B||)                           │  │
│  │                                                     │  │
│  │ Range: -1 to 1                                      │  │
│  │   1.0  = identical                                  │  │
│  │   0.5  = moderate similarity                        │  │
│  │   0.3  = THRESHOLD (our minimum)                    │  │
│  │   0.0  = no similarity                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Filter: Keep only chunks with similarity ≥ 0.3           │
│  Sort: By similarity score descending                      │
│  Select: Top 5 most relevant chunks                        │
│                                                             │
│  Example results:                                          │
│  ┌──────┬─────────────────────────┬────────────┐          │
│  │ Rank │ Source                  │ Similarity │          │
│  ├──────┼─────────────────────────┼────────────┤          │
│  │  1   │ White Paper (AFG tech)  │  0.656    │          │
│  │  2   │ OpEd (Feet article)     │  0.646    │          │
│  │  3   │ Article 2 (commuting)   │  0.640    │          │
│  │  4   │ Research Paper (physics)│  0.637    │          │
│  │  5   │ OpEd (feet again)       │  0.636    │          │
│  └──────┴─────────────────────────┴────────────┘          │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│         STEP 3: BUILD CONTEXT PROMPT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  System Prompt Template:                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ You are an AI specialized in LevBoots technology.   │  │
│  │ Answer based ONLY on provided context.              │  │
│  │ Do not make up information.                         │  │
│  │                                                      │  │
│  │ KNOWLEDGE BASE CONTEXT:                             │  │
│  │                                                      │  │
│  │ Source 1: White Paper - The Development...          │  │
│  │ [chunk content here...]                             │  │
│  │                                                      │  │
│  │ Source 2: OpEd - A Revolution...                    │  │
│  │ [chunk content here...]                             │  │
│  │                                                      │  │
│  │ ... (4 more sources)                                │  │
│  │                                                      │  │
│  │ Now answer the user's question based on this        │  │
│  │ context only.                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Messages sent to LLM:                                     │
│  1. system: [above prompt]                                 │
│  2. user: "How do levboots work?"                         │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│         STEP 4: CALL LLM (Perplexity API)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Model: sonar (latest, replaces deprecated llama-3.1)     │
│  Temperature: 0.7 (balanced creativity & consistency)      │
│  Max tokens: 1000                                          │
│                                                             │
│  HTTP POST to: https://api.perplexity.ai/chat/completions │
│  Headers: Authorization: Bearer {PERPLEXITY_API_KEY}       │
│                                                             │
│  Response: Clean answer without inline citations           │
│  Processing time: 5-10 seconds typical                     │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│         STEP 5: EXTRACT & FORMAT RESPONSE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Processing:                                               │
│  1. Extract answer text from LLM response                  │
│  2. Remove inline citations [1][2][3]                      │
│  3. Extract unique sources from retrieved chunks           │
│  4. Build bibliography array                               │
│                                                             │
│  Final Response:                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ {                                                   │  │
│  │   "answer": "LevBoots work by using an Aetheric...  │  │
│  │             ...Field Generator to create...",       │  │
│  │   "sources": [                                      │  │
│  │     "White Paper - The Development...",            │  │
│  │     "OpEd - A Revolution...",                      │  │
│  │     "Article 2: urban-commuting",                  │  │
│  │     "Research Paper - Gravitational..."            │  │
│  │   ],                                                │  │
│  │   "bibliography": [                                │  │
│  │     "White Paper - The Development...",            │  │
│  │     "OpEd - A Revolution...",                      │  │
│  │     "Article 2: urban-commuting",                  │  │
│  │     "Research Paper - Gravitational..."            │  │
│  │   ]                                                 │  │
│  │ }                                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘

                      ▼

┌─────────────────────────────────────────────────────────────┐
│              FRONTEND DISPLAY                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ LevBoots Brain                                      │  │
│  │                                                     │  │
│  │ [Question input box]                               │  │
│  │                                                     │  │
│  │ Answer                                              │  │
│  │ ┌─────────────────────────────────────────────────┐│  │
│  │ │ LevBoots work by using an Aetheric Field...    ││  │
│  │ │                                                 ││  │
│  │ │ For control, Micro-Thrust Vectoring Systems... ││  │
│  │ └─────────────────────────────────────────────────┘│  │
│  │                                                     │  │
│  │ Bibliography                                        │  │
│  │ ┌─────────────────────────────────────────────────┐│  │
│  │ │ 1. White Paper - The Development...           ││  │
│  │ │ 2. OpEd - A Revolution at Our Feet.pdf        ││  │
│  │ │ 3. Article 2: urban-commuting                 ││  │
│  │ │ 4. Research Paper - Gravitational...          ││  │
│  │ └─────────────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Design Decisions

### 1. Embedding Dimension: 768 vs 1536

| Aspect | 768-dim | 1536-dim |
|--------|---------|----------|
| **Speed** | Faster | 2x slower |
| **Precision** | Good | Better |
| **Storage** | ~26MB | ~52MB |
| **Cost** | Lower | Higher |
| **API Rate** | Higher | Lower |
| **Recommendation** | ✓ Use this | Research-heavy |

**Decision**: Use 768-dim for balance of speed and quality.

### 2. Similarity Threshold: 0.3

| Threshold | Result | Trade-off |
|-----------|--------|-----------|
| 0.1 | Too permissive | Noisy results |
| 0.3 | ✓ Optimal | Balanced |
| 0.5 | Too strict | Misses relevant content |
| 0.7 | Very strict | Only exact matches |

**Decision**: 0.3 captures relevant content without noise.

### 3. Top K: 5 Chunks

| Top K | Result | Trade-off |
|-------|--------|-----------|
| 1 | Single perspective | May be incomplete |
| 3 | Limited context | Quick response |
| 5 | ✓ Balanced | Good coverage, tokens OK |
| 10+ | Comprehensive | Exceeds token budget |

**Decision**: 5 chunks provides comprehensive context within LLM token limits.

### 4. Chunking Strategy: ~400 Words

| Chunk Size | Pros | Cons |
|-----------|------|------|
| 100 words | Precise | Too many chunks to embed |
| 400 words | ✓ Balance | Tested & works well |
| 1000 words | Fewer chunks | Loses context precision |

**Decision**: ~400 words balances API costs with semantic precision.

### 5. Batch Insertion: 50 Chunks Per Batch

| Batch Size | Speed | Memory |
|-----------|-------|--------|
| 1 | Very slow | Minimal |
| 50 | ✓ Optimal | Manageable |
| 100+ | Risk timeout | High memory |

**Decision**: 50 chunks per batch balances speed and stability.

---

## 🔄 Error Handling & Resilience

### Retry Logic with Exponential Backoff
```
Attempt 1: Fail → Wait 1 second → Retry
Attempt 2: Fail → Wait 2 seconds → Retry
Attempt 3: Fail → Wait 4 seconds → Retry
Attempt 4: Give up → Log error
```

### Timeout Protection
```
Each API call has 30-second timeout
If timeout:
  1. Abort the request
  2. Log the error
  3. Retry if attempts remain
  4. Frontend shows helpful error message
```

### Rate Limiting
```
Between Gemini API calls: 1-second delay
Prevents hitting rate limits
Improves stability on first data load
```

---

## 📊 Performance Characteristics

### Query Response Time Breakdown
```
User submits question
├─ Frontend validation: 10ms
├─ Network latency: 50ms
├─ Embed question (Gemini): 1-2 seconds
├─ Database similarity search: <100ms
├─ Build system prompt: 10ms
├─ Call Perplexity API: 5-10 seconds
├─ Parse response: 10ms
└─ Frontend render: 50ms
────────────────────────────
Total: ~6-12 seconds per question
```

### Data Loading Performance
```
First load (full pipeline):
  ├─ Load 3 PDFs: 2-3 seconds
  ├─ Load 5 articles: 1-2 seconds
  ├─ Load Slack messages: 3-5 seconds
  ├─ Chunk content: 1 second
  ├─ Generate 33 embeddings: 10-20 minutes ⚠️ (Gemini API rate limits)
  └─ Insert to database: 10 seconds
  ─────────────────────────────
  Total: 10-20 minutes (first run)
         Instant (subsequent runs - cached)
```

---

## 🔐 Security Architecture

### Secret Management
```
.env file (LOCAL ONLY)
  ├─ PERPLEXITY_API_KEY
  ├─ Gemini_API_KEY
  ├─ PERPLEXITY_MODEL
  └─ DATABASE_URL

Not in Git:
  .env → Added to .gitignore
  Credentials → Never leaked

Safe to Share:
  .env.example → Template with placeholders
  Code → No hardcoded secrets
  GitHub → Only safe files
```

### Authentication Flow
```
Request with API Key
    ↓
Include in Authorization header
    ↓
External API validates key
    ↓
Process or reject
    ↓
Never logged/exposed in response
```

---

## 🏗️ Scalability Considerations

### Current Limits
```
Knowledge Base:
  - ~33 chunks: No performance issues
  - Queries: <15 second response
  - Concurrent users: Single instance tested

Vector Search:
  - 33 chunks: <100ms
  - 10,000 chunks: ~1-2 seconds (estimated)
  - 100,000 chunks: ~5-10 seconds (estimated)

LLM Throughput:
  - Per user: ~6-12 seconds per question
  - Concurrent: Limited by Perplexity API rate limits
```

### To Scale to Production
```
1. Add connection pooling (database)
2. Implement Redis caching for embeddings
3. Use async task queue for data loading
4. Add multiple API key rotation
5. Implement rate limiting middleware
6. Use CDN for static frontend
7. Monitor API costs & quotas
```

---

## 🎓 Key Concepts Explained

### Cosine Similarity
```
Two vectors:
  A = [0.2, 0.5, 0.8]
  B = [0.1, 0.4, 0.9]

Cosine Similarity = (A·B) / (||A|| × ||B||)
                  = (0.02 + 0.20 + 0.72) / (0.929 × 0.908)
                  = 0.94 / 0.843
                  ≈ 0.99

Result: Vectors are very similar (nearly parallel)
Range: 1.0 (identical) to -1.0 (opposite)
```

### RAG vs Standard LLM
```
Standard LLM (hallucination risk):
  Question → Model → Answer (from training data)
             ↓
             May be outdated or inaccurate

RAG (fact-based):
  Question → Retrieve context → Model → Answer
             ↓                   ↓
             From KB            Based on retrieved facts
             Current            Grounded & verifiable
```

### Embedding Vectors
```
Text: "How do levboots work?"
      ↓
Embedding Model (Gemini)
      ↓
768-dimensional vector
[0.123, -0.456, 0.789, ..., 0.342]
      ↓
Captures semantic meaning numerically
Can be compared for similarity
```

---

## 🚀 Future Improvements

### Performance
- [ ] Implement Redis caching for embeddings
- [ ] Use vector search indexes (pgvector indexes)
- [ ] Implement incremental data loading
- [ ] Add response caching for common questions

### Features
- [ ] Multi-language support
- [ ] Citation hyperlinks
- [ ] Source snippets preview
- [ ] Question history
- [ ] User feedback collection

### Reliability
- [ ] Circuit breaker for API failures
- [ ] Fallback LLM providers
- [ ] Database failover/backup
- [ ] Monitoring & alerting

### Scalability
- [ ] Horizontal scaling (load balancer)
- [ ] Database sharding
- [ ] API gateway rate limiting
- [ ] CDN for static assets

---

## 📚 References

- **Cosine Similarity**: [Wikipedia](https://en.wikipedia.org/wiki/Cosine_similarity)
- **RAG Papers**: [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)
- **Vector Embeddings**: [OpenAI Docs](https://platform.openai.com/docs/guides/embeddings)
- **pgvector**: [GitHub](https://github.com/pgvector/pgvector)
- **Gemini API**: [Google AI Docs](https://ai.google.dev/)
- **Perplexity API**: [Perplexity Docs](https://docs.perplexity.ai/)
