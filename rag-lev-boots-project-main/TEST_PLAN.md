# LevBoots RAG System - Comprehensive Test Plan

## Overview
This document provides a detailed test plan for the LevBoots RAG (Retrieval-Augmented Generation) System. It includes test scenarios for all four main application tabs with specific inputs, expected outputs, and Q&A validation criteria.

---

## Table of Contents
1. [Ground Truth Q&A Pairs](#ground-truth-qa-pairs)
2. [Home Tab - Standard RAG](#home-tab---standard-rag)
3. [Conversational Tab - Chat Mode](#conversational-tab---chat-mode)
4. [RAGAS Tab - Evaluation](#ragas-tab---evaluation)
5. [Settings Tab - Configuration](#settings-tab---configuration)
6. [Integration Tests](#integration-tests)
7. [Performance & Stability Tests](#performance--stability-tests)

---

## Ground Truth Q&A Pairs

This section contains 10 pre-defined Ground Truth question-answer pairs for RAGAS evaluation testing. These pairs are based on the knowledge base documents (levboots research papers, articles, and white papers) and represent realistic use cases.

### How to Use These Pairs

1. **In RAGAS Tab:** Use these pairs to populate the Ground Truth database
2. **For Evaluation:** System will compare RAG-generated answers against these expected answers
3. **Scoring:** RAGAS metrics (Faithfulness, Relevance, Coherence) will be calculated based on these pairs

---

### Pair 1: Technology Explanation

| Field | Content |
|-------|---------|
| **Question** | What is the basic principle behind levboots technology? |
| **Expected Answer** | Levboots technology is based on localized gravity reversal principles that create controlled anti-gravity fields around the wearer's feet. This allows individuals to achieve levitation by counteracting Earth's gravitational pull through electromagnetic or quantum field manipulation. The technology enables vertical movement while maintaining stability through sophisticated gyroscopic stabilization systems. |
| **Difficulty** | Medium |
| **Category** | Technology |

---

### Pair 2: Safety & Certification

| Field | Content |
|-------|---------|
| **Question** | What safety certifications and standards apply to levboots? |
| **Expected Answer** | Levboots must comply with international safety standards including ISO 13852 (Personal Protective Equipment for Occupational Hazards), UL 2089 (Advanced Personal Protective Equipment), and specific levitation device safety protocols. Certifications ensure proper grounding, electromagnetic field containment, emergency shutdown capabilities, and altitude safety limits. Most commercial levboots are certified for heights up to 50 meters and include automatic descent systems for power failure scenarios. |
| **Difficulty** | High |
| **Category** | Safety |

---

### Pair 3: Environmental Impact

| Field | Content |
|-------|---------|
| **Question** | How do levboots reduce environmental impact compared to traditional transportation? |
| **Expected Answer** | Levboots significantly reduce carbon emissions by eliminating the need for fuel-based transportation for short-distance travel. They require only electrical charging, which can be powered by renewable energy sources. By replacing car trips under 5 miles, levboots reduce CO2 emissions by approximately 90% compared to gasoline vehicles. Additionally, they produce zero noise pollution and create no road wear, extending infrastructure lifespan. |
| **Difficulty** | Medium |
| **Category** | Environmental |

---

### Pair 4: Cost & Availability

| Field | Content |
|-------|---------|
| **Question** | What is the typical cost of levboots and where can they be purchased? |
| **Expected Answer** | Current commercial levboots range from $2,400 to $8,500 depending on features and brand. Premium models with extended flight time and higher altitude capability cost $6,000-$8,500, while entry-level models start at $2,400. They are available through authorized retailers, online marketplace partners, and direct manufacturer websites. Subscription-based rental programs are available in major cities starting at $99/month. |
| **Difficulty** | Low |
| **Category** | Commercial |

---

### Pair 5: Performance Specifications

| Field | Content |
|-------|---------|
| **Question** | What are the performance specifications of modern levboots? |
| **Expected Answer** | Standard levboots specifications include: maximum altitude of 50 meters, horizontal speed up to 45 mph, flight endurance of 4-6 hours per charge, weight capacity of 300-350 pounds, acceleration of 0-25 mph in 3 seconds, and emergency descent rate of 5 mph. Battery capacity ranges from 10-20 kWh depending on model. Response time for gravity field activation is 200 milliseconds. |
| **Difficulty** | Medium |
| **Category** | Specifications |

---

### Pair 6: Urban Integration

| Field | Content |
|-------|---------|
| **Question** | How are levboots integrated into urban transportation systems? |
| **Expected Answer** | Major cities have established levboot corridors with designated flight paths, charging stations, and landing zones in urban areas. Regulatory frameworks restrict levboot travel to speeds below 45 mph in populated zones and maintain minimum altitudes of 30 feet. Integration includes smart traffic management systems, airspace coordination with drones, and dedicated charging infrastructure at transit hubs. Cities like Los Angeles and Singapore have invested in citywide levboot networks. |
| **Difficulty** | High |
| **Category** | Urban Planning |

---

### Pair 7: Health & Wellness

| Field | Content |
|-------|---------|
| **Question** | Are there any health concerns or benefits associated with levboots usage? |
| **Expected Answer** | Regular levboots use provides cardiovascular benefits equivalent to moderate exercise and improves balance and proprioception. Potential health concerns include electromagnetic field exposure (within safe limits per research), altitude-related decompression effects (mitigated by gradual ascent), and inner ear adaptation during first 20 hours of use. Users report improved mood and reduced stress. Medical professionals recommend gradual exposure for people with cardiovascular conditions. |
| **Difficulty** | High |
| **Category** | Health |

---

### Pair 8: Competitive Comparison

| Field | Content |
|-------|---------|
| **Question** | How do levboots compare to other emerging personal transportation technologies? |
| **Expected Answer** | Compared to electric scooters, levboots offer 3D mobility but require more training. Versus drones, levboots allow human control and safety. Compared to flying cars, levboots are more affordable ($2,400 vs $50,000+), require less infrastructure, and have lower environmental impact. Levboots excel in personal portability but fall short of drones in cargo capacity. Market analysis shows levboots have 5x faster adoption rate than flying cars due to accessibility and cost. |
| **Difficulty** | High |
| **Category** | Market Analysis |

---

### Pair 9: Training & Certification

| Field | Content |
|-------|---------|
| **Question** | What training is required to use levboots safely and legally? |
| **Expected Answer** | Most jurisdictions require 20-40 hours of certified flight training before legal operation. Training covers emergency procedures, altitude management, weather awareness, traffic rules, and equipment maintenance. Certification involves both practical flight tests and written exams. Training costs range from $800-$1,500. Annual recertification is required in most regions. Manufacturer training programs are available online and at certified centers worldwide. Insurance discounts apply for users with advanced certifications. |
| **Difficulty** | Medium |
| **Category** | Regulations |

---

### Pair 10: Future Development

| Field | Content |
|-------|---------|
| **Question** | What innovations are expected in levboots technology over the next 5 years? |
| **Expected Answer** | Upcoming innovations include extended battery life (up to 12 hours), increased altitude limits (100+ meters), improved weather resistance, lighter composite materials reducing weight by 40%, autonomous navigation with AI integration, and neural interface controls. Researchers are developing silent operation systems and magnetic stabilization for increased safety. Cost reductions are expected to drop entry-level prices to under $1,000. Military and industrial applications are expanding significantly. |
| **Difficulty** | Medium |
| **Category** | Future Technology |

---

### Quick Reference Table

| # | Question | Category | Difficulty | Expected Answer Length |
|---|----------|----------|-----------|----------------------|
| 1 | Basic principle | Technology | Medium | 150-200 words |
| 2 | Safety certifications | Safety | High | 120-150 words |
| 3 | Environmental impact | Environmental | Medium | 100-120 words |
| 4 | Cost & availability | Commercial | Low | 80-100 words |
| 5 | Performance specs | Specifications | Medium | 140-160 words |
| 6 | Urban integration | Urban Planning | High | 130-150 words |
| 7 | Health concerns | Health | High | 140-160 words |
| 8 | Competitive comparison | Market Analysis | High | 150-180 words |
| 9 | Training required | Regulations | Medium | 120-140 words |
| 10 | Future development | Future Technology | Medium | 140-160 words |

---

### Testing Instructions for RAGAS Tab

1. **Add Pairs:** Copy each pair's Question and Expected Answer
2. **Load in UI:** Click "Add Ground Truth Pair" in RAGAS tab
3. **Populate:** Paste Question and Expected Answer fields
4. **Add to System:** Click "Add" button
5. **Verify:** Confirm all 10 pairs appear in list
6. **Run Evaluation:** Click "Run Evaluation"
7. **Analyze Results:**
   - Check RAGAS scores for each pair
   - Identify pairs with lower scores for analysis
   - Compare difficulty level with score accuracy
   - Export results for trend analysis

---

## Home Tab - Standard RAG

### Test Case 1.1: Basic Question Query
**Objective:** Verify the system can retrieve relevant documents and generate answers for simple questions.

| Aspect | Details |
|--------|---------|
| **Input** | Question: "How do levboots work?" |
| **Steps** | 1. Navigate to Home tab<br>2. Enter "How do levboots work?" in question field<br>3. Click "Ask RAG" button<br>4. Wait for response |
| **Expected Output** | - Answer is displayed within 10 seconds<br>- Answer references at least 2 source documents<br>- Sources show document names (e.g., "White Paper - Gravitational Reversal Physics.pdf")<br>- Answer is coherent and directly addresses the question |
| **Acceptance Criteria** | ✓ Response received<br>✓ Sources listed<br>✓ No errors in console |
| **Q&A Validation** | Q: Does the answer explain the technology behind levboots?<br>A: Yes, if it mentions gravitational reversal or similar concepts |

---

### Test Case 1.2: Complex Multi-Part Question
**Objective:** Test system's ability to handle more complex queries requiring synthesis of multiple documents.

| Aspect | Details |
|--------|---------|
| **Input** | Question: "What are the safety implications of levboots and how do they compare to traditional footwear?" |
| **Steps** | 1. Enter the complex question<br>2. Click "Ask RAG"<br>3. Observe response structure<br>4. Check number of sources cited |
| **Expected Output** | - Answer addresses both parts (safety + comparison)<br>- At least 3 different sources cited<br>- Answer length: 200-500 words<br>- Structured response with clear sections |
| **Acceptance Criteria** | ✓ Both question parts addressed<br>✓ Multiple sources used<br>✓ Coherent structure |
| **Q&A Validation** | Q: Can you identify at least 3 unique sources in the response?<br>A: Document should cite different articles/papers |

---

### Test Case 1.3: Empty/Invalid Input Handling
**Objective:** Verify graceful error handling for invalid inputs.

| Aspect | Details |
|--------|---------|
| **Input** | Empty string (no question) |
| **Steps** | 1. Leave question field empty<br>2. Click "Ask RAG" button<br>3. Observe system response |
| **Expected Output** | - Error message displayed: "Please enter a question"<br>- No API call made<br>- User can retry |
| **Acceptance Criteria** | ✓ Validation message shown<br>✓ No backend errors<br>✓ UI remains responsive |
| **Q&A Validation** | Q: What happens when no question is provided?<br>A: Application shows friendly error message |

---

### Test Case 1.4: Question History Tracking
**Objective:** Verify that previous questions are displayed and can be reused.

| Aspect | Details |
|--------|---------|
| **Input** | 1. "What are the environmental benefits?"<br>2. "How much do levboots cost?" |
| **Steps** | 1. Enter and ask first question<br>2. Enter and ask second question<br>3. Check history/previous questions section<br>4. Click on previous question |
| **Expected Output** | - Both questions appear in history<br>- Clicking previous question re-runs query with same parameters<br>- Previous answer is displayed again<br>- History persists (or shows in UI) |
| **Acceptance Criteria** | ✓ History recorded<br>✓ Quick-repeat functionality works<br>✓ Same answer retrieved |
| **Q&A Validation** | Q: Can users see and reuse previous questions?<br>A: Yes, via history feature |

---

### Test Case 1.5: Response Time Under Normal Load
**Objective:** Verify system performance meets SLA requirements.

| Aspect | Details |
|--------|---------|
| **Input** | Standard question: "What is the market adoption rate of levboots?" |
| **Steps** | 1. Record timestamp<br>2. Submit question<br>3. Record timestamp when answer appears<br>4. Calculate response time<br>5. Repeat 5 times |
| **Expected Output** | - Response time: 3-12 seconds (typical)<br>- Consistent performance across attempts<br>- No timeout errors<br>- Progress indicator shows during wait |
| **Acceptance Criteria** | ✓ All responses under 15 seconds<br>✓ Average < 10 seconds<br>✓ No failures |
| **Q&A Validation** | Q: Is the system responsive within expected timeframe?<br>A: Yes, all queries respond in < 15 seconds |

---

## Conversational Tab - Chat Mode

### Test Case 2.1: Single-Turn Conversation
**Objective:** Test basic conversational interaction.

| Aspect | Details |
|--------|---------|
| **Input** | First message: "Tell me about levboots technology" |
| **Steps** | 1. Navigate to Conversational tab<br>2. Type message in chat input<br>3. Press Enter or click Send<br>4. Wait for response |
| **Expected Output** | - Message appears in chat with user label<br>- Bot response appears below user message<br>- Response is contextually appropriate<br>- Chat timestamp shown |
| **Acceptance Criteria** | ✓ Message sent<br>✓ Response received<br>✓ Chat flow clear |
| **Q&A Validation** | Q: Did the system understand the conversational request?<br>A: Yes, response shows understanding of query |

---

### Test Case 2.2: Multi-Turn Conversation
**Objective:** Verify system maintains context across multiple exchanges.

| Aspect | Details |
|--------|---------|
| **Input** | Message 1: "What makes levboots unique?"<br>Message 2: "How does that compare to other brands?"<br>Message 3: "Which brand is most affordable?" |
| **Steps** | 1. Send message 1<br>2. Send message 2<br>3. Send message 3<br>4. Review entire conversation flow<br>5. Verify context awareness |
| **Expected Output** | - All 3 messages preserved in chat<br>- Message 2 references concepts from Message 1<br>- Message 3 uses brands mentioned in Message 2<br>- Full conversation history visible<br>- System shows clear turn-taking |
| **Acceptance Criteria** | ✓ Context maintained across turns<br>✓ Relevant responses<br>✓ No message loss |
| **Q&A Validation** | Q: Does the system remember and reference previous messages?<br>A: Yes, responses reference prior context |

---

### Test Case 2.3: Conversation Reset/Clear
**Objective:** Test ability to start fresh conversation.

| Aspect | Details |
|--------|---------|
| **Input** | 1. Send: "Question about levboots"<br>2. Click "Clear Conversation"<br>3. Send: "Different question about pricing" |
| **Steps** | 1. Have active conversation with 3+ messages<br>2. Click "Clear" or "New Conversation" button<br>3. Verify history cleared<br>4. Send new message<br>5. Verify context reset |
| **Expected Output** | - Previous messages cleared from view<br>- New conversation starts fresh<br>- Bot doesn't reference old context<br>- Chat input field cleared |
| **Acceptance Criteria** | ✓ History cleared<br>✓ Context reset<br>✓ Fresh conversation starts |
| **Q&A Validation** | Q: Does clearing conversation properly reset context?<br>A: Yes, no reference to previous messages |

---

### Test Case 2.4: Emoji/Special Characters Support
**Objective:** Test handling of special characters in conversational mode.

| Aspect | Details |
|--------|---------|
| **Input** | Message: "What's the difference? 🤔 (levboots vs traditional boots) - cost & features?" |
| **Steps** | 1. Type message with emoji, special chars, parentheses, ampersand<br>2. Send message<br>3. Verify display and processing |
| **Expected Output** | - Message displays with all characters intact<br>- Emoji renders properly<br>- Special characters not escaped<br>- System processes message correctly<br>- Response received without errors |
| **Acceptance Criteria** | ✓ Special chars preserved<br>✓ Emoji render correctly<br>✓ No encoding errors |
| **Q&A Validation** | Q: Can system handle special characters and emoji?<br>A: Yes, all characters processed correctly |

---

## RAGAS Tab - Evaluation

### Test Case 3.1: Add Ground Truth Pair
**Objective:** Test adding a question-answer pair for evaluation.

| Aspect | Details |
|--------|---------|
| **Input** | Question: "What is the maximum levitation height?"<br>Expected Answer: "The maximum levitation height is 50 meters above ground level." |
| **Steps** | 1. Navigate to RAGAS tab<br>2. Click "Add Ground Truth Pair"<br>3. Enter question in field<br>4. Enter expected answer<br>5. Click "Add" button<br>6. Verify in list |
| **Expected Output** | - Modal/form appears for input<br>- Fields accept text input<br>- Pair added to table/list<br>- Confirmation message shown<br>- Question and answer visible in list<br>- Timestamp recorded |
| **Acceptance Criteria** | ✓ Pair added successfully<br>✓ Data persisted (localStorage)<br>✓ Visible in UI |
| **Q&A Validation** | Q: Can users add custom Q&A pairs for evaluation?<br>A: Yes, pairs are stored and visible |

---

### Test Case 3.2: View Ground Truth Pairs
**Objective:** Verify ground truth pairs are displayed correctly.

| Aspect | Details |
|--------|---------|
| **Input** | After adding 3+ pairs: "View Pairs", Filter, Sort |
| **Steps** | 1. Add 3 different Q&A pairs<br>2. Observe table/list display<br>3. Check formatting<br>4. Verify all columns (ID, Question, Expected Answer, Date)<br>5. Test sorting/filtering if available |
| **Expected Output** | - All pairs listed in table<br>- Columns: ID, Question, Expected Answer, Date Added<br>- Proper text wrapping<br>- Readable formatting<br>- Actions column (delete, edit) available |
| **Acceptance Criteria** | ✓ All pairs displayed<br>✓ Readable layout<br>✓ Data integrity maintained |
| **Q&A Validation** | Q: Are all ground truth pairs visible and well-formatted?<br>A: Yes, all pairs shown with clear organization |

---

### Test Case 3.3: Delete Ground Truth Pair
**Objective:** Test deletion of ground truth pairs.

| Aspect | Details |
|--------|---------|
| **Input** | Select pair ID 2 from list of 5 pairs, click Delete |
| **Steps** | 1. Have 5+ pairs in system<br>2. Click delete button on specific pair<br>3. Confirm deletion if prompted<br>4. Verify removal from list<br>5. Verify count decreases |
| **Expected Output** | - Confirmation dialog appears<br>- Selected pair removed from list<br>- Count updates (5 → 4)<br>- Remaining pairs intact<br>- Success message shown |
| **Acceptance Criteria** | ✓ Pair deleted<br>✓ List updated<br>✓ Data consistency maintained |
| **Q&A Validation** | Q: Can users remove pairs they no longer need?<br>A: Yes, deletion works with confirmation |

---

### Test Case 3.4: Run Evaluation
**Objective:** Test RAGAS evaluation scoring.

| Aspect | Details |
|--------|---------|
| **Input** | 3 ground truth pairs ready, click "Run Evaluation" |
| **Steps** | 1. Ensure 3+ ground truth pairs added<br>2. Click "Run Evaluation" button<br>3. Monitor progress<br>4. Wait for completion<br>5. Review metrics<br>6. Check individual scores |
| **Expected Output** | - Progress indicator shows (0-100%)<br>- Processing message displayed<br>- Evaluation completes in < 30 seconds<br>- Metrics displayed:<br>&nbsp;&nbsp;- Average RAGAS Score<br>&nbsp;&nbsp;- Faithfulness Score<br>&nbsp;&nbsp;- Relevance Score<br>&nbsp;&nbsp;- Coherence Score<br>- Individual results shown in table<br>- Timestamps recorded |
| **Acceptance Criteria** | ✓ All metrics calculated<br>✓ Scores between 0-1 or 0-100<br>✓ No evaluation errors<br>✓ Results persisted |
| **Q&A Validation** | Q: Are RAGAS metrics properly calculated and displayed?<br>A: Yes, all 4 metrics show realistic scores |

---

### Test Case 3.5: Visualization of Evaluation Metrics
**Objective:** Test chart/visualization display of evaluation results.

| Aspect | Details |
|--------|---------|
| **Input** | 5 evaluations completed with varying scores |
| **Steps** | 1. Run evaluation 5 times<br>2. Observe visualization section<br>3. Check bar chart display<br>4. Check trend line chart<br>5. Verify labels and legends |
| **Expected Output** | - Bar chart shows metrics (RAGAS, Faithfulness, Relevance, Coherence)<br>- Line chart shows score trends over time<br>- Axes properly labeled<br>- Legend shows metric names<br>- Charts responsive to data<br>- No rendering errors |
| **Acceptance Criteria** | ✓ Charts render<br>✓ Data accurate<br>✓ Readable visualization |
| **Q&A Validation** | Q: Can users visualize evaluation metrics over time?<br>A: Yes, charts display trends clearly |

---

### Test Case 3.6: Export Evaluation Results
**Objective:** Test export functionality for evaluation results.

| Aspect | Details |
|--------|---------|
| **Input** | Click "Export Results" after evaluation |
| **Steps** | 1. Complete evaluation<br>2. Click "Export" button<br>3. Select format (if options available)<br>4. Confirm export<br>5. Check downloaded file |
| **Expected Output** | - Export file generated<br>- File name: "ragas-evaluation-[timestamp].csv" or .json<br>- Contains all pair data and scores<br>- File is readable/valid format<br>- Download completes successfully |
| **Acceptance Criteria** | ✓ File exported<br>✓ Valid format<br>✓ Data complete |
| **Q&A Validation** | Q: Can evaluation results be exported for external analysis?<br>A: Yes, file generated with all data |

---

## Settings Tab - Configuration

### Test Case 4.1: Display API Configuration
**Objective:** Verify API settings are visible and documented.

| Aspect | Details |
|--------|---------|
| **Input** | Navigate to Settings tab |
| **Steps** | 1. Go to Settings tab<br>2. Locate API Configuration section<br>3. Review displayed settings<br>4. Check for status indicators |
| **Expected Output** | - Section shows:<br>&nbsp;&nbsp;- Backend URL/Endpoint<br>&nbsp;&nbsp;- Port (3030)<br>&nbsp;&nbsp;- Connection Status (Connected/Disconnected)<br>&nbsp;&nbsp;- API Version (if available)<br>- Status indicator green (connected) or red (disconnected)<br>- Read-only display (no direct editing)<br>- Help text explaining purpose |
| **Acceptance Criteria** | ✓ All settings displayed<br>✓ Status accurate<br>✓ Readable format |
| **Q&A Validation** | Q: Are API settings visible and status clear?<br>A: Yes, connection status and endpoints shown |

---

### Test Case 4.2: Test Backend Connection
**Objective:** Verify backend connectivity test.

| Aspect | Details |
|--------|---------|
| **Input** | Click "Test Connection" button |
| **Steps** | 1. Ensure backend is running<br>2. Click "Test Connection"<br>3. Wait for result<br>4. Observe response message |
| **Expected Output** | - "Testing..." message appears<br>- Request sent to backend<br>- Response received within 5 seconds<br>- Success message: "Backend Connection: OK" with timestamp<br>- Or error message if backend down<br>- No hang/freeze |
| **Acceptance Criteria** | ✓ Test completes<br>✓ Accurate status<br>✓ No timeout |
| **Q&A Validation** | Q: Can users verify backend connectivity?<br>A: Yes, connection test provides clear status |

---

### Test Case 4.3: Model Configuration
**Objective:** Test display and modification of model settings.

| Aspect | Details |
|--------|---------|
| **Input** | Embedding Model: "text-embedding-004" (display), Dimension: "768" (display) |
| **Steps** | 1. Scroll to Model Configuration section<br>2. View current settings<br>3. Check for edit options<br>4. Verify saved settings persist |
| **Expected Output** | - Current model displayed<br>- Dimension setting shown<br>- Settings match actual configuration<br>- If editable: save button works<br>- If read-only: clearly marked<br>- Changes persist across sessions |
| **Acceptance Criteria** | ✓ Settings displayed accurately<br>✓ State management correct<br>✓ Data persisted |
| **Q&A Validation** | Q: Are model settings displayed and modifiable?<br>A: Yes, configuration shown with ability to update |

---

### Test Case 4.4: Logging Configuration
**Objective:** Verify logging settings and controls.

| Aspect | Details |
|--------|---------|
| **Input** | Log Level: "INFO", Log Location displayed |
| **Steps** | 1. Locate Logging section<br>2. View current log level<br>3. Check log file location display<br>4. Test "View Logs" link if available<br>5. Test "Clear Logs" if available |
| **Expected Output** | - Log level shown (DEBUG, INFO, WARN, ERROR)<br>- Location: `C:\logs\front.log` and backend logs<br>- "View Logs" opens log file or viewer<br>- "Clear Logs" button works (with confirmation)<br>- Log statistics shown (file size, entries count) |
| **Acceptance Criteria** | ✓ Settings visible<br>✓ Actions work<br>✓ Logs accessible |
| **Q&A Validation** | Q: Can users manage and access application logs?<br>A: Yes, log controls and viewer accessible |

---

### Test Case 4.5: Application Info
**Objective:** Verify app metadata and version info.

| Aspect | Details |
|--------|---------|
| **Input** | View Application Information section |
| **Steps** | 1. Scroll to bottom of Settings<br>2. Locate "About" or "App Info" section<br>3. Review all displayed information<br>4. Check for links to docs |
| **Expected Output** | - Application Name: "LevBoots RAG System"<br>- Version: "1.0.0" (or current)<br>- Frontend Version shown<br>- Build Date/Commit Hash (if available)<br>- "Report Issue" link functional<br>- Documentation link available<br>- Support contact info (if applicable) |
| **Acceptance Criteria** | ✓ All info displayed<br>✓ Links functional<br>✓ Accurate version |
| **Q&A Validation** | Q: Can users find app version and support info?<br>A: Yes, all metadata accessible in Settings |

---

## Integration Tests

### Test Case 5.1: Full User Workflow
**Objective:** Test complete flow from RAG question to evaluation.

| Aspect | Details |
|--------|---------|
| **Input** | Full workflow: Ask question → Save pair → Evaluate |
| **Steps** | 1. Home: Ask "How do levboots reduce environmental impact?"<br>2. Note system answer<br>3. RAGAS: Add ground truth pair with expected answer<br>4. RAGAS: Add 2 more pairs<br>5. Run evaluation<br>6. Check metrics<br>7. Settings: Verify connection<br>8. Conversational: Ask follow-up question |
| **Expected Output** | - All tabs functional<br>- Data flows between tabs<br>- Evaluation uses RAG answers<br>- Metrics calculated correctly<br>- Backend responsive throughout<br>- No data loss between sections |
| **Acceptance Criteria** | ✓ Complete workflow successful<br>✓ All features work together<br>✓ Data consistency maintained |
| **Q&A Validation** | Q: Can users seamlessly move through all features?<br>A: Yes, complete workflow successful |

---

### Test Case 5.2: Session Persistence
**Objective:** Test data persistence across page refresh.

| Aspect | Details |
|--------|---------|
| **Input** | Data created, page refreshed, data checked |
| **Steps** | 1. Add 3 ground truth pairs<br>2. Ask question in Home tab<br>3. Start conversation<br>4. Refresh page (F5)<br>5. Check if data persisted<br>6. Navigate to each tab |
| **Expected Output** | - RAGAS pairs still present<br>- Chat history visible (or new session)<br>- Question history maintained<br>- Settings retained<br>- No data loss on refresh<br>- App state recovers properly |
| **Acceptance Criteria** | ✓ Data persisted<br>✓ State recovered<br>✓ No loss on refresh |
| **Q&A Validation** | Q: Is user data preserved across sessions?<br>A: Yes, localStorage/state management working |

---

## Performance & Stability Tests

### Test Case 6.1: Stress Test - Multiple Rapid Queries
**Objective:** Test system stability under load.

| Aspect | Details |
|--------|---------|
| **Input** | Submit 10 questions in rapid succession |
| **Steps** | 1. Open browser console<br>2. Submit questions quickly (2-3 per second)<br>3. Monitor for errors<br>4. Check response handling<br>5. Observe UI responsiveness |
| **Expected Output** | - All requests queued properly<br>- Responses received (may be sequential)<br>- No hung requests<br>- UI remains responsive<br>- No console errors<br>- All answers eventually received<br>- Memory usage stable |
| **Acceptance Criteria** | ✓ No crashes<br>✓ Handles queue<br>✓ Graceful degradation |
| **Q&A Validation** | Q: Can system handle rapid queries?<br>A: Yes, all processed without crashes |

---

### Test Case 6.2: Memory Leak Detection
**Objective:** Monitor for memory leaks during extended usage.

| Aspect | Details |
|--------|---------|
| **Input** | Extended usage: 50+ actions over 10 minutes |
| **Steps** | 1. Open browser DevTools → Memory<br>2. Take initial memory snapshot<br>3. Perform 50+ actions:<br>&nbsp;&nbsp;- Ask 10 questions<br>&nbsp;&nbsp;- Send 20 chat messages<br>&nbsp;&nbsp;- Add/delete 10 RAGAS pairs<br>&nbsp;&nbsp;- Change settings 10 times<br>4. Take final memory snapshot<br>5. Compare memory usage |
| **Expected Output** | - Initial memory: ~100-150 MB<br>- Final memory: ~120-170 MB<br>- No continuous growth<br>- Garbage collection working<br>- No console warnings about memory<br>- Performance stable |
| **Acceptance Criteria** | ✓ Memory stable<br>✓ < 50 MB increase<br>✓ No obvious leaks |
| **Q&A Validation** | Q: Is the application memory efficient?<br>A: Yes, stable memory usage over extended use |

---

### Test Case 6.3: Error Recovery
**Objective:** Test system recovery from errors.

| Aspect | Details |
|--------|---------|
| **Input** | 1. Simulate backend disconnect<br>2. Stop backend server temporarily<br>3. Attempt query |
| **Steps** | 1. Backend running normally<br>2. Kill backend process<br>3. Try to ask question<br>4. Observe error handling<br>5. Restart backend<br>6. Try query again |
| **Expected Output** | - Error message displayed: "Backend connection lost"<br>- Appropriate UI feedback (disabled button, loading state cleared)<br>- User can retry<br>- When backend returns:<br>&nbsp;&nbsp;- Connection reestablishes<br>&nbsp;&nbsp;- Query successful on retry<br>&nbsp;&nbsp;- No data corruption<br>- Clear recovery path for user |
| **Acceptance Criteria** | ✓ Error handled gracefully<br>✓ Recovery possible<br>✓ Clear user communication |
| **Q&A Validation** | Q: Does system recover from connection errors?<br>A: Yes, clear error messages and recovery options |

---

## Test Execution Summary Template

```
Test Date: _______________
Tester: ___________________
Environment: ______________

Test Case Results:
─────────────────────────────────────────
Tab           | Pass | Fail | Notes
─────────────────────────────────────────
Home Tab      | [  ] | [  ] |
Conversational| [  ] | [  ] |
RAGAS         | [  ] | [  ] |
Settings      | [  ] | [  ] |
Integration   | [  ] | [  ] |
Performance   | [  ] | [  ] |
─────────────────────────────────────────

Issues Found:
1. _________________ (Severity: High/Medium/Low)
2. _________________ (Severity: High/Medium/Low)
3. _________________ (Severity: High/Medium/Low)

Overall Status: [  ] PASS [  ] FAIL [  ] CONDITIONAL PASS

Sign-off: _________________ Date: _________
```

---

## Q&A Reference Guide

### General Questions

| Q | A |
|---|---|
| Does the application load without errors? | Yes, all 4 tabs render correctly with no critical errors |
| Are all API endpoints responding? | Yes, backend connectivity confirmed in Settings |
| Is data being persisted properly? | Yes, localStorage maintaining state across sessions |
| Are response times acceptable? | Yes, most responses < 10 seconds, all < 15 seconds |
| Are error messages user-friendly? | Yes, all errors provide clear guidance on resolution |

### Feature-Specific Questions

| Q | A |
|---|---|
| Can users ask questions and get answers? | Yes, RAG system retrieves relevant sources and generates answers |
| Does conversational mode work? | Yes, system maintains context across multiple turns |
| Can RAGAS evaluation be performed? | Yes, system calculates all 4 metrics correctly |
| Are settings accessible and functional? | Yes, all configuration options visible and working |
| Can users export their data? | Yes, evaluation results exportable in multiple formats |

### Performance Questions

| Q | A |
|---|---|
| Does the app remain responsive under load? | Yes, handles 10+ simultaneous requests |
| Are there memory leaks? | No, memory usage stable over extended sessions |
| How fast is the search/retrieval? | Typically 3-12 seconds, depending on document size |
| Does the chat mode maintain conversation history? | Yes, full history persisted and displayed |
| Can evaluations complete in reasonable time? | Yes, 5 pairs evaluated in < 30 seconds |

---

## Known Issues & Limitations

- Chart sizing warnings in development console (non-critical)
- Mantine "checkout popup config" warning appears but doesn't affect functionality
- High-frequency error logging has been optimized to prevent memory issues
- Browser memory caps at ~200MB for optimal performance

---

## Recommended Test Environment

- **Browser:** Chrome/Edge (latest)
- **OS:** Windows 10+
- **RAM:** 8GB minimum
- **Network:** Stable internet connection
- **Backend:** Running on localhost:3030
- **Frontend:** Running on localhost:5175

---

## Approval Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | _________ | _________ | _____ |
| Dev Lead | _________ | _________ | _____ |
| Product Owner | _________ | _________ | _____ |

---

*Last Updated: 2026-01-17*
*Version: 1.0*
