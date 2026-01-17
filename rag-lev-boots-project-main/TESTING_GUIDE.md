# Testing Guide - Running & Testing the Application

Complete guide to set up, run, and test the LevBoots RAG System with all three major features.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Frontend Testing](#frontend-testing)
4. [API Testing](#api-testing)
5. [Feature Testing](#feature-testing)
6. [Troubleshooting](#troubleshooting)
7. [Performance Testing](#performance-testing)

---

## Prerequisites

### Required Software

```bash
# Check versions
node --version        # Should be v16+ (recommend v18+)
npm --version        # Should be v8+
git --version        # Should be v2+
```

### Required Credentials

Create `.env` file in `server/` directory:

```bash
# Copy template
cp server/.env.example server/.env

# Edit with your credentials
# You need:
# - DATABASE_URL (PostgreSQL with pgvector)
# - Gemini_API_KEY (for embeddings)
# - PERPLEXITY_API_KEY (for LLM)
# - PERPLEXITY_MODEL=sonar
```

**Get API Keys:**
- **Gemini API**: https://aistudio.google.com/app/apikey (free)
- **Perplexity API**: https://www.perplexity.ai/api-platform (free tier)
- **Database**: Use Supabase (90 seconds setup) https://supabase.com

---

## Quick Start

### 1. **Clone Repository**

```bash
git clone https://github.com/ikrigel/polo-rag-lev-boots-project.git
cd polo-rag-lev-boots-project
```

### 2. **Install Dependencies**

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../public
npm install

# Back to root
cd ..
```

### 3. **Configure Environment**

```bash
# Copy and edit .env
cp server/.env.example server/.env

# Edit with your API keys
nano server/.env  # or use your editor
```

Required `.env` content:
```
DATABASE_URL=postgresql://user:password@localhost:5432/levboots_db
Gemini_API_KEY=AIzaSy...
PERPLEXITY_API_KEY=pplx-...
PERPLEXITY_MODEL=sonar
```

### 4. **Start Application**

```bash
# Option A: Run both servers in one command
npm run dev

# Option B: Run in separate terminals

# Terminal 1: Backend (port 3030)
cd server
npm start

# Terminal 2: Frontend (port 5173)
cd public
npm run dev
```

### 5. **Access Application**

Open browser to: **http://localhost:5173**

---

## Frontend Testing

### Test 1: Application Loads

**Steps:**
1. Open http://localhost:5173 in browser
2. Check that page loads without errors
3. Verify three tabs visible:
   - Conversational RAG
   - RAGAS Evaluation
   - Settings
4. Open browser DevTools (F12)
5. Check Console tab for any errors

**Expected:**
- ✅ Page loads with white background
- ✅ No red errors in console
- ✅ Three tabs visible and clickable
- ✅ Responsive layout

---

### Test 2: Conversational RAG Tab

**Setup:**
1. Go to Home tab (main RAG interface)
2. Click "Load Knowledge Base" button
3. Wait 10-20 minutes for data loading
4. Once complete, you should see success message

**Test: Create Conversation**

```
Steps:
1. Click "Conversational RAG" tab
2. Click "New Conversation" button
3. Enter title in modal (optional)
4. Click "Add Conversation"

Expected:
✅ New conversation appears in Sessions tab
✅ Message input box ready
✅ Context usage shows 0%
```

**Test: Send Message**

```
Steps:
1. Type question: "How do levboots work?"
2. Press Enter or click send button
3. Wait 6-12 seconds for response
4. View assistant's answer

Expected:
✅ Your message appears in blue bubble
✅ Assistant response appears in gray bubble
✅ Context usage increases
✅ Sources shown below answer
```

**Test: Multiple Messages**

```
Steps:
1. Ask: "What is an Aetheric Field Generator?"
2. Wait for response
3. Ask follow-up: "How does it maintain balance?"
4. See context increase

Expected:
✅ Conversation history preserved
✅ Context usage: ~200-400 tokens per Q&A pair
✅ Both messages visible
✅ Sources updated for each response
```

**Test: Session Management**

```
Steps:
1. Click Sessions tab
2. See list of conversations
3. Click another conversation to switch
4. See different messages load
5. Create new conversation
6. Switch back to first

Expected:
✅ Sessions list shows all conversations
✅ Switching loads correct messages
✅ New session appears at top
✅ Message count updates
```

**Test: Export Conversation**

```
Steps:
1. Go to any conversation
2. Click "Export" button
3. JSON file downloads

Expected:
✅ File: conversation_[timestamp].json
✅ Contains all messages
✅ Includes metadata (created, updated dates)
✅ Sources preserved
```

**Test: Clear Conversation**

```
Steps:
1. Click "Clear Conversation" button
2. Confirm in dialog
3. Check messages cleared

Expected:
✅ Confirmation dialog appears
✅ Messages deleted after confirm
✅ Context usage resets to 0%
✅ Session still exists
```

---

### Test 3: RAGAS Evaluation Tab

**Test: Add Ground Truth Pair**

```
Steps:
1. Click RAGAS Evaluation tab
2. Click Ground Truth Pairs sub-tab
3. Click "Add Pair" button
4. Enter question: "What powers levboots?"
5. Enter answer: "The Aetheric Field Generator creates gravity reversal"
6. Click "Add Pair"

Expected:
✅ Modal appears for input
✅ Pair added to list
✅ Shows question and expected answer
✅ Timestamp displayed
```

**Test: Run Evaluation**

```
Steps:
1. Go to Overview sub-tab
2. Click "Run Evaluation" button
3. Watch progress bar
4. Wait 1-2 minutes

Expected:
✅ Modal shows progress
✅ Percentage increases
✅ "X% complete" message
✅ Results appear when done
```

**Test: View Metrics**

```
After evaluation completes:
1. See 4 metric cards:
   - RAGAS Score (center)
   - Faithfulness (left)
   - Relevance (right)
   - Coherence (bottom)
2. Each shows percentage 0-100
3. Color codes:
   - Green: 80+
   - Yellow: 60-80
   - Orange: 40-60
   - Red: <40

Expected:
✅ All 4 metrics displayed
✅ Colored progress bars
✅ Quality level badge (Excellent/Good/Fair/Poor)
✅ Recommendations shown
```

**Test: View Results Table**

```
Steps:
1. Click Results sub-tab
2. See table with columns:
   - Question ID
   - RAGAS Score
   - Faithfulness
   - Relevance
   - Coherence
   - Date

Expected:
✅ All evaluations listed
✅ Color-coded scores
✅ Dates formatted correctly
✅ Can scroll if many results
```

**Test: View Trends**

```
Steps:
1. Click Trends sub-tab
2. See line chart
3. X-axis: dates
4. Y-axis: average scores

Expected:
✅ Chart loads
✅ Shows score progression
✅ Multiple data points if available
✅ Tooltip on hover (desktop)
```

**Test: Export Evaluation Data**

```
Steps:
1. From Overview tab
2. Click "Export Metrics" button
3. JSON file downloads

Expected:
✅ File: ragas_data_[timestamp].json
✅ Contains ground truth pairs
✅ Contains evaluation results
✅ Contains metrics and trends
```

---

### Test 4: Settings Tab

**Test: View All Settings**

```
Steps:
1. Click Settings tab
2. See tabs: Features, LLM & RAG, API & Embeddings, Advanced, Export
3. Click each tab

Expected:
✅ All 5 tabs visible
✅ Settings load without errors
✅ Values show defaults
```

**Test: Modify Settings**

```
Steps:
1. Go to LLM & RAG tab
2. Move Temperature slider to 0.5
3. Change Max Tokens to 1024
4. Adjust Similarity Threshold to 0.5
5. Click "Save Settings"

Expected:
✅ Slider moves smoothly
✅ Input fields accept values
✅ "Save Settings" button enables
✅ Confirmation message appears
✅ Settings persist (reload page)
```

**Test: Toggle Features**

```
Steps:
1. Go to Features tab
2. Toggle "Conversational RAG" off
3. Toggle "RAGAS Evaluation" off
4. Toggle back on
5. Click "Save Settings"

Expected:
✅ Switches toggle on/off
✅ UI updates dynamically
✅ "Save Settings" button enables
✅ Settings persist
```

**Test: Use Preset**

```
Steps:
1. Go to LLM & RAG tab
2. Look for preset buttons
3. Click "Creative" preset
4. See temperature increase
5. See topP increase
6. Save settings

Expected:
✅ Preset buttons visible
✅ Settings change immediately
✅ Temperature: 1.2
✅ TopP: 0.9
✅ TopKChunks: 8
```

**Test: Reset to Defaults**

```
Steps:
1. Any tab
2. Click "Reset to Defaults" button (footer)
3. Confirm action
4. See all values reset

Expected:
✅ Confirmation dialog appears
✅ All settings return to defaults
✅ Temperature back to 0.7
✅ MaxTokens back to 2048
```

**Test: Export Settings**

```
Steps:
1. Go to Export tab
2. Click "Download Settings"
3. JSON file downloads

Expected:
✅ File: settings_[timestamp].json
✅ Contains all 24+ settings
✅ Properly formatted JSON
```

---

## API Testing

### Setup: Get API Tools

**Option A: cURL (command line)**
```bash
# Already installed on most systems
curl --version
```

**Option B: Postman (GUI)**
```bash
# Download from https://www.postman.com/downloads/
# Import collection from repository
```

**Option C: REST Client (VS Code)**
```bash
# Install extension: REST Client
# Create file: test.http
```

---

### Test 1: Core RAG API

**Load Knowledge Base**

```bash
curl -X POST http://localhost:3030/api/load_data \
  -H "Content-Type: application/json"

# Expected Response (200):
# {
#   "ok": true,
#   "message": "Data loaded successfully..."
# }
```

**Ask Question**

```bash
curl -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

# Expected Response (200):
# {
#   "answer": "LevBoots work by...",
#   "sources": ["White Paper...", "OpEd..."],
#   "bibliography": ["White Paper...", "OpEd..."]
# }
```

---

### Test 2: Conversational RAG API

**Create Session**

```bash
curl -X POST http://localhost:3030/api/conversational/session/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Conversation"}'

# Expected Response (201):
# {
#   "ok": true,
#   "session": {
#     "sessionId": "session_1705...",
#     "title": "Test Conversation",
#     "messages": [],
#     "contextUsage": 0
#   }
# }
```

**Send Message**

```bash
# Replace SESSION_ID with actual ID from create response
curl -X POST http://localhost:3030/api/conversational/session/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

# Expected Response (200):
# {
#   "ok": true,
#   "userMessage": {...},
#   "assistantMessage": {...},
#   "ragResponse": {...},
#   "contextUsage": 600
# }
```

**Get Session**

```bash
curl http://localhost:3030/api/conversational/session/SESSION_ID

# Expected Response (200):
# {
#   "ok": true,
#   "session": {
#     "sessionId": "session_...",
#     "messages": [...],
#     "contextUsage": 600
#   }
# }
```

**Get All Sessions**

```bash
curl http://localhost:3030/api/conversational/sessions

# Expected Response (200):
# {
#   "ok": true,
#   "count": 3,
#   "sessions": [...]
# }
```

**Export Session**

```bash
curl http://localhost:3030/api/conversational/session/SESSION_ID/export \
  -o conversation.json

# File saves to: conversation.json
```

---

### Test 3: RAGAS API

**Add Ground Truth Pair**

```bash
curl -X POST http://localhost:3030/api/ragas/ground-truth/add \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main component?",
    "expectedAnswer": "The Aetheric Field Generator..."
  }'

# Expected Response (201):
# {
#   "ok": true,
#   "pair": {
#     "id": "pair_1705...",
#     "question": "...",
#     "expectedAnswer": "..."
#   }
# }
```

**Evaluate Answer**

```bash
curl -X POST http://localhost:3030/api/ragas/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "pairId": "pair_1705...",
    "actualAnswer": "The Aetheric Field Generator creates gravity reversal"
  }'

# Expected Response (200):
# {
#   "ok": true,
#   "result": {
#     "ragas_score": 82.33,
#     "faithfulness": 85.5,
#     "relevance": 78.25,
#     "coherence": 83.17
#   }
# }
```

**Get Metrics**

```bash
curl http://localhost:3030/api/ragas/metrics

# Expected Response (200):
# {
#   "ok": true,
#   "metrics": {
#     "totalEvaluations": 5,
#     "avgRagasScore": 78.45,
#     "avgFaithfulness": 81.23,
#     ...
#   }
# }
```

**Get Trends**

```bash
curl http://localhost:3030/api/ragas/trends

# Expected Response (200):
# {
#   "ok": true,
#   "count": 3,
#   "trends": [
#     {"date": "2024-01-10", "avgScore": 75.23, "count": 3},
#     ...
#   ]
# }
```

---

### Test 4: Settings API

**Get Settings**

```bash
curl http://localhost:3030/api/settings

# Expected Response (200):
# {
#   "ok": true,
#   "settings": {
#     "temperature": 0.7,
#     "maxTokens": 2048,
#     ...
#   }
# }
```

**Update Settings**

```bash
curl -X PUT http://localhost:3030/api/settings \
  -H "Content-Type: application/json" \
  -d '{"temperature": 0.8, "maxTokens": 4096}'

# Expected Response (200):
# {
#   "ok": true,
#   "settings": {
#     "temperature": 0.8,
#     "maxTokens": 4096,
#     ...
#   }
# }
```

**Update Single Setting**

```bash
curl -X PATCH http://localhost:3030/api/settings/temperature \
  -H "Content-Type: application/json" \
  -d '{"value": 0.9}'

# Expected Response (200):
# {
#   "ok": true,
#   "settings": {
#     "temperature": 0.9,
#     ...
#   }
# }
```

**Get Recommendations**

```bash
curl -X POST http://localhost:3030/api/settings/recommended \
  -H "Content-Type: application/json" \
  -d '{"useCase": "creative"}'

# Expected Response (200):
# {
#   "ok": true,
#   "useCase": "creative",
#   "recommended": {
#     "temperature": 1.2,
#     "topP": 0.9,
#     "similarityThreshold": 0.25,
#     "topKChunks": 8
#   }
# }
```

---

## Feature Testing

### Feature 1: Complete Conversation Flow

**Scenario: Research about levboots**

```
1. Load knowledge base
   - Click "Load Knowledge Base" in Home tab
   - Wait for completion

2. Start conversation
   - Click Conversational RAG tab
   - Click "New Conversation"
   - Enter title: "LevBoots Research"

3. Ask initial question
   - Type: "What are the main applications of levboots?"
   - Press Enter
   - View answer and sources

4. Ask follow-up
   - Type: "How do they compare to traditional transportation?"
   - View context usage increase
   - See sources again

5. Export conversation
   - Click "Export"
   - Save JSON file
   - Verify file contains all messages

Expected:
✅ Knowledge base loaded (shows data in logs)
✅ Session created with initial message
✅ Follow-up maintains context
✅ Context usage: ~400-800 tokens
✅ Export works and file valid
```

---

### Feature 2: Complete Evaluation Flow

**Scenario: Quality assessment**

```
1. Add ground truth pairs
   - Go to RAGAS tab
   - Add 3-5 Q&A pairs about levboots

2. Run evaluation
   - Go to Overview
   - Click "Run Evaluation"
   - Watch progress bar

3. Review metrics
   - See RAGAS score
   - See 3 component scores
   - Check quality level badge

4. Analyze trends
   - Go to Trends tab
   - See line chart
   - View score progression

5. Export data
   - Click "Export Metrics"
   - Save JSON file

Expected:
✅ Pairs added successfully
✅ Evaluation completes (1-2 min)
✅ Metrics show realistic scores (50-80)
✅ Trends display properly
✅ Export includes all data
```

---

### Feature 3: Settings Persistence

**Scenario: Customization**

```
1. Change settings
   - Go to Settings tab
   - Set Temperature to 0.3
   - Set Max Tokens to 1024
   - Click Save

2. Refresh page
   - Press F5 or Cmd+R
   - Check settings persist

3. Reload app
   - Close browser tab
   - Open http://localhost:5173
   - Go to Settings
   - Verify values still changed

4. Use in conversation
   - Start new conversation
   - Send question
   - Verify lower temperature = more consistent

Expected:
✅ Settings save
✅ Persist across page refreshes
✅ Persist across sessions
✅ Settings applied to API calls
```

---

## Performance Testing

### Load Testing - Frontend

**Measure page load time:**

```bash
# Check browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check Finish time

Expected:
✅ <3 seconds for initial load
✅ <500ms for JS bundle
✅ <200ms for API response
```

**Measure API response time:**

```bash
# Get average response time
curl -w "Time taken: %{time_total}s\n" \
  -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

Expected:
✅ 6-12 seconds total
✅ 1-2s for embedding
✅ 5-10s for LLM
```

---

### Memory Testing

**Monitor server memory:**

```bash
# Terminal 1: Start server with monitoring
node --max-old-space-size=4096 server/dist/server.js

# Terminal 2: Monitor memory
top -p $(pgrep -f "node")
# or
ps aux | grep node
```

**Load testing script:**

```bash
# Send 10 requests
for i in {1..10}; do
  curl -X POST http://localhost:3030/api/ask \
    -H "Content-Type: application/json" \
    -d '{"userQuestion":"Test question '$i'"}'
  sleep 2
done
```

---

### Stress Testing

**Multiple concurrent conversations:**

```bash
# Start 5 conversations in parallel
for i in {1..5}; do
  (
    # Create session
    SESSION=$(curl -s -X POST http://localhost:3030/api/conversational/session/create \
      -H "Content-Type: application/json" \
      -d '{"title":"Test '$i'"}' | jq -r '.session.sessionId')

    # Send 3 messages each
    for j in {1..3}; do
      curl -X POST http://localhost:3030/api/conversational/session/$SESSION/message \
        -H "Content-Type: application/json" \
        -d '{"userQuestion":"Question '$j'"}'
    done
  ) &
done
wait

echo "All tests completed"
```

---

## Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check for syntax errors
npm run build
```

---

### Issue: API returns 404

**Solution:**
```bash
# Check server is running
curl http://localhost:3030/api/ask

# Check server logs
tail -f logs/server.log

# Verify route exists
npm run build && npm start
```

---

### Issue: Database connection failed

**Solution:**
```bash
# Check connection string
cat server/.env

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check pgvector extension
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

---

### Issue: Embedding API rate limit

**Solution:**
```bash
# Wait 1-2 hours for reset
# Or upgrade to paid tier
# Or use different embedding model

# In the meantime, test with mock data
npm run test -- --mock-embeddings
```

---

### Issue: Frontend shows blank page

**Solution:**
```bash
# Check frontend is running
curl http://localhost:5173

# Check vite server logs
# Look for port 5173 in terminal

# Rebuild frontend
cd public
npm run build
npm run preview
```

---

## CI/CD Testing

### Local Test Before Push

```bash
#!/bin/bash

echo "🧪 Running tests..."

# Type check
npm run type-check || exit 1

# Lint
npm run lint || exit 1

# Format
npm run format || exit 1

# Build
npm run build || exit 1

# Tests
npm test || exit 1

echo "✅ All tests passed!"
```

### GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: pgvector/pgvector:pg15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci

      - run: npm run type-check

      - run: npm run lint

      - run: npm test

      - run: npm run build
```

---

## Test Checklist

### Before Deployment

- [ ] Frontend loads without errors
- [ ] All 3 tabs accessible (Conversational, RAGAS, Settings)
- [ ] Knowledge base loads successfully
- [ ] Can ask questions and get answers
- [ ] Conversational sessions work
- [ ] Can add ground truth pairs
- [ ] Can run evaluations
- [ ] Metrics display correctly
- [ ] Settings save and persist
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] ESLint passes
- [ ] Performance acceptable (<15s per query)
- [ ] All features work end-to-end

---

## Summary

**To test the application:**

1. **Setup**: Install deps, configure .env, start servers
2. **Frontend**: Test UI in browser, all tabs functional
3. **API**: Use curl or Postman to test endpoints
4. **Features**: Test each feature completely
5. **Performance**: Monitor load times and memory
6. **Production**: Run full test suite before deploy

**Quick Start:**
```bash
npm install
npm run dev          # Starts both servers
# Open http://localhost:5173
```

**Test All Features:**
```bash
# Load KB
curl -X POST http://localhost:3030/api/load_data

# Ask question
curl -X POST http://localhost:3030/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

# Create conversation
curl -X POST http://localhost:3030/api/conversational/session/create

# Check settings
curl http://localhost:3030/api/settings
```

---

*Last Updated: January 14, 2024*
*All tests should pass ✅*