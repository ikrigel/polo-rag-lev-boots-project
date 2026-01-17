import { Request, Response } from 'express';
import { getLogger } from '../utils/logger';
import * as ConversationalRAG from '../BusinessLogic/ConversationalRAG.js';
import { ask } from '../services/ragService.js';

const logger = getLogger();

/**
 * POST /api/conversational/session/create
 * Create a new conversation session
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body || {};
    const session = ConversationalRAG.createSession(title);

    logger.info(`Created conversation session: ${session.sessionId}`);
    res.status(201).json({
      ok: true,
      session,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error creating session: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to create session',
    });
  }
};

/**
 * GET /api/conversational/session/:sessionId
 * Get session details
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = ConversationalRAG.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    logger.debug(`Retrieved session: ${sessionId}`);
    res.status(200).json({
      ok: true,
      session,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting session: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get session',
    });
  }
};

/**
 * GET /api/conversational/sessions
 * List all active sessions
 */
export const listSessions = async (_: Request, res: Response): Promise<void> => {
  try {
    const sessions = ConversationalRAG.listSessions();

    logger.debug(`Listed ${sessions.length} sessions`);
    res.status(200).json({
      ok: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error listing sessions: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to list sessions',
    });
  }
};

/**
 * DELETE /api/conversational/session/:sessionId
 * Delete a session
 */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const deleted = ConversationalRAG.deleteSession(sessionId);

    if (!deleted) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    logger.info(`Deleted session: ${sessionId}`);
    res.status(200).json({
      ok: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting session: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to delete session',
    });
  }
};

/**
 * POST /api/conversational/session/:sessionId/message
 * Send a message and get a response
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { userQuestion } = req.body || {};

    if (!userQuestion) {
      res.status(400).json({
        ok: false,
        error: 'userQuestion is required',
      });
      return;
    }

    const session = ConversationalRAG.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    // Add user message
    const userMsg = ConversationalRAG.addMessage(
      sessionId,
      'user',
      userQuestion
    );

    if (!userMsg) {
      res.status(500).json({
        ok: false,
        error: 'Failed to add user message',
      });
      return;
    }

    // Get RAG answer
    const ragResponse = await ask(userQuestion);

    // Add assistant message
    const assistantMsg = ConversationalRAG.addMessage(
      sessionId,
      'assistant',
      ragResponse.answer,
      ragResponse.sources
    );

    if (!assistantMsg) {
      res.status(500).json({
        ok: false,
        error: 'Failed to add assistant message',
      });
      return;
    }

    logger.info(`Message exchange in session ${sessionId}`);
    res.status(200).json({
      ok: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      ragResponse: ragResponse,
      contextUsage: session.contextUsage,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error sending message: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to send message',
    });
  }
};

/**
 * GET /api/conversational/session/:sessionId/messages
 * Get all messages in a session
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const messages = ConversationalRAG.getMessages(sessionId);

    logger.debug(`Retrieved ${messages.length} messages from session ${sessionId}`);
    res.status(200).json({
      ok: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting messages: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get messages',
    });
  }
};

/**
 * POST /api/conversational/session/:sessionId/clear
 * Clear all messages in a session
 */
export const clearSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const cleared = ConversationalRAG.clearSession(sessionId);

    if (!cleared) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    logger.info(`Cleared session: ${sessionId}`);
    res.status(200).json({
      ok: true,
      message: 'Session cleared successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error clearing session: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to clear session',
    });
  }
};

/**
 * GET /api/conversational/session/:sessionId/stats
 * Get session statistics
 */
export const getSessionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const stats = ConversationalRAG.getSessionStats(sessionId);

    if (!stats) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    logger.debug(`Retrieved stats for session ${sessionId}`);
    res.status(200).json({
      ok: true,
      stats,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting session stats: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get session stats',
    });
  }
};

/**
 * GET /api/conversational/session/:sessionId/export
 * Export session as JSON
 */
export const exportSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const exportData = ConversationalRAG.exportSession(sessionId);

    if (!exportData) {
      res.status(404).json({
        ok: false,
        error: 'Session not found',
      });
      return;
    }

    logger.info(`Exported session: ${sessionId}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="session_${sessionId}.json"`);
    res.status(200).send(exportData);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error exporting session: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to export session',
    });
  }
};