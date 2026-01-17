import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLogger } from '../utils/logger.ts';

const logger = getLogger();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../logs');
const FRONTEND_LOG_FILE = path.join(LOG_DIR, 'front.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

logger.info('Logs controller initialized', { LOG_DIR, FRONTEND_LOG_FILE });

export const receiveFrontendLog = (req: Request, res: Response) => {
  try {
    let logData;

    // Handle both JSON body and beacon data
    if (typeof req.body === 'string') {
      try {
        logData = JSON.parse(req.body);
      } catch (e) {
        logger.error('Failed to parse JSON from beacon data', { body: req.body, error: e });
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    } else {
      logData = req.body;
    }

    const { timestamp, level, message, data } = logData;

    if (!timestamp || !level || !message) {
      logger.error('Missing required fields in log', { logData, timestamp, level, message });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dataStr = data ? ' ' + JSON.stringify(data) : '';
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}\n`;

    // Write to frontend log file
    try {
      fs.appendFileSync(FRONTEND_LOG_FILE, logEntry, 'utf-8');
    } catch (fileError) {
      logger.error('Failed to write to frontend log file', { path: FRONTEND_LOG_FILE, error: fileError });
    }

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
