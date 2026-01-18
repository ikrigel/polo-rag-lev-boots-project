/**
 * Utility functions for managing Conversational RAG Chat sessions
 * Provides localStorage persistence for chat conversations and sessions
 */

interface Message {
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
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  contextUsage: number;
}

interface ChatExport {
  title: string;
  createdAt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: string[];
  }>;
}

const STORAGE_KEYS = {
  SESSIONS: 'rag_sessions',
  CURRENT_SESSION: 'rag_current_session',
};

/**
 * Save all conversation sessions to localStorage
 * @param sessions - Array of ConversationSession objects to save
 */
export const saveConversationSessions = (sessions: ConversationSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save conversation sessions to localStorage:', error);
    throw new Error('Failed to save conversation sessions');
  }
};

/**
 * Load all conversation sessions from localStorage
 * @returns Array of ConversationSession objects, or empty array if none found
 */
export const loadConversationSessions = (): ConversationSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load conversation sessions from localStorage:', error);
    return [];
  }
};

/**
 * Save the current active session ID
 * @param sessionId - The ID of the current session
 */
export const saveCurrentSessionId = (sessionId: string | null): void => {
  try {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  } catch (error) {
    console.error('Failed to save current session ID:', error);
  }
};

/**
 * Load the current active session ID
 * @returns The current session ID or null if none set
 */
export const loadCurrentSessionId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Failed to load current session ID:', error);
    return null;
  }
};

/**
 * Create a new conversation session
 * @param title - Optional title for the session, defaults to current date
 * @returns The newly created ConversationSession
 */
export const createNewSession = (title?: string): ConversationSession => {
  const sessionId = `session_${Date.now()}`;
  const now = Date.now();

  const newSession: ConversationSession = {
    sessionId,
    title: title || `Conversation ${new Date(now).toLocaleDateString()}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
    contextUsage: 0,
  };

  const sessions = loadConversationSessions();
  sessions.unshift(newSession);
  saveConversationSessions(sessions);

  return newSession;
};

/**
 * Add a message to a specific session
 * @param sessionId - The ID of the session
 * @param message - The message to add
 */
export const addMessageToSession = (sessionId: string, message: Message): void => {
  const sessions = loadConversationSessions();
  const session = sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`);
  }

  session.messages.push(message);
  session.updatedAt = Date.now();
  saveConversationSessions(sessions);
};

/**
 * Update a session with new messages
 * @param sessionId - The ID of the session
 * @param messages - The updated messages array
 * @param contextUsage - Optional context usage to update
 */
export const updateSessionMessages = (
  sessionId: string,
  messages: Message[],
  contextUsage?: number
): void => {
  const sessions = loadConversationSessions();
  const session = sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`);
  }

  session.messages = messages;
  session.updatedAt = Date.now();
  if (contextUsage !== undefined) {
    session.contextUsage = contextUsage;
  }

  saveConversationSessions(sessions);
};

/**
 * Get a specific session by ID
 * @param sessionId - The ID of the session
 * @returns The ConversationSession or null if not found
 */
export const getSession = (sessionId: string): ConversationSession | null => {
  const sessions = loadConversationSessions();
  return sessions.find((s) => s.sessionId === sessionId) || null;
};

/**
 * Delete a conversation session
 * @param sessionId - The ID of the session to delete
 */
export const deleteSession = (sessionId: string): void => {
  const sessions = loadConversationSessions();
  const filteredSessions = sessions.filter((s) => s.sessionId !== sessionId);
  saveConversationSessions(filteredSessions);

  // Clear current session if deleted
  if (loadCurrentSessionId() === sessionId) {
    saveCurrentSessionId(null);
  }
};

/**
 * Clear all messages in a session
 * @param sessionId - The ID of the session
 */
export const clearSessionMessages = (sessionId: string): void => {
  const sessions = loadConversationSessions();
  const session = sessions.find((s) => s.sessionId === sessionId);

  if (session) {
    session.messages = [];
    session.contextUsage = 0;
    session.updatedAt = Date.now();
    saveConversationSessions(sessions);
  }
};

/**
 * Clear all conversation sessions
 */
export const clearAllSessions = (): void => {
  saveConversationSessions([]);
  saveCurrentSessionId(null);
};

/**
 * Update session title
 * @param sessionId - The ID of the session
 * @param newTitle - The new title
 */
export const updateSessionTitle = (sessionId: string, newTitle: string): void => {
  const sessions = loadConversationSessions();
  const session = sessions.find((s) => s.sessionId === sessionId);

  if (session) {
    session.title = newTitle;
    session.updatedAt = Date.now();
    saveConversationSessions(sessions);
  }
};

/**
 * Search sessions by title or message content
 * @param query - The search query
 * @returns Array of matching ConversationSession objects
 */
export const searchSessions = (query: string): ConversationSession[] => {
  const sessions = loadConversationSessions();
  const lowerQuery = query.toLowerCase();

  return sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(lowerQuery) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Export a session as a JSON object
 * @param sessionId - The ID of the session
 * @returns ChatExport object ready for download
 */
export const exportSession = (sessionId: string): ChatExport | null => {
  const session = getSession(sessionId);
  if (!session) return null;

  return {
    title: session.title,
    createdAt: new Date(session.createdAt).toISOString(),
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp).toISOString(),
      sources: m.sources,
    })),
  };
};

/**
 * Export all sessions
 * @returns Object containing all sessions with metadata
 */
export const exportAllSessions = () => {
  const sessions = loadConversationSessions();
  return {
    timestamp: new Date().toISOString(),
    totalSessions: sessions.length,
    totalMessages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
    sessions: sessions.map((session) => exportSession(session.sessionId)),
  };
};

/**
 * Import a session from exported data
 * @param chatData - The ChatExport data to import
 * @param title - Optional custom title for the imported session
 * @returns The newly created ConversationSession
 */
export const importSession = (chatData: ChatExport, title?: string): ConversationSession => {
  const sessionId = `session_${Date.now()}`;

  const messages: Message[] = chatData.messages.map((msg, index) => ({
    id: `msg_${sessionId}_${index}`,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp).getTime(),
    sources: msg.sources,
  }));

  const newSession: ConversationSession = {
    sessionId,
    title: title || chatData.title,
    messages,
    createdAt: new Date(chatData.createdAt).getTime(),
    updatedAt: Date.now(),
    contextUsage: messages.length * 100, // Estimate based on message count
  };

  const sessions = loadConversationSessions();
  sessions.unshift(newSession);
  saveConversationSessions(sessions);

  return newSession;
};

/**
 * Get session statistics
 * @returns Object containing statistics about stored sessions
 */
export const getSessionStats = () => {
  const sessions = loadConversationSessions();

  const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
  const totalContextUsage = sessions.reduce((sum, s) => sum + s.contextUsage, 0);
  const avgMessagesPerSession = sessions.length > 0 ? totalMessages / sessions.length : 0;

  const oldestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const newestSession = sessions.length > 0 ? sessions[0] : null;

  return {
    totalSessions: sessions.length,
    totalMessages,
    totalContextUsage,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100,
    oldestSession: oldestSession
      ? {
          sessionId: oldestSession.sessionId,
          title: oldestSession.title,
          createdAt: new Date(oldestSession.createdAt).toISOString(),
        }
      : null,
    newestSession: newestSession
      ? {
          sessionId: newestSession.sessionId,
          title: newestSession.title,
          createdAt: new Date(newestSession.createdAt).toISOString(),
        }
      : null,
    storageSizeBytes: JSON.stringify(sessions).length,
  };
};

/**
 * Get messages from a session
 * @param sessionId - The ID of the session
 * @returns Array of messages or empty array if session not found
 */
export const getSessionMessages = (sessionId: string): Message[] => {
  const session = getSession(sessionId);
  return session ? session.messages : [];
};

/**
 * Get recent sessions with a limit
 * @param limit - Number of recent sessions to retrieve
 * @returns Array of recent ConversationSession objects
 */
export const getRecentSessions = (limit: number = 10): ConversationSession[] => {
  const sessions = loadConversationSessions();
  return sessions.slice(0, limit);
};

/**
 * Sort sessions by a criteria
 * @param criteria - 'recent' | 'oldest' | 'title' | 'messageCount'
 * @returns Sorted array of ConversationSession objects
 */
export const sortSessions = (
  criteria: 'recent' | 'oldest' | 'title' | 'messageCount' = 'recent'
): ConversationSession[] => {
  const sessions = loadConversationSessions();

  const sorted = [...sessions];

  switch (criteria) {
    case 'recent':
      return sorted; // Already in recent order
    case 'oldest':
      return sorted.reverse();
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'messageCount':
      return sorted.sort((a, b) => b.messages.length - a.messages.length);
    default:
      return sorted;
  }
};

/**
 * Get total size of stored chat data in bytes
 * @returns Size in bytes
 */
export const getStorageSize = (): number => {
  const sessions = loadConversationSessions();
  return JSON.stringify(sessions).length;
};
