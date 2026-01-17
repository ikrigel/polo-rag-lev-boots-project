import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'server.log');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const writeToFile = (message: string): void => {
  try {
    fs.appendFileSync(logFile, `${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

export const logger = {
  info: (message: string, data?: any) => {
    const logMessage = `[${getTimestamp()}] ℹ️ INFO: ${message}`;
    const fullMessage = data ? `${logMessage} ${JSON.stringify(data)}` : logMessage;
    console.log(fullMessage);
    writeToFile(fullMessage);
  },

  error: (message: string, error?: any) => {
    const logMessage = `[${getTimestamp()}] ❌ ERROR: ${message}`;
    const errorDetails = error instanceof Error ? error.message : JSON.stringify(error);
    const fullMessage = `${logMessage}\nDetails: ${errorDetails}\nStack: ${error instanceof Error ? error.stack : 'N/A'}`;
    console.error(fullMessage);
    writeToFile(fullMessage);
  },

  warn: (message: string, data?: any) => {
    const logMessage = `[${getTimestamp()}] ⚠️ WARN: ${message}`;
    const fullMessage = data ? `${logMessage} ${JSON.stringify(data)}` : logMessage;
    console.warn(fullMessage);
    writeToFile(fullMessage);
  },

  debug: (message: string, data?: any) => {
    const logMessage = `[${getTimestamp()}] 🔍 DEBUG: ${message}`;
    const fullMessage = data ? `${logMessage} ${JSON.stringify(data)}` : logMessage;
    console.log(fullMessage);
    writeToFile(fullMessage);
  },

  section: (title: string) => {
    const separator = '='.repeat(60);
    const message = `\n${separator}\n${title}\n${separator}`;
    console.log(message);
    writeToFile(message);
  },
};

export default logger;
