import express from 'express';
import * as controller from '../controllers/conversationalController';

const router = express.Router();

/**
 * Session Management Endpoints
 */
router.post('/session/create', controller.createSession);
router.get('/session/:sessionId', controller.getSession);
router.get('/sessions', controller.listSessions);
router.delete('/session/:sessionId', controller.deleteSession);

/**
 * Message Endpoints
 */
router.post('/session/:sessionId/message', controller.sendMessage);
router.get('/session/:sessionId/messages', controller.getMessages);

/**
 * Session Utilities
 */
router.post('/session/:sessionId/clear', controller.clearSession);
router.get('/session/:sessionId/stats', controller.getSessionStats);
router.get('/session/:sessionId/export', controller.exportSession);

export default router;