import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getLogger } from '../utils/logger.ts';

const logger = getLogger();
const LOG_DIR = path.join(process.cwd(), 'logs');
const FRONTEND_LOG_FILE = path.join(LOG_DIR, 'front.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const receiveFrontendLog = (req: Request, res: Response) => {
  try {
    const { timestamp, level, message, data } = req.body;

    if (!timestamp || !level || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${
      data ? ' ' + JSON.stringify(data) : ''
    }\n`;

    // Write to frontend log file
    fs.appendFileSync(FRONTEND_LOG_FILE, logEntry, 'utf-8');

    // Also log in server logs for visibility
    if (level === 'error') {
      logger.error(`[FRONTEND] ${message}`, data);
    } else if (level === 'warn') {
      logger.warn(`[FRONTEND] ${message}`, data);
    } else {
      logger.info(`[FRONTEND] ${message}`, data);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing frontend log', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFrontendLogs = (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(FRONTEND_LOG_FILE)) {
      return res.json({ logs: '' });
    }

    const logs = fs.readFileSync(FRONTEND_LOG_FILE, 'utf-8');
    res.json({ logs });
  } catch (error) {
    logger.error('Error reading frontend logs', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearFrontendLogs = (req: Request, res: Response) => {
  try {
    if (fs.existsSync(FRONTEND_LOG_FILE)) {
      fs.unlinkSync(FRONTEND_LOG_FILE);
    }
    res.json({ success: true });
  } catch (error) {
    logger.error('Error clearing frontend logs', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
