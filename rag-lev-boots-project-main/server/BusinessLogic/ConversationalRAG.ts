import { getLogger } from '../utils/logger';

const logger = getLogger();

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  questionType?: 'knowledge' | 'general' | 'clarification';
  sources?: string[];
}

interface ConversationSession {
  sessionId: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  contextUsage: number;
  metadata: {
    totalQuestions: number;
    totalResponses: number;
    avgResponseTime: number;
  };
}

interface ConversationalResponse {
  answer: string;
  sources: string[];
  bibliography: string[];
  sessionId: string;
  messageId: string;
  contextUsage: number;
  error?: string;
}

// In-memory storage for sessions (in production, use database)
const sessions: Map<string, ConversationSession> = new Map();

// Configuration
const MAX_CONTEXT_TOKENS = 2000;
const MESSAGE_TOKEN_ESTIMATE = 100;
const MAX_MESSAGES_PER_SESSION = 50;
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Classify question type based on content
 */
function classifyQuestionType(
  question: string
): 'knowledge' | 'general' | 'clarification' {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.startsWith('clarify') ||
    lowerQuestion.includes('what do you mean') ||
    lowerQuestion.includes('explain that')
  ) {
    return 'clarification';
  }

  if (
    lowerQuestion.includes('how') ||
    lowerQuestion.includes('what') ||
    lowerQuestion.includes('explain') ||
    lowerQuestion.includes('about levboots') ||
    lowerQuestion.includes('levboots')
  ) {
    return 'knowledge';
  }

  return 'general';
}

/**
 * Calculate context usage based on messages
 */
function calculateContextUsage(messages: ConversationMessage[]): number {
  return messages.length * MESSAGE_TOKEN_ESTIMATE;
}

/**
 * Build conversation context for LLM
 * Returns a formatted string with message history
 */
function buildConversationContext(messages: ConversationMessage[]): string {
  return messages
    .slice(-5) // Last 5 messages for context
    .map(
      (msg) =>
        `${msg.role.toUpperCase()}: ${msg.content}`
    )
    .join('\n\n');
}

/**
 * Create a new conversation session
 */
export function createSession(title?: string): ConversationSession {
  const sessionId = generateSessionId();
  const session: ConversationSession = {
    sessionId,
    title: title || `Conversation ${new Date().toLocaleDateString()}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    contextUsage: 0,
    metadata: {
      totalQuestions: 0,
      totalResponses: 0,
      avgResponseTime: 0,
    },
  };

  sessions.set(sessionId, session);
  logger.info(`Created new conversation session: ${sessionId}`);

  return session;
}

/**
 * Get an existing session
 */
export function getSession(sessionId: string): ConversationSession | undefined {
  const session = sessions.get(sessionId);

  if (session) {
    // Check if session has expired
    const age = Date.now() - session.updatedAt;
    if (age > SESSION_TIMEOUT) {
      logger.info(`Session ${sessionId} expired`);
      sessions.delete(sessionId);
      return undefined;
    }
  }

  return session;
}

/**
 * List all active sessions
 */
export function listSessions(): ConversationSession[] {
  const allSessions = Array.from(sessions.values());

  // Clean up expired sessions
  const activeSessions = allSessions.filter((session) => {
    const age = Date.now() - session.updatedAt;
    if (age > SESSION_TIMEOUT) {
      sessions.delete(session.sessionId);
      return false;
    }
    return true;
  });

  return activeSessions;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);
  if (deleted) {
    logger.info(`Deleted conversation session: ${sessionId}`);
  }
  return deleted;
}

/**
 * Add a message to a session
 */
export function addMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: string[],
  questionType?: 'knowledge' | 'general' | 'clarification'
): ConversationMessage | null {
  const session = getSession(sessionId);
  if (!session) {
    logger.error(`Session not found: ${sessionId}`);
    return null;
  }

  // Check message limit
  if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
    // Remove oldest user-assistant pair
    session.messages.splice(0, 2);
    logger.debug(`Removed oldest messages from session ${sessionId}`);
  }

  const message: ConversationMessage = {
    id: generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
    questionType,
    sources,
  };

  session.messages.push(message);
  session.updatedAt = Date.now();

  // Update metadata
  if (role === 'user') {
    session.metadata.totalQuestions += 1;
  } else {
    session.metadata.totalResponses += 1;
  }

  // Update context usage
  session.contextUsage = calculateContextUsage(session.messages);

  logger.debug(
    `Added ${role} message to session ${sessionId}. Context usage: ${session.contextUsage}/${MAX_CONTEXT_TOKENS}`
  );

  return message;
}

/**
 * Get conversation messages from a session
 */
export function getMessages(sessionId: string): ConversationMessage[] {
  const session = getSession(sessionId);
  return session ? session.messages : [];
}

/**
 * Get recent messages for context (respects context window limit)
 */
export function getRecentMessages(
  sessionId: string,
  maxTokens: number = MAX_CONTEXT_TOKENS
): ConversationMessage[] {
  const session = getSession(sessionId);
  if (!session) return [];

  const messages = [...session.messages].reverse();
  let totalTokens = 0;
  const recentMessages: ConversationMessage[] = [];

  for (const msg of messages) {
    const msgTokens = msg.content.split(/\s+/).length;
    if (totalTokens + msgTokens > maxTokens) break;
    recentMessages.push(msg);
    totalTokens += msgTokens;
  }

  return recentMessages.reverse();
}

/**
 * Clear all messages in a session
 */
export function clearSession(sessionId: string): boolean {
  const session = getSession(sessionId);
  if (!session) return false;

  session.messages = [];
  session.contextUsage = 0;
  session.updatedAt = Date.now();
  session.metadata.totalQuestions = 0;
  session.metadata.totalResponses = 0;
  session.metadata.avgResponseTime = 0;

  logger.info(`Cleared messages in session ${sessionId}`);
  return true;
}

/**
 * Get session statistics
 */
export function getSessionStats(sessionId: string): object | null {
  const session = getSession(sessionId);
  if (!session) return null;

  return {
    sessionId: session.sessionId,
    title: session.title,
    messageCount: session.messages.length,
    createdAt: new Date(session.createdAt).toISOString(),
    updatedAt: new Date(session.updatedAt).toISOString(),
    ageMinutes: Math.round((Date.now() - session.createdAt) / 60000),
    contextUsage: {
      current: session.contextUsage,
      max: MAX_CONTEXT_TOKENS,
      percentage: Math.round((session.contextUsage / MAX_CONTEXT_TOKENS) * 100),
    },
    metadata: session.metadata,
  };
}

/**
 * Check if context window is full
 */
export function isContextWindowFull(sessionId: string): boolean {
  const session = getSession(sessionId);
  if (!session) return false;

  return session.contextUsage >= MAX_CONTEXT_TOKENS * 0.9; // 90% threshold
}

/**
 * Summarize old messages to save context
 * (In production, use LLM to summarize)
 */
export function compressMessageHistory(sessionId: string): boolean {
  const session = getSession(sessionId);
  if (!session || session.messages.length < 10) return false;

  // Keep only recent messages, remove older ones
  const oldMessages = session.messages.slice(0, Math.floor(session.messages.length / 2));
  const recentMessages = session.messages.slice(-Math.ceil(session.messages.length / 2));

  // Create a summary message
  const questionCount = oldMessages.filter((m) => m.role === 'user').length;
  const summaryMessage: ConversationMessage = {
    id: generateMessageId(),
    role: 'assistant',
    content: `[Summary: Previous conversation had ${questionCount} questions. Continuing from latest context...]`,
    timestamp: Date.now(),
  };

  session.messages = [...recentMessages, summaryMessage];
  session.contextUsage = calculateContextUsage(session.messages);
  session.updatedAt = Date.now();

  logger.info(
    `Compressed message history in session ${sessionId}. New message count: ${session.messages.length}`
  );

  return true;
}

/**
 * Export session as JSON
 */
export function exportSession(sessionId: string): string | null {
  const session = getSession(sessionId);
  if (!session) return null;

  const exportData = {
    session: {
      sessionId: session.sessionId,
      title: session.title,
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date(session.updatedAt).toISOString(),
      metadata: session.metadata,
    },
    messages: session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString(),
      questionType: msg.questionType,
      sources: msg.sources,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import session from JSON
 */
export function importSession(jsonData: string): ConversationSession | null {
  try {
    const data = JSON.parse(jsonData);
    if (!data.session || !data.messages) {
      logger.error('Invalid session import format');
      return null;
    }

    const sessionId = generateSessionId();
    const session: ConversationSession = {
      sessionId,
      title: data.session.title,
      messages: data.messages.map((msg: any) => ({
        id: generateMessageId(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        questionType: msg.questionType,
        sources: msg.sources,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextUsage: calculateContextUsage(
        data.messages.map((msg: any) => ({
          id: generateMessageId(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp).getTime(),
        }))
      ),
      metadata: {
        totalQuestions: data.messages.filter((m: any) => m.role === 'user').length,
        totalResponses: data.messages.filter((m: any) => m.role === 'assistant').length,
        avgResponseTime: 0,
      },
    };

    sessions.set(sessionId, session);
    logger.info(`Imported session: ${sessionId}`);

    return session;
  } catch (error) {
    logger.error(`Failed to import session: ${error}`);
    return null;
  }
}

/**
 * Get all sessions for a user (admin/debug function)
 */
export function getAllSessions(): object {
  const allSessions = Array.from(sessions.values());
  return {
    totalSessions: allSessions.length,
    sessions: allSessions.map((session) => ({
      sessionId: session.sessionId,
      title: session.title,
      messageCount: session.messages.length,
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date(session.updatedAt).toISOString(),
      contextUsage: {
        current: session.contextUsage,
        max: MAX_CONTEXT_TOKENS,
        percentage: Math.round((session.contextUsage / MAX_CONTEXT_TOKENS) * 100),
      },
    })),
  };
}

// Export constants for testing
export const CONSTANTS = {
  MAX_CONTEXT_TOKENS,
  MESSAGE_TOKEN_ESTIMATE,
  MAX_MESSAGES_PER_SESSION,
  SESSION_TIMEOUT,
};