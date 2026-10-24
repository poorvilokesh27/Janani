import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error';
import { requestId } from './middleware/requestId';
import { createAuthRouter } from './modules/auth/routes';
import { createPregnancyRouter } from './modules/pregnancy/routes';
import { createWellnessRouter } from './modules/wellness/routes';
import { createUsersRouter } from './modules/users/routes';
import { createChatRouter } from './modules/chat/routes';
import { createCycleRouter } from './modules/cycle/routes';

export interface AppDependencies {
  prisma?: PrismaClient;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const origins = loadEnv(process.env).CORS_ORIGINS.split(',').map((origin) => origin.trim());
  const prisma = dependencies.prisma;

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'janani-api' });
  });

  app.get('/ready', async (_req, res, next) => {
    if (!prisma) {
      res.status(503).json({ status: 'not_ready', database: 'not_configured' });
      return;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', database: 'connected' });
    } catch (error) {
      next(Object.assign(new Error('Database unavailable'), { statusCode: 503, cause: error }));
    }
  });

  if (prisma) app.use('/api/auth', createAuthRouter(prisma));
  if (prisma) app.use('/api/pregnancy', createPregnancyRouter(prisma));
  if (prisma) app.use('/api/wellness', createWellnessRouter(prisma));
  if (prisma) app.use('/api/users', createUsersRouter(prisma));
  if (prisma) app.use('/api/chat', createChatRouter());
  if (prisma) app.use('/api/cycles', createCycleRouter(prisma));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found', requestId: res.locals.requestId });
  });
  app.use(errorHandler);
  return app;
}
