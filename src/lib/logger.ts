type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function log(entry: Omit<LogEntry, 'timestamp'>) {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    const method = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log';
    console[method](`[${logEntry.level.toUpperCase()}] [${logEntry.context}]`, logEntry.message, logEntry.error || '');
    return;
  }

  // Production: structured JSON (future: forward to Sentry / external service)
  console.log(JSON.stringify(logEntry));
}

export const logger = {
  info: (message: string, context?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'info', message, context, metadata }),
  warn: (message: string, context?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'warn', message, context, metadata }),
  error: (message: string, error?: unknown, context?: string, metadata?: Record<string, unknown>) =>
    log({ level: 'error', message, error: error ? formatError(error) : undefined, context, metadata }),
};
