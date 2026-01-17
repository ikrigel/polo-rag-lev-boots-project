# RAG System API Documentation

## Overview

This document describes all available API endpoints for the LevBoots RAG System, including:
- Core RAG endpoints (original functionality)
- Conversational RAG (multi-turn conversations)
- RAGAS Evaluation (quality assessment)
- Settings Management (user preferences)

---

## Core RAG Endpoints

### POST /api/load_data
Load and embed all knowledge base sources (PDFs, articles, Slack messages).

**Request:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Data loaded successfully. Added 33 chunks to knowledge base."
}
```

**Response (Error - 400/500):**
```json
{
  "ok": false,
  "error": "Error message describing what failed"
}
```

**Performance:**
- First run: 10-20 minutes (API rate limits)
- Subsequent runs: Instant (skipped if data exists)

---

### POST /api/ask
Ask a question and get a RAG-generated answer with sources.

**Request:**
```json
{
  "userQuestion": "How do levboots work?"
}
```

**Response (Success - 200):**
```json
{
  "answer": "LevBoots work by using an Aetheric Field Generator that creates a localized gravity reversal...",
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

**Response (Error - 400/500):**
```json
{
  "answer": "",
  "error": "Error message",
  "sources": [],
  "bibliography": []
}
```

**Response Time:** 6-12 seconds (1-2s embedding + 5-10s LLM)

---

## Conversational RAG Endpoints

Enable multi-turn conversations with context management and session persistence.

### POST /api/conversational/session/create
Create a new conversation session.

**Request:**
```json
{
  "title": "Technical Discussion (optional)"
}
```

**Response (Success - 201):**
```json
{
  "ok": true,
  "session": {
    "sessionId": "session_1705123456789_abc123def",
    "title": "Technical Discussion",
    "messages": [],
    "createdAt": 1705123456789,
    "updatedAt": 1705123456789,
    "contextUsage": 0,
    "metadata": {
      "totalQuestions": 0,
      "totalResponses": 0,
      "avgResponseTime": 0
    }
  }
}
```

---

### GET /api/conversational/sessions
List all active conversation sessions.

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 3,
  "sessions": [
    {
      "sessionId": "session_1705123456789_abc123def",
      "title": "Technical Discussion",
      "messages": [...],
      "createdAt": 1705123456789,
      "updatedAt": 1705123456789,
      "contextUsage": 450,
      "metadata": {
        "totalQuestions": 5,
        "totalResponses": 5,
        "avgResponseTime": 0
      }
    }
  ]
}
```

---

### GET /api/conversational/session/:sessionId
Get details of a specific session.

**Request:**
```
GET /api/conversational/session/session_1705123456789_abc123def
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "session": {
    "sessionId": "session_1705123456789_abc123def",
    "title": "Technical Discussion",
    "messages": [...],
    "createdAt": 1705123456789,
    "updatedAt": 1705123456789,
    "contextUsage": 450,
    "metadata": {...}
  }
}
```

**Response (Error - 404):**
```json
{
  "ok": false,
  "error": "Session not found"
}
```

---

### POST /api/conversational/session/:sessionId/message
Send a message and get a response within a conversation.

**Request:**
```json
{
  "userQuestion": "Can you explain more about the Aetheric Field?"
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "userMessage": {
    "id": "msg_1705123456789_xyz789",
    "role": "user",
    "content": "Can you explain more about the Aetheric Field?",
    "timestamp": 1705123456789,
    "questionType": "knowledge"
  },
  "assistantMessage": {
    "id": "msg_1705123456790_uvw456",
    "role": "assistant",
    "content": "The Aetheric Field Generator is the core component...",
    "timestamp": 1705123456790,
    "sources": ["White Paper - The Development of Localized Gravity Reversal Technology.pdf"]
  },
  "ragResponse": {
    "answer": "The Aetheric Field Generator is the core component...",
    "sources": ["White Paper - The Development of Localized Gravity Reversal Technology.pdf"],
    "bibliography": ["White Paper - The Development of Localized Gravity Reversal Technology.pdf"]
  },
  "contextUsage": 600
}
```

**Features:**
- Automatic question type classification (knowledge, general, clarification)
- Source attribution
- Context usage tracking
- Full conversation memory maintained

---

### GET /api/conversational/session/:sessionId/messages
Get all messages from a conversation.

**Request:**
```
GET /api/conversational/session/session_1705123456789_abc123def/messages
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 5,
  "messages": [
    {
      "id": "msg_1705123456789_xyz789",
      "role": "user",
      "content": "How do levboots work?",
      "timestamp": 1705123456789,
      "questionType": "knowledge"
    },
    {
      "id": "msg_1705123456790_uvw456",
      "role": "assistant",
      "content": "LevBoots work by...",
      "timestamp": 1705123456790,
      "sources": ["White Paper - The Development of Localized Gravity Reversal Technology.pdf"]
    }
  ]
}
```

---

### POST /api/conversational/session/:sessionId/clear
Clear all messages in a conversation (keep session metadata).

**Request:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Session cleared successfully"
}
```

---

### GET /api/conversational/session/:sessionId/stats
Get conversation statistics and metrics.

**Request:**
```
GET /api/conversational/session/session_1705123456789_abc123def/stats
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "stats": {
    "sessionId": "session_1705123456789_abc123def",
    "title": "Technical Discussion",
    "messageCount": 10,
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-14T10:45:00.000Z",
    "ageMinutes": 15,
    "contextUsage": {
      "current": 1200,
      "max": 2000,
      "percentage": 60
    },
    "metadata": {
      "totalQuestions": 5,
      "totalResponses": 5,
      "avgResponseTime": 0
    }
  }
}
```

---

### GET /api/conversational/session/:sessionId/export
Export session as JSON file for backup or sharing.

**Request:**
```
GET /api/conversational/session/session_1705123456789_abc123def/export
```

**Response (Success - 200):**
```json
{
  "session": {
    "sessionId": "session_1705123456789_abc123def",
    "title": "Technical Discussion",
    "createdAt": "2024-01-14T10:30:00.000Z",
    "updatedAt": "2024-01-14T10:45:00.000Z",
    "metadata": {
      "totalQuestions": 5,
      "totalResponses": 5,
      "avgResponseTime": 0
    }
  },
  "messages": [
    {
      "role": "user",
      "content": "How do levboots work?",
      "timestamp": "2024-01-14T10:30:15.000Z",
      "questionType": "knowledge",
      "sources": null
    }
  ]
}
```

**Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="session_session_1705123456789_abc123def.json"
```

---

## RAGAS Evaluation Endpoints

Quality assessment system for RAG answers using faithfulness, relevance, and coherence metrics.

### POST /api/ragas/ground-truth/add
Add a ground truth Q&A pair for evaluation.

**Request:**
```json
{
  "question": "What is the main component of LevBoots?",
  "expectedAnswer": "The Aetheric Field Generator is the main component that creates localized gravity reversal."
}
```

**Response (Success - 201):**
```json
{
  "ok": true,
  "pair": {
    "id": "pair_1705123456789_abc123",
    "question": "What is the main component of LevBoots?",
    "expectedAnswer": "The Aetheric Field Generator is the main component...",
    "createdAt": 1705123456789
  }
}
```

---

### GET /api/ragas/ground-truth/list
List all ground truth Q&A pairs.

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 3,
  "pairs": [
    {
      "id": "pair_1705123456789_abc123",
      "question": "What is the main component of LevBoots?",
      "expectedAnswer": "The Aetheric Field Generator...",
      "createdAt": 1705123456789
    }
  ]
}
```

---

### GET /api/ragas/ground-truth/:pairId
Get a specific ground truth pair.

**Request:**
```
GET /api/ragas/ground-truth/pair_1705123456789_abc123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "pair": {
    "id": "pair_1705123456789_abc123",
    "question": "What is the main component of LevBoots?",
    "expectedAnswer": "The Aetheric Field Generator...",
    "createdAt": 1705123456789
  }
}
```

---

### DELETE /api/ragas/ground-truth/:pairId
Delete a ground truth pair.

**Request:**
```
DELETE /api/ragas/ground-truth/pair_1705123456789_abc123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Ground truth pair deleted successfully"
}
```

---

### POST /api/ragas/evaluate
Evaluate an answer against a ground truth pair.

**Request:**
```json
{
  "pairId": "pair_1705123456789_abc123",
  "actualAnswer": "LevBoots use an Aetheric Field Generator for gravity control."
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "result": {
    "pairId": "pair_1705123456789_abc123",
    "actualAnswer": "LevBoots use an Aetheric Field Generator for gravity control.",
    "ragas_score": 82.33,
    "faithfulness": 85.5,
    "relevance": 78.25,
    "coherence": 83.17,
    "timestamp": 1705123456790
  }
}
```

**Metrics Explanation:**
- **RAGAS Score**: Average of all three metrics (0-100)
- **Faithfulness**: How much of the answer is supported by expected answer (0-100)
- **Relevance**: How much of the expected answer is in the actual answer (0-100)
- **Coherence**: Quality of sentence structure and formatting (0-100)

---

### POST /api/ragas/batch-evaluate
Evaluate multiple answers at once.

**Request:**
```json
{
  "evaluations": [
    {
      "pairId": "pair_1705123456789_abc123",
      "actualAnswer": "LevBoots use an Aetheric Field Generator..."
    },
    {
      "pairId": "pair_1705123456790_def456",
      "actualAnswer": "The Stabilized Coil Array maintains balance..."
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 2,
  "results": [
    {
      "pairId": "pair_1705123456789_abc123",
      "ragas_score": 82.33,
      "faithfulness": 85.5,
      "relevance": 78.25,
      "coherence": 83.17,
      "timestamp": 1705123456790
    }
  ]
}
```

---

### GET /api/ragas/results/:pairId
Get all evaluation results for a specific pair.

**Request:**
```
GET /api/ragas/results/pair_1705123456789_abc123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 5,
  "results": [
    {
      "pairId": "pair_1705123456789_abc123",
      "actualAnswer": "...",
      "ragas_score": 82.33,
      "faithfulness": 85.5,
      "relevance": 78.25,
      "coherence": 83.17,
      "timestamp": 1705123456790
    }
  ]
}
```

---

### GET /api/ragas/metrics
Get aggregate evaluation metrics across all evaluations.

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "metrics": {
    "totalEvaluations": 15,
    "avgRagasScore": 78.45,
    "avgFaithfulness": 81.23,
    "avgRelevance": 76.78,
    "avgCoherence": 77.33,
    "results": [
      {
        "pairId": "pair_1705123456789_abc123",
        "ragas_score": 82.33,
        "faithfulness": 85.5,
        "relevance": 78.25,
        "coherence": 83.17,
        "timestamp": 1705123456790
      }
    ]
  }
}
```

---

### GET /api/ragas/trends
Get score trends over time (daily aggregation).

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "count": 5,
  "trends": [
    {
      "date": "2024-01-10",
      "avgScore": 75.23,
      "count": 3
    },
    {
      "date": "2024-01-11",
      "avgScore": 78.45,
      "count": 5
    },
    {
      "date": "2024-01-12",
      "avgScore": 80.12,
      "count": 7
    }
  ]
}
```

---

### GET /api/ragas/distribution
Get score distribution statistics (percentiles and buckets).

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "distribution": {
    "distribution": {
      "0-20": 0,
      "20-40": 1,
      "40-60": 2,
      "60-80": 8,
      "80-100": 4
    },
    "percentiles": {
      "p50": 75.23,
      "p75": 82.15,
      "p90": 88.45,
      "p95": 92.10
    }
  }
}
```

---

### GET /api/ragas/report
Get comprehensive quality assessment report.

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "report": {
    "timestamp": "2024-01-14T10:45:00.000Z",
    "summaryMetrics": {
      "totalEvaluations": 15,
      "avgRagasScore": 78.45,
      "avgFaithfulness": 81.23,
      "avgRelevance": 76.78,
      "avgCoherence": 77.33,
      "results": [...]
    },
    "qualityLevel": "Good",
    "trends": [...],
    "distribution": {...},
    "recommendations": [
      "Improve retrieval to surface more relevant information",
      "Enhance answer formatting and structure"
    ]
  }
}
```

**Quality Levels:**
- `Excellent`: RAGAS score >= 80
- `Good`: RAGAS score 60-80
- `Fair`: RAGAS score 40-60
- `Poor`: RAGAS score < 40

---

### GET /api/ragas/export
Export all RAGAS evaluation data as JSON.

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "groundTruthPairs": [...],
  "evaluationResults": [...],
  "metrics": {...},
  "trends": [...],
  "exportedAt": "2024-01-14T10:45:00.000Z"
}
```

**Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="ragas_data_1705123456789.json"
```

---

## Settings Management Endpoints

User preferences and configuration management.

### GET /api/settings
Get current settings for user.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```
GET /api/settings?userId=user123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "settings": {
    "enableConversationalRAG": true,
    "enableRagAsEvaluation": true,
    "enableAnalytics": true,
    "enableConversationHistory": true,
    "enableAutoSave": true,
    "theme": "auto",
    "temperature": 0.7,
    "maxTokens": 2048,
    "topP": 0.95,
    "similarityThreshold": 0.3,
    "topKChunks": 5,
    "contextWindowSize": 2000,
    "apiTimeout": 30,
    "retryAttempts": 3,
    "embeddingDimension": 768,
    "embeddingModel": "text-embedding-004",
    "enableNotifications": true,
    "notificationLevel": "warnings",
    "debugMode": false,
    "logLevel": "info",
    "createdAt": 1705123456789,
    "updatedAt": 1705123456789,
    "version": "1.0.0"
  }
}
```

---

### PUT /api/settings
Update multiple settings for user.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{
  "temperature": 0.5,
  "maxTokens": 4096,
  "theme": "dark",
  "enableConversationalRAG": false
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "settings": {
    "temperature": 0.5,
    "maxTokens": 4096,
    "theme": "dark",
    "enableConversationalRAG": false,
    "updatedAt": 1705123456790,
    ...
  }
}
```

---

### PATCH /api/settings/:key
Update a single setting.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{
  "value": 0.8
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "settings": {
    "temperature": 0.8,
    "updatedAt": 1705123456790,
    ...
  }
}
```

---

### GET /api/settings/:key
Get a specific setting value.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```
GET /api/settings/temperature?userId=user123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "key": "temperature",
  "value": 0.7
}
```

---

### POST /api/settings/reset
Reset all settings to defaults.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Settings reset to defaults",
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2048,
    ...
  }
}
```

---

### POST /api/settings/validate
Validate all settings for conflicts or issues.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [
      "High max tokens with low temperature may produce repetitive output"
    ]
  }
}
```

---

### GET /api/settings/summary
Get human-readable settings summary.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "summary": {
    "featuresEnabled": {
      "conversationalRAG": true,
      "ragAsEvaluation": true,
      "analytics": true,
      "conversationHistory": true,
      "autoSave": true,
      "notifications": true
    },
    "theme": "auto",
    "llmParameters": {
      "temperature": 0.7,
      "maxTokens": 2048,
      "topP": 0.95
    },
    "ragConfiguration": {
      "similarityThreshold": 0.3,
      "topKChunks": 5,
      "contextWindowSize": 2000
    },
    "apiConfiguration": {
      "timeout": 30,
      "retryAttempts": 3
    },
    "embeddings": {
      "dimension": 768,
      "model": "text-embedding-004"
    },
    "logging": {
      "debugMode": false,
      "logLevel": "info"
    },
    "metadata": {
      "createdAt": "2024-01-14T10:30:00.000Z",
      "updatedAt": "2024-01-14T10:45:00.000Z",
      "version": "1.0.0"
    }
  }
}
```

---

### POST /api/settings/recommended
Get recommended settings for a specific use case.

**Request:**
```json
{
  "useCase": "creative"
}
```

**Accepted use cases:**
- `creative`: High temperature (1.2), broad search (threshold 0.25, topK 8)
- `balanced`: Default settings
- `precise`: Low temperature (0.3), strict search (threshold 0.5, topK 3)

**Response (Success - 200):**
```json
{
  "ok": true,
  "useCase": "creative",
  "recommended": {
    "temperature": 1.2,
    "topP": 0.9,
    "similarityThreshold": 0.25,
    "topKChunks": 8
  }
}
```

---

### POST /api/settings/export
Export settings as JSON file.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{}
```

**Response (Success - 200):**
```json
{
  "enableConversationalRAG": true,
  "temperature": 0.7,
  ...
}
```

**Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="settings_global_1705123456789.json"
```

---

### POST /api/settings/import
Import settings from JSON.

**Query Parameters:**
- `userId` (optional): User ID (defaults to 'global')

**Request:**
```json
{
  "jsonData": "{\"temperature\": 0.8, \"maxTokens\": 4096, ...}"
}
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "Settings imported successfully",
  "settings": {
    "temperature": 0.8,
    "maxTokens": 4096,
    ...
  }
}
```

---

### GET /api/settings/admin/all
Get all users' settings (admin endpoint).

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 3,
    "users": [
      {
        "userId": "user123",
        "featuresEnabled": "Yes",
        "updatedAt": "2024-01-14T10:45:00.000Z"
      },
      {
        "userId": "global",
        "featuresEnabled": "Yes",
        "updatedAt": "2024-01-14T10:30:00.000Z"
      }
    ]
  }
}
```

---

### GET /api/settings/admin/stats
Get settings statistics across all users (admin endpoint).

**Request:**
```
No body required
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "stats": {
    "totalUsers": 3,
    "enabledFeatures": {
      "conversationalRAG": 3,
      "ragAsEvaluation": 2,
      "analytics": 3,
      "conversationHistory": 3
    },
    "averageSettings": {
      "temperature": 0.73,
      "maxTokens": 2341,
      "similarityThreshold": 0.32
    }
  }
}
```

---

### DELETE /api/settings/user/:userId
Delete all settings for a user (admin endpoint).

**Request:**
```
DELETE /api/settings/user/user123
```

**Response (Success - 200):**
```json
{
  "ok": true,
  "message": "User settings deleted successfully"
}
```

---

## Error Handling

All endpoints follow consistent error handling:

### Common Error Codes

**400 Bad Request** - Invalid input or missing required fields
```json
{
  "ok": false,
  "error": "userQuestion is required"
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "ok": false,
  "error": "Session not found"
}
```

**500 Internal Server Error** - Server-side issue
```json
{
  "ok": false,
  "error": "Failed to get answer for question"
}
```

---

## Rate Limiting & Performance

**Embedding Generation:**
- Per chunk: 0.3-0.5 seconds
- Rate limiting: 1 second delay between requests
- First load: 10-20 minutes (full knowledge base)

**Query Response:**
- Embedding query: 1-2 seconds
- Similarity search: <100ms
- LLM generation: 5-10 seconds
- Total: ~6-12 seconds per question

**Session Management:**
- Session creation: <10ms
- Message adding: <50ms
- Context calculation: <10ms

---

## Authentication & Authorization

Currently, settings endpoints support:
- **Global settings**: `userId` defaults to 'global'
- **Per-user settings**: Pass `userId` query parameter
- **Admin functions**: `/admin/*` endpoints (currently unrestricted)

For production, implement:
- JWT token validation
- User ID extraction from token
- Role-based access control (RBAC)
- Rate limiting per user

---

## Integration Examples

### JavaScript/Fetch

```javascript
// Create a conversation session
const response = await fetch('/api/conversational/session/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'My Conversation' })
});
const { session } = await response.json();

// Send a message
const msgResponse = await fetch(
  `/api/conversational/session/${session.sessionId}/message`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userQuestion: 'How do levboots work?' })
  }
);
const { assistantMessage } = await msgResponse.json();
```

### cURL

```bash
# Create session
curl -X POST http://localhost:3030/api/conversational/session/create \
  -H "Content-Type: application/json" \
  -d '{"title":"My Chat"}'

# Send message
curl -X POST http://localhost:3030/api/conversational/session/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'

# Get metrics
curl http://localhost:3030/api/ragas/metrics

# Update settings
curl -X PUT http://localhost:3030/api/settings \
  -H "Content-Type: application/json" \
  -d '{"temperature":0.8,"theme":"dark"}'
```

### Python

```python
import requests

# Create session
response = requests.post(
    'http://localhost:3030/api/conversational/session/create',
    json={'title': 'My Conversation'}
)
session = response.json()['session']

# Send message
msg_response = requests.post(
    f'http://localhost:3030/api/conversational/session/{session["sessionId"]}/message',
    json={'userQuestion': 'How do levboots work?'}
)
assistant_msg = msg_response.json()['assistantMessage']
```

---

## Debugging

### Enable Debug Mode

```bash
# Get current debug status
curl http://localhost:3030/api/settings/debugMode

# Enable debugging
curl -X PATCH http://localhost:3030/api/settings/debugMode \
  -H "Content-Type: application/json" \
  -d '{"value":true}'

# Check logs
tail -f logs/server.log
```

### Performance Profiling

```bash
# Get session stats with timing info
curl http://localhost:3030/api/conversational/session/SESSION_ID/stats

# Get evaluation metrics and trends
curl http://localhost:3030/api/ragas/report
```

---

## Changelog

### Version 1.0.0 (Current)

**Phase 1: Conversational RAG**
- Multi-turn conversation support
- Session management with persistence
- Context window tracking

**Phase 2: RAGAS Evaluation**
- Quality assessment metrics
- Ground truth management
- Trend analysis and reporting

**Phase 3: Settings Management**
- User preferences storage
- Configuration validation
- Import/export functionality

---

## Support & Troubleshooting

**Session not found**
- Verify sessionId format
- Sessions expire after 24 hours
- Check available sessions: `GET /api/conversational/sessions`

**Evaluation returning low scores**
- Verify ground truth pairs are accurate
- Check similarity threshold is appropriate
- Review retrieved chunks relevance

**Settings validation errors**
- Check value types match expected schema
- Verify numeric ranges (e.g., 0-1 for topP)
- See validation rules in Settings.ts

For more help, check logs at `logs/server.log`