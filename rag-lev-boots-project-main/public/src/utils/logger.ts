// Frontend logging utility
const LOG_ENDPOINT = '/api/logs';

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

const sendLogToBackend = (entry: LogEntry) => {
  // Use beacon API for reliable delivery even on page unload
  try {
    navigator.sendBeacon(
      LOG_ENDPOINT,
      JSON.stringify(entry)
    );
  } catch (err) {
    // Fallback to async fetch
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(err => {
      console.error('[Logger] Failed to send log to backend:', err);
    });
  }
};

export const logger = {
  debug: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      data,
    };
    console.debug(message, data);
    sendLogToBackend(entry);
  },

  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    };
    console.info(message, data);
    sendLogToBackend(entry);
  },

  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    };
    console.warn(message, data);
    sendLogToBackend(entry);
  },

  error: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data,
    };
    console.error(message, data);
    sendLogToBackend(entry);
  },
};

// Capture global errors
window.addEventListener('error', (event) => {
  logger.error('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise,
  });
});

// Intercept console.error to capture all error logs
const originalConsoleError = console.error;
console.error = function (...args: any[]) {
  originalConsoleError.apply(console, args);

  // Log to backend if it looks like an error we should track
  const message = args[0]?.toString?.() || JSON.stringify(args[0]);
  if (message && !message.includes('[Logger]')) {
    logger.error('Console error', {
      args: args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      )
    });
  }
};
