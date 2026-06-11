/**
 * @module utils/logger
 * @description Winston logger with console and file transports.
 * Provides structured logging with timestamps and appropriate levels
 * for development and production environments.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/** Custom log format: timestamp [level]: message */
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const msg = stack || message;
  return `${String(ts)} [${level}]: ${String(msg)}`;
});

/** Determine log level based on environment */
function getLogLevel(): string {
  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'production':
      return 'warn';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
}

/** Build transport array based on environment */
function buildTransports(): winston.transport[] {
  const transports: winston.transport[] = [];

  // Console transport — always present
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );

  // File transports — only in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5 MB
        maxFiles: 5,
      }),
    );

    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    );
  }

  return transports;
}

/**
 * Application-wide Winston logger instance.
 *
 * @example
 * ```typescript
 * import { logger } from '../utils/logger';
 * logger.info('Server started on port 3001');
 * logger.error('Failed to connect', { error: err.message });
 * ```
 */
export const logger = winston.createLogger({
  level: getLogLevel(),
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
  transports: buildTransports(),
  exitOnError: false,
});

/**
 * HTTP request logging stream for use with Morgan or similar.
 */
export const httpLogStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

export default logger;
