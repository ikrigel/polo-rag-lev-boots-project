# LevBoots RAG System - Features Guide

Comprehensive guide to using the three major feature sets: Conversational RAG, RAGAS Evaluation, and Settings Management.

---

## Table of Contents

1. [Conversational RAG](#conversational-rag)
2. [RAGAS Evaluation](#ragas-evaluation)
3. [Settings Management](#settings-management)
4. [Integration Guide](#integration-guide)
5. [Best Practices](#best-practices)

---

## Conversational RAG

Enable multi-turn conversations with persistent context and conversation history.

### Overview

**Conversational RAG** extends the basic RAG system to support:
- Multi-turn conversations (ask follow-up questions)
- Automatic conversation history tracking
- Context window management (prevents context overflow)
- Session persistence (resume conversations later)
- Conversation export/import

### Frontend Usage

#### Access the Feature

Navigate to the **Conversational RAG** tab in the application:

```
Home > Tabs > Conversational RAG
```

#### Create a New Conversation

1. Click **"New Conversation"** button
2. A new tab appears in the **Sessions** panel
3. Click the tab to switch to it
4. Start typing questions in the input field

#### Send a Message

1. Type your question in the input box
2. Press **Enter** or **Shift+Enter** to send
3. Wait for the assistant's response
4. View sources and bibliography below the answer
5. Ask follow-up questions - context is automatically maintained

#### Monitor Context Usage

- **Context bar** shows usage (e.g., "450 / 2000 tokens")
- **Visual indicator** shows percentage
- **Red warning** appears when >80% full
- **Auto-suggestion** to clear if getting full

#### Manage Conversations

**Switch between conversations:**
- Click any conversation in the **Sessions** tab
- Messages load automatically
- Context resumes from where you left off

**Clear messages:**
- Click **"Clear Conversation"** button
- Confirm in dialog
- Messages deleted, session kept

**Export conversation:**
- Click **"Export"** button
- JSON file downloads with full conversation history
- Use for backup or sharing

#### Features Visible in UI

- **Message bubbles**: Different colors for user (blue) vs assistant (gray)
- **Timestamps**: When each message was sent
- **Question types**: Badge showing classification (knowledge/general/clarification)
- **Source links**: Clickable sources from retrieved chunks
- **Context usage**: Real-time token counter with warning

### Backend Usage

#### Create a Session Programmatically

```typescript
import * as ConversationalRAG from './BusinessLogic/ConversationalRAG.ts';

// Create new session
const session = ConversationalRAG.createSession('Technical Discussion');
console.log(session.sessionId); // "session_1705123456789_abc123"
```

#### Add Messages

```typescript
// Add user message
const userMsg = ConversationalRAG.addMessage(
  session.sessionId,
  'user',
  'How do levboots work?'
);

// Add assistant message with sources
const assistantMsg = ConversationalRAG.addMessage(
  session.sessionId,
  'assistant',
  'LevBoots work by using an Aetheric Field Generator...',
  ['White Paper - The Development of Localized Gravity Reversal Technology.pdf']
);
```

#### Get Conversation History

```typescript
// Get all messages
const messages = ConversationalRAG.getMessages(session.sessionId);

// Get recent messages respecting context window
const recentMessages = ConversationalRAG.getRecentMessages(
  session.sessionId,
  2000 // max tokens
);
```

#### Check Context Status

```typescript
// Get session stats
const stats = ConversationalRAG.getSessionStats(session.sessionId);
console.log(stats.contextUsage); // { current: 450, max: 2000, percentage: 22 }

// Check if context is full
const isFull = ConversationalRAG.isContextWindowFull(session.sessionId);
if (isFull) {
  ConversationalRAG.compressMessageHistory(session.sessionId);
}
```

#### Export and Import Sessions

```typescript
// Export as JSON string
const jsonStr = ConversationalRAG.exportSession(session.sessionId);
// Save to file or send to client

// Import from JSON string
const imported = ConversationalRAG.importSession(jsonStr);
console.log(imported.sessionId); // New session with imported messages
```

#### List All Sessions

```typescript
const allSessions = ConversationalRAG.listSessions();
console.log(allSessions.length); // Number of active sessions
```

#### Clean Up

```typescript
// Delete a session
const deleted = ConversationalRAG.deleteSession(session.sessionId);

// Clear messages but keep session
ConversationalRAG.clearSession(session.sessionId);
```

### API Integration

#### Create Session

```bash
curl -X POST http://localhost:3030/api/conversational/session/create \
  -H "Content-Type: application/json" \
  -d '{"title":"My Conversation"}'
```

Response:
```json
{
  "ok": true,
  "session": {
    "sessionId": "session_1705123456789_abc123",
    "title": "My Conversation",
    "messages": [],
    "createdAt": 1705123456789,
    "contextUsage": 0
  }
}
```

#### Send Message

```bash
curl -X POST http://localhost:3030/api/conversational/session/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"userQuestion":"How do levboots work?"}'
```

Response:
```json
{
  "ok": true,
  "userMessage": {...},
  "assistantMessage": {...},
  "ragResponse": {...},
  "contextUsage": 600
}
```

#### Get Conversation History

```bash
curl http://localhost:3030/api/conversational/session/SESSION_ID/messages
```

#### Export Conversation

```bash
curl http://localhost:3030/api/conversational/session/SESSION_ID/export \
  -o conversation.json
```

### Configuration

**Default Values:**
- Max context tokens: 2000
- Max messages per session: 50
- Session timeout: 24 hours
- Message token estimate: 100 tokens per message

**Adjust via Settings:**
```bash
# Increase context window
curl -X PATCH http://localhost:3030/api/settings/contextWindowSize \
  -H "Content-Type: application/json" \
  -d '{"value": 3000}'

# Enable/disable feature
curl -X PATCH http://localhost:3030/api/settings/enableConversationalRAG \
  -H "Content-Type: application/json" \
  -d '{"value": true}'
```

### Use Cases

**1. Research Sessions**
- Start conversation with general question
- Ask progressive follow-ups to dive deeper
- Export final conversation as research artifact

**2. Technical Troubleshooting**
- Ask about specific error
- Get answer with sources
- Ask clarification questions based on answer
- Export solution for team

**3. Learning Interactions**
- Initial question about topic
- Follow-ups to understand concepts
- Cross-references to related topics
- Keep session for future reference

---

## RAGAS Evaluation

Quality assessment system for RAG-generated answers.

### Overview

**RAGAS** stands for Retrieval-Augmented Generation Assessment Score. It measures:

- **Faithfulness** (0-100): How much of the answer is supported by the retrieved chunks
- **Relevance** (0-100): How much of the expected answer is covered in the actual answer
- **Coherence** (0-100): Quality of sentence structure and response organization
- **RAGAS Score**: Average of the three metrics

**Quality Levels:**
- **Excellent**: RAGAS >= 80
- **Good**: RAGAS 60-80
- **Fair**: RAGAS 40-60
- **Poor**: RAGAS < 40

### Frontend Usage

#### Access RAGAS Interface

Navigate to **RAGAS Evaluation** tab:

```
Home > Tabs > RAGAS Evaluation
```

Three sub-tabs available:
- **Overview**: Summary metrics and quality dashboard
- **Ground Truth Pairs**: Manage test Q&A pairs
- **Results**: View all evaluation results
- **Trends**: Historical score trends

#### Create Ground Truth Q&A Pairs

1. Click **Ground Truth Pairs** tab
2. Click **"Add Pair"** button
3. Enter test question
4. Enter expected answer
5. Click **"Add Pair"**

Example:
```
Question: "What is the main component of levboots?"
Expected Answer: "The Aetheric Field Generator is the main component that creates localized gravity reversal. It works in conjunction with the Stabilized Coil Array to maintain balance."
```

#### Run Evaluation

1. Click **Overview** tab
2. Click **"Run Evaluation"** button
3. System evaluates all ground truth pairs
4. Shows progress bar
5. Results displayed in metrics cards

#### Interpret Metrics

- **RAGAS Score Card**: Overall quality (0-100, colored)
- **Faithfulness Card**: Source support (0-100)
- **Relevance Card**: Expected answer coverage (0-100)
- **Coherence Card**: Response structure (0-100)
- **Metrics Comparison**: Bar chart showing all four metrics
- **Quality Level Badge**: Excellent/Good/Fair/Poor
- **Recommendations**: Actionable improvement suggestions

#### View Results

1. Click **Results** tab
2. See table of all evaluations
3. Color-coded scores (green=high, red=low)
4. Click any row to expand details

#### Analyze Trends

1. Click **Trends** tab
2. View line chart of scores over time
3. Identify improvement or regression patterns
4. Use for quality monitoring

#### Export Data

1. Click any tab
2. Click **"Export Metrics"** button
3. JSON file downloads with all evaluation data
4. Use for external analysis

### Backend Usage

#### Add Ground Truth Pairs

```typescript
import * as RagAs from './BusinessLogic/RagAs.ts';

const pair = RagAs.addGroundTruthPair(
  'What is the main component of levboots?',
  'The Aetheric Field Generator is the main component...'
);
```

#### Evaluate an Answer

```typescript
const result = RagAs.evaluateAnswer(
  pair.id,
  'LevBoots use an Aetheric Field Generator for gravity control.'
);

console.log(result);
// {
//   ragas_score: 82.33,
//   faithfulness: 85.5,
//   relevance: 78.25,
//   coherence: 83.17,
//   ...
// }
```

#### Batch Evaluation

```typescript
const evaluations = [
  { pairId: 'pair1', actualAnswer: 'Answer 1...' },
  { pairId: 'pair2', actualAnswer: 'Answer 2...' }
];

const results = await RagAs.batchEvaluate(evaluations);
console.log(`Evaluated ${results.length} answers`);
```

#### Get Metrics

```typescript
// Get aggregate metrics
const metrics = RagAs.getMetrics();
console.log(metrics.avgRagasScore); // 78.45

// Get trends over time
const trends = RagAs.calculateTrends();
console.log(trends); // [{date: '2024-01-10', avgScore: 75.23, count: 3}, ...]

// Get score distribution
const dist = RagAs.getScoreDistribution();
console.log(dist.percentiles); // {p50: 75.23, p75: 82.15, p90: 88.45}

// Get quality report
const report = RagAs.getQualityReport();
console.log(report.qualityLevel); // "Good"
console.log(report.recommendations); // [...suggestions...]
```

#### Export Data

```typescript
const jsonData = RagAs.exportData();
// Save to file or send to client
```

### API Integration

#### Add Ground Truth Pair

```bash
curl -X POST http://localhost:3030/api/ragas/ground-truth/add \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What powers levboots?",
    "expectedAnswer": "The Aetheric Field Generator..."
  }'
```

#### Evaluate Answer

```bash
curl -X POST http://localhost:3030/api/ragas/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "pairId": "pair_123",
    "actualAnswer": "LevBoots are powered by..."
  }'
```

#### Get Quality Report

```bash
curl http://localhost:3030/api/ragas/report
```

Response includes quality level, recommendations, and trends.

#### Batch Evaluate

```bash
curl -X POST http://localhost:3030/api/ragas/batch-evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "evaluations": [
      {"pairId": "pair_1", "actualAnswer": "..."},
      {"pairId": "pair_2", "actualAnswer": "..."}
    ]
  }'
```

### Scoring Logic

#### Faithfulness Score

Measures word overlap between actual and expected answer:
```
Faithfulness = (supported_words / actual_words) * 100

Example:
- Actual: "LevBoots use an Aetheric Field Generator for gravity control"
- Expected: "The Aetheric Field Generator creates localized gravity reversal"
- Supported words: ["Aetheric", "Field", "Generator", "gravity"]
- Score: 4/8 words = 50% faithfulness
```

#### Relevance Score

Measures expected answer coverage:
```
Relevance = (covered_expected_words / total_expected_words) * 100

Example:
- If actual covers 7 out of 10 words from expected
- Score: 7/10 = 70% relevance
```

#### Coherence Score

Measures sentence structure:
```
Coherence = (sentence_count_score * 60%) + (length_score * 40%)

- More sentences = better structure
- Ideal sentence length 10-20 words
- Score reflects how close to ideal
```

### Use Cases

**1. Quality Monitoring**
- Create ground truth pairs for critical questions
- Run daily evaluations
- Track trends over time
- Alert on quality drops

**2. Model Comparison**
- Evaluate multiple RAG configurations
- Compare which settings give best scores
- A/B test different embedding models

**3. Knowledge Base Validation**
- Evaluate after adding new documents
- Ensure quality doesn't degrade
- Identify weak areas in knowledge base

**4. Continuous Improvement**
- Track score trends
- Use recommendations to improve
- Re-evaluate after improvements
- Measure impact

### Best Practices

1. **Create diverse ground truth pairs**
   - Mix different question types
   - Cover all knowledge areas
   - Include edge cases

2. **Update expected answers**
   - Keep answers accurate and up-to-date
   - Use authoritative sources
   - Make answers comprehensive but concise

3. **Evaluate regularly**
   - Daily or weekly evaluations
   - Before/after knowledge base updates
   - When deployment config changes

4. **Analyze trends**
   - Look for patterns in score changes
   - Investigate sudden drops
   - Celebrate consistent improvements

---

## Settings Management

Centralized configuration for the entire RAG system.

### Overview

**Settings Management** provides:
- 24+ configurable parameters
- Per-user or global settings
- Input validation and constraints
- Import/export functionality
- Preset configurations for different use cases

### Frontend Usage

#### Access Settings

Navigate to **Settings** tab:

```
Home > Tabs > Settings
```

Five sub-tabs available:
- **Features**: Toggle features on/off
- **LLM & RAG**: Configure model behavior and retrieval
- **API & Embeddings**: API timeouts and embedding model
- **Advanced**: Debug mode and logging
- **Export**: Backup and manage settings

#### Configure Features

**Features Tab** - Toggle these:
- Conversational RAG: Multi-turn conversations
- RAGAS Evaluation: Quality assessment
- Conversation History: Save conversations
- Auto-Save: Automatically save to browser
- Analytics: Usage tracking
- Notifications: System notifications

#### Adjust LLM Parameters

**LLM & RAG Tab** - Sliders and inputs:
- **Temperature** (0-2):
  - Low (0-0.5): More deterministic, focused
  - Medium (0.7-1.0): Balanced (default)
  - High (1.5-2.0): More creative, diverse

- **Max Tokens** (100-8192):
  - Lower = shorter responses, faster
  - Higher = longer responses, slower
  - Default: 2048

- **Top P** (0-1):
  - Lower = more focused (0.8)
  - Higher = more diverse (0.95)

**RAG Configuration:**
- **Similarity Threshold** (0-1):
  - Lower (0.2): More retrieval but possibly irrelevant
  - Higher (0.8): Strict filtering, fewer results
  - Default: 0.3

- **Top K Chunks** (1-20):
  - Number of chunks to retrieve
  - More = broader context, slower
  - Default: 5

- **Context Window Size** (500-5000):
  - Max tokens for conversation memory
  - Default: 2000

#### API & Embedding Configuration

**API & Embeddings Tab:**
- **API Timeout** (5-120 seconds): How long to wait
- **Retry Attempts** (0-5): Failed request retries
- **Embedding Model**: Choose embedding model
- **Embedding Dimension**: Auto-set based on model

#### Advanced Options

**Advanced Tab:**
- **Debug Mode**: Enable detailed logging
- **Log Level**: debug, info, warn, error
- **View current config**: JSON representation

#### Save Settings

1. Modify any settings
2. **"Save Settings"** button becomes active
3. Click to save
4. Confirmation message appears
5. Settings persist to browser storage

#### Export/Import Settings

**Export:**
1. Click **Export** tab
2. Click **"Download Settings"**
3. JSON file downloads with all settings
4. Share or backup

**Import:**
1. Click **Export** tab
2. Click **"Upload Settings"** (feature coming soon)
3. Or use API endpoint

#### Reset to Defaults

1. Any tab, click **"Reset to Defaults"** (footer)
2. Confirm action
3. All settings reset to original values
4. Browser storage cleared

#### Use Presets

1. Go to **LLM & RAG** tab
2. Recommendation buttons appear:
   - **Creative**: High temperature, broad search
   - **Balanced**: Default settings (recommended)
   - **Precise**: Low temperature, strict search
3. Click to apply all preset values at once

### Backend Usage

#### Get Settings

```typescript
import * as Settings from './BusinessLogic/Settings.ts';

// Get all settings for user
const settings = Settings.getSettings('user123');
console.log(settings.temperature); // 0.7

// Get single setting
const temp = Settings.getSetting('temperature', 'user123');
console.log(temp); // 0.7
```

#### Update Settings

```typescript
// Update single setting
const updated = Settings.updateSetting('temperature', 0.5, 'user123');
console.log(updated.temperature); // 0.5

// Update multiple settings
const updated = Settings.updateSettings({
  temperature: 0.8,
  maxTokens: 4096,
  theme: 'dark'
}, 'user123');
```

#### Validate Settings

```typescript
const validation = Settings.validateAllSettings('user123');
console.log(validation.valid); // true or false
console.log(validation.errors); // Array of errors
console.log(validation.warnings); // Array of warnings
```

#### Get Recommendations

```typescript
const creative = Settings.getRecommendedSettings('creative');
console.log(creative);
// {
//   temperature: 1.2,
//   topP: 0.9,
//   similarityThreshold: 0.25,
//   topKChunks: 8
// }

const precise = Settings.getRecommendedSettings('precise');
console.log(precise);
// {
//   temperature: 0.3,
//   topP: 0.8,
//   similarityThreshold: 0.5,
//   topKChunks: 3
// }
```

#### Reset Settings

```typescript
const reset = Settings.resetSettings('user123');
// All settings reverted to defaults
```

#### Export/Import

```typescript
// Export as JSON string
const jsonStr = Settings.exportSettings('user123');

// Import from JSON string
const imported = Settings.importSettings(jsonStr, 'user123');
if (imported) {
  console.log('Settings imported successfully');
}
```

### API Integration

#### Get Settings

```bash
curl http://localhost:3030/api/settings?userId=user123
```

#### Update Settings

```bash
curl -X PUT http://localhost:3030/api/settings?userId=user123 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 0.8, "maxTokens": 4096}'
```

#### Update Single Setting

```bash
curl -X PATCH http://localhost:3030/api/settings/temperature?userId=user123 \
  -H "Content-Type: application/json" \
  -d '{"value": 0.9}'
```

#### Get Recommendations

```bash
curl -X POST http://localhost:3030/api/settings/recommended \
  -H "Content-Type: application/json" \
  -d '{"useCase": "creative"}'
```

#### Validate Settings

```bash
curl -X POST http://localhost:3030/api/settings/validate?userId=user123
```

#### Export Settings

```bash
curl http://localhost:3030/api/settings/export?userId=user123 \
  -o my_settings.json
```

#### Import Settings

```bash
curl -X POST http://localhost:3030/api/settings/import?userId=user123 \
  -H "Content-Type: application/json" \
  -d '{"jsonData": "{\"temperature\": 0.8, ...}"}'
```

### Configuration Reference

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| temperature | number | 0-2 | 0.7 | LLM creativity level |
| maxTokens | number | 100-8192 | 2048 | Max response length |
| topP | number | 0-1 | 0.95 | Nucleus sampling |
| similarityThreshold | number | 0-1 | 0.3 | Min relevance score |
| topKChunks | number | 1-20 | 5 | Chunks to retrieve |
| contextWindowSize | number | 500-5000 | 2000 | Conversation memory |
| apiTimeout | number | 5-120 | 30 | API call timeout (s) |
| retryAttempts | number | 0-5 | 3 | Failed call retries |
| theme | string | light/dark/auto | auto | UI theme |
| debugMode | boolean | true/false | false | Debug logging |

### Use Cases

**1. Performance Optimization**
```json
{
  "temperature": 0.3,
  "topP": 0.8,
  "maxTokens": 1024,
  "topKChunks": 3,
  "apiTimeout": 15
}
```

**2. Creative Generation**
```json
{
  "temperature": 1.5,
  "topP": 0.95,
  "maxTokens": 4096,
  "topKChunks": 8
}
```

**3. Precise Answers**
```json
{
  "temperature": 0.2,
  "topP": 0.7,
  "maxTokens": 2048,
  "similarityThreshold": 0.6,
  "topKChunks": 3
}
```

**4. Balanced Default**
```json
{
  "temperature": 0.7,
  "topP": 0.95,
  "maxTokens": 2048,
  "similarityThreshold": 0.3,
  "topKChunks": 5
}
```

---

## Integration Guide

### Full Stack Example

Combining all three features in a real application:

#### Frontend React Component

```javascript
import ConversationalRAG from './components/ConversationalRAG';
import RagAs from './components/RagAs';
import Settings from './components/Settings';
import { useState } from 'react';

export function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div>
      <header>LevBoots RAG System</header>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.Tab value="chat">
          <ConversationalRAG />
        </Tabs.Tab>
        <Tabs.Tab value="evaluation">
          <RagAs />
        </Tabs.Tab>
        <Tabs.Tab value="settings">
          <Settings />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
}
```

#### Backend Integration

```typescript
// server/controllers/chatController.ts
import * as ConversationalRAG from '../BusinessLogic/ConversationalRAG';
import * as Settings from '../BusinessLogic/Settings';
import { ask } from '../services/ragService';

export const chatMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, userQuestion } = req.body;
    const userId = req.user.id; // From auth middleware

    // Get user settings
    const settings = Settings.getSettings(userId);

    // Add user message
    ConversationalRAG.addMessage(sessionId, 'user', userQuestion);

    // Get RAG answer with user settings
    const ragResponse = await ask(userQuestion, {
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      topKChunks: settings.topKChunks,
      similarityThreshold: settings.similarityThreshold
    });

    // Add assistant message
    ConversationalRAG.addMessage(
      sessionId,
      'assistant',
      ragResponse.answer,
      ragResponse.sources
    );

    // Check if evaluation is enabled
    if (settings.enableRagAsEvaluation) {
      // Optional: Log for later evaluation
    }

    res.json(ragResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Data Flow Diagram

```
User Input
    ↓
[Settings] ← Load user preferences
    ↓
[ConversationalRAG] ← Create/get session
    ↓
[Add User Message] ← Store for history
    ↓
[RAG System] ← Apply settings to retrieval
    ↓
[Add Assistant Message] ← Store response
    ↓
[Check Evaluation] ← If enabled, log for RAGAS
    ↓
Return Response
```

---

## Best Practices

### Conversational RAG

1. **Session Management**
   - Create new session for each conversation
   - Reuse sessionId for follow-ups
   - Clean up after 24 hours (auto-expires)

2. **Context Optimization**
   - Monitor context usage
   - Compress history before 90% full
   - Ask follow-ups to stay within window

3. **Message Handling**
   - Add messages in order (user then assistant)
   - Include sources with assistant messages
   - Handle errors gracefully

### RAGAS Evaluation

1. **Ground Truth Creation**
   - Use authoritative sources
   - Create diverse question set
   - Cover edge cases
   - Update answers regularly

2. **Evaluation Frequency**
   - Daily for production systems
   - Before/after major changes
   - When deploying new features
   - Monitor for regressions

3. **Score Interpretation**
   - Track trends, not individual scores
   - Look for consistent patterns
   - Investigate sudden changes
   - Use recommendations

### Settings Management

1. **Default Values**
   - Use defaults as starting point
   - Adjust for use case
   - Test changes incrementally
   - Document custom settings

2. **Per-User vs Global**
   - Global for defaults
   - Per-user for customization
   - Fallback to global if user setting missing

3. **Validation**
   - Always validate before saving
   - Check interdependencies
   - Log warnings for suboptimal configs
   - Provide helpful error messages

### Performance

1. **Minimize API Calls**
   - Cache settings
   - Batch evaluations
   - Reuse embeddings

2. **Monitor Metrics**
   - Track response times
   - Watch error rates
   - Monitor API rate limits

3. **Optimize Settings**
   - Lower temperature for speed
   - Reduce topK for faster retrieval
   - Adjust timeout based on network

---

## Troubleshooting

### Conversational RAG Issues

**Problem**: "Session not found"
- Solution: Verify sessionId format
- Sessions expire after 24 hours
- Create new session if expired

**Problem**: Context filling too quickly
- Solution: Enable context compression
- Reduce contextWindowSize in settings
- Clear conversation and start new

### RAGAS Evaluation Issues

**Problem**: Low evaluation scores
- Solution: Review ground truth accuracy
- Check if similarity threshold too high
- Verify retrieved chunks are relevant

**Problem**: Inconsistent scores
- Solution: Check if settings changed
- Verify same evaluation method
- Look for outliers in data

### Settings Management Issues

**Problem**: Settings not saving
- Solution: Check browser localStorage is enabled
- Clear browser cache
- Try import/export instead

**Problem**: Validation errors
- Solution: Check setting ranges
- Review interdependency warnings
- Use preset configurations

---

## Summary

These three features work together to provide:

1. **Conversational RAG**: Natural multi-turn interactions
2. **RAGAS Evaluation**: Quality assurance and monitoring
3. **Settings Management**: Complete system customization

By combining them effectively, you can:
- Have meaningful conversations with RAG
- Measure and improve quality
- Optimize for your specific use case
- Monitor system performance

For more information, see API_DOCUMENTATION.md for detailed endpoint reference.