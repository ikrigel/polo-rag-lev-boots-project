# Lev-Boots RAG System Implementation Plan

## Project Overview
Implement a complete Retrieval-Augmented Generation (RAG) system that allows users to ask questions about "Lev-Boots" technology. The system will load knowledge from multiple sources, embed the content, and use similarity search with LLM generation to answer questions.

---

## Phase 1: Foundation & Setup

### 1.1 Environment & Database Setup
- [ ] Configure `.env` file with `DATABASE_URL` (Postgres with pgvector)
  - Recommended: Use Supabase for quick setup
- [ ] Verify database connection and pgvector extension enabled
- [ ] Confirm `knowledge_base` table is created (auto-migration on server start)
- [ ] Review `models/KnowledgeBase.ts` to understand the schema

### 1.2 API Credentials & Dependencies
- [ ] Set up Google Gemini API key (free tier)
  - Get key from: https://aistudio.google.com/app/apikey
  - Configure thinking disabled in requests (saves tokens)
- [ ] Install required packages: `pdf-parse`, `axios` (or fetch)
- [ ] Choose embedding model dimension (768 or 1536) and document decision
  - Decision: Use 1536 (Gemini default) for better precision
  - Column to use: `embeddings_1536`

---

## Phase 2: Data Loading Pipeline

### 2.1 Load PDFs
- [ ] Create function to read PDF files from `/knowledge_pdfs` directory
  - `OpEd - A Revolution at Our Feet.pdf`
  - `Research Paper - Gravitational Reversal Physics.pdf`
  - `White Paper - The Development of Localized Gravity Reversal Technology.pdf`
- [ ] Extract text content using `pdf-parse`
- [ ] Handle errors (missing files, parse failures)

### 2.2 Load Markdown Articles
- [ ] Fetch articles from gist endpoint: `https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw/article-X_ARTICLE_ID.md`
- [ ] Map article IDs: `[military-deployment-report, urban-commuting, hover-polo, warehousing, consumer-safety]`
- [ ] Replace `X` with numbers 1-5 and `ARTICLE_ID` with each ID
- [ ] Handle HTTP errors and timeouts

### 2.3 Load Slack API Data
- [ ] Implement pagination handler for Slack API
  - Base URL: `https://lev-boots-slack-api.jona-581.workers.dev/`
  - Channels: `lab-notes`, `engineering`, `offtopic`
  - Query params: `?channel={name}&page={number}`
- [ ] Fetch all pages from each channel until no more data
- [ ] Handle rate limiting gracefully (retry logic, delays)
- [ ] Aggregate all messages

### 2.4 Create Data Loading Module
- [ ] Create `ragService.ts` (or related) to orchestrate data loading
- [ ] Implement `loadAllData()` function that:
  - Calls PDF loader
  - Calls article loader
  - Calls Slack loader
  - Returns combined raw content list

---

## Phase 3: Content Processing

### 3.1 Chunking Strategy
- [ ] Implement chunking function (400-word chunks)
  - Split on sentence/paragraph boundaries when possible
  - Metadata: source, chunk index, source type (pdf/article/slack)
- [ ] Ensure chunks fit within embedding API limits
- [ ] Add overlap between chunks if needed for context

### 3.2 Embedding Generation
- [ ] Use Gemini Embeddings API (or alternative embedding model)
- [ ] Set embedding dimensions to 1536 (or chosen dimension)
- [ ] Batch requests to avoid hitting rate limits
- [ ] Implement retry logic with exponential backoff
- [ ] Cache embeddings to avoid re-processing

### 3.3 Database Storage
- [ ] Create insert function for `knowledge_base` table
  - Store: content, embeddings, source, chunk_index, metadata
- [ ] Handle bulk inserts efficiently
- [ ] Avoid duplicate entries (check for existing content)
- [ ] Verify pgvector operations work correctly

---

## Phase 4: Query & Retrieval

### 4.1 Question Embedding
- [ ] Use same embedding model as content (Gemini, 1536 dims)
- [ ] Embed user question

### 4.2 Similarity Search
- [ ] Implement vector similarity search using pgvector
  - Use cosine similarity or other distance metric
  - Retrieve top K chunks (k=5-10 recommended)
- [ ] Return ranked results

### 4.3 LLM Answer Generation
- [ ] Construct prompt with:
  - User question
  - Retrieved knowledge chunks
  - System instruction to base answer only on retrieved content
- [ ] Call Gemini API (or your chosen LLM) with full context
- [ ] Parse and return response to UI

### 4.4 Implement `ask(userQuestion)` Function
- [ ] Embed question
- [ ] Search database
- [ ] Generate answer
- [ ] Return to frontend

---

## Phase 5: Testing & Validation

### 5.1 Functional Testing
- [ ] Test PDF loading and parsing
- [ ] Test article fetching (all 5 articles)
- [ ] Test Slack pagination (all channels, all pages)
- [ ] Test chunking (verify chunk sizes, metadata)
- [ ] Test embedding generation (verify dimensions)
- [ ] Test database storage (verify inserts)
- [ ] Test similarity search (verify results make sense)
- [ ] Test answer generation (verify LLM integration)

### 5.2 Quality Testing
- [ ] Ask sample questions and verify answers are accurate
- [ ] Test that system doesn't hallucinate (answers based on KB)
- [ ] Test edge cases (no results, ambiguous questions)

### 5.3 Performance & Optimization
- [ ] Monitor API usage (Gemini embeddings/LLM calls)
- [ ] Verify no duplicate embeddings
- [ ] Profile database queries
- [ ] Optimize batch sizes for API calls

---

## Phase 6: Extra Challenges (Optional)

### 6.1 RAGAS – RAG Assessment System

#### Option 1: Simple Node.js Version
- [ ] Create 10 Q&A pairs with ground-truth answers
- [ ] Implement evaluation script:
  - For each question: generate RAG answer
  - Ask LLM to score similarity (1-10 scale)
  - Average scores across all questions
  - Target: >80 is good, >90 is excellent
- [ ] Log evaluation results
- [ ] Create comparison mechanism (track changes over time)

#### Option 2: Python RAGAS Integration
- [ ] Set up Python server with RAGAS library
- [ ] Create same 10 Q&A pairs
- [ ] Integrate with Node backend (API calls)
- [ ] Use RAGAS metrics for evaluation

### 6.2 Gatekeeper – Filtering Non-Informative Content

- [ ] Create gatekeeper module to filter content before embedding
- [ ] Classification approach:
  - Use LLM to score chunk informativeness (0-10 scale)
  - Set threshold (e.g., >5 is useful)
  - Skip chunks below threshold
- [ ] Update `loadAllData()` to include gatekeeper step
- [ ] Log rejected chunks for debugging
- [ ] Compare KB size before/after filtering

### 6.3 Conversational RAG – Multi-turn Support

#### 6.3.1 Conversation History Management
- [ ] Implement in-memory conversation history
  - Store user messages + AI responses
  - Limit to last X messages (configurable)
  - Or implement summary of older messages
- [ ] Add conversation ID/session tracking

#### 6.3.2 Enhanced Prompt Construction
- [ ] Include conversation history in LLM prompt
- [ ] Maintain context across multiple turns
- [ ] Handle context window limits

#### 6.3.3 Question Type Classification
- [ ] Add classification step before answering:
  - Is this a knowledge-seeking question about Lev-Boots?
  - Or is it general conversation (small-talk, etc.)?
- [ ] Route accordingly:
  - Knowledge question → Run full RAG pipeline
  - General conversation → Direct LLM response (no retrieval)
- [ ] Update UI to support multi-turn conversation

---

## Implementation Notes

1. **File Structure Recommendation**
   ```
   server/
   ├── src/
   │   ├── ragService.ts (main orchestrator)
   │   ├── services/
   │   │   ├── dataLoader.ts (PDF, articles, Slack)
   │   │   ├── chunking.ts (content chunking)
   │   │   ├── embeddings.ts (embedding generation)
   │   │   ├── retrieval.ts (similarity search)
   │   │   └── llm.ts (LLM integration)
   │   └── (extra challenges)
   │       ├── ragas.ts (evaluation)
   │       ├── gatekeeper.ts (filtering)
   │       └── conversationalRag.ts (multi-turn)
   ```

2. **Token Management**
   - Start small (e.g., one PDF) to test pipeline
   - Avoid re-embedding already processed content
   - Use caching to track what's been embedded
   - Monitor Gemini API usage

3. **Embedding Dimension Decision**
   - 768: Faster, cheaper, suitable for simple tasks
   - 1536: More precise, higher cost, better for complex queries
   - Current choice: 1536 with `embeddings_1536` column

4. **Rate Limiting Strategies**
   - Batch embedding requests
   - Add delays between API calls
   - Implement exponential backoff on errors
   - Cache results to avoid duplicate requests

---

## Success Criteria

### Phase 1-4 (Core RAG System)
- ✅ Data from all sources loaded into KB
- ✅ Chunks properly stored with embeddings
- ✅ Similarity search returns relevant results
- ✅ LLM answers questions accurately (based on KB only)
- ✅ UI displays correct answers

### Phase 5 (Testing)
- ✅ All components tested and working
- ✅ No hallucinations in responses
- ✅ Performance acceptable (reasonable response time)

### Phase 6 (Extra Challenges)
- ✅ RAGAS evaluation score >80
- ✅ Gatekeeper filters noise effectively
- ✅ Conversational RAG maintains context across turns

---

## Timeline & Priority

**Core Implementation (Phases 1-5):** Essential
**Extra Challenges (Phase 6):**
- RAGAS: High value (quality assurance)
- Gatekeeper: Medium value (optimization)
- Conversational RAG: Medium value (UX improvement)

Do RAGAS first if pursuing extra challenges (measure quality before optimizing).
