/**
 * @module index
 * @description Express server entry point.
 * Configures middleware stack, mounts API routes, and starts the HTTP server.
 * Implements security best practices: helmet, CORS, rate limiting, input validation.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getConfig } from './config/environment';
import { getDatabase, closeDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './api/middlewares/errorHandler.middleware';

// Route imports
import authRoutes from './api/routes/auth.routes';
import footprintRoutes from './api/routes/footprint.routes';
import statsRoutes from './api/routes/stats.routes';
import recommendationsRoutes from './api/routes/recommendations.routes';

/**
 * Create and configure the Express application.
 * Exported separately for testing (Supertest can use the app without starting the server).
 */
export function createApp(): express.Application {
  const app = express();
  const config = getConfig();

  // ─── Security Middleware ────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Rate limiting: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ─── Body Parsing ──────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ─── Health Check ──────────────────────────────────────────────
  app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV,
      },
    });
  });

  // ─── API Routes ────────────────────────────────────────────────
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/footprint', footprintRoutes);
  app.use('/api/v1/stats', statsRoutes);
  app.use('/api/v1/recommendations', recommendationsRoutes);

  // ─── Error Handling ────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/** Start the server (only when not imported for testing) */
function startServer(): void {
  const config = getConfig();

  // Initialize database
  getDatabase();
  logger.info('Database initialized successfully');

  const app = createApp();
  const port = config.PORT;

  const server = app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`API base: http://localhost:${port}/api/v1`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────
  const shutdown = (signal: string): void => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      closeDatabase();
      logger.info('Server closed. Database connection released.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Only start server when run directly (not when imported by tests)
if (require.main === module) {
  startServer();
}
