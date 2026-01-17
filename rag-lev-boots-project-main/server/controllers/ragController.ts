import { Request, Response } from 'express';
import { ask } from '../services/ragService.js';
import { loadDataToAI } from '../BusinessLogic/LoadDataToAI.js';
import logger from '../utils/logger.js';

export const loadData = async (_: Request, res: Response): Promise<void> => {
  const requestId = `REQ-${Date.now()}`;
  try {
    logger.info(`[${requestId}] Load Data endpoint called`);

    const startTime = Date.now();
    const result = await loadDataToAI();
    const duration = Date.now() - startTime;

    logger.info(`[${requestId}] Load Data completed`, {
      duration: `${duration}ms`,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      res.status(200).json({
        ok: true,
        message: result.message,
      });
    } else {
      logger.warn(`[${requestId}] Load Data returned failure`, {
        error: result.error || result.message,
      });
      res.status(400).json({
        ok: false,
        error: result.error || result.message,
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`[${requestId}] Error in loadData`, error);

    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to load data',
    });
  }
};

export const askQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userQuestion } = req.body || {};
    if (!userQuestion) {
      res.status(400).json({
        answer: '',
        error: 'You must provide the userQuestion',
      });
      return;
    }

    const result = await ask(userQuestion);
    res.status(200).json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error in askQuestion:', errorMsg);

    res.status(500).json({
      answer: '',
      error: 'Failed to get answer for question',
    });
  }
};
