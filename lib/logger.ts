/**
 * Structured JSON logging for production monitoring
 */

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogContext {
  generationId?: string;
  slug?: string;
  operation?: string;
  duration?: number;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
}

/**
 * Create a structured log entry
 */
function createLogEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
}

/**
 * Log an info message
 */
export function logInfo(message: string, context: LogContext = {}): void {
  const entry = createLogEntry('info', message, context);
  console.log(JSON.stringify(entry));
}

/**
 * Log a warning message
 */
export function logWarn(message: string, context: LogContext = {}): void {
  const entry = createLogEntry('warn', message, context);
  console.warn(JSON.stringify(entry));
}

/**
 * Log an error message
 */
export function logError(message: string, error?: Error, context: LogContext = {}): void {
  const errorContext: LogContext = {
    ...context,
  };

  if (error) {
    errorContext.error = {
      name: error.name,
      message: error.message,
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  }

  const entry = createLogEntry('error', message, errorContext);
  console.error(JSON.stringify(entry));
}

/**
 * Log with duration measurement
 */
export async function logWithDuration<T>(
  operation: string,
  fn: () => Promise<T>,
  context: LogContext = {}
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    logInfo(`${operation} completed`, { ...context, operation, duration });
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    logError(
      `${operation} failed`,
      error instanceof Error ? error : new Error(String(error)),
      { ...context, operation, duration }
    );
    throw error;
  }
}
