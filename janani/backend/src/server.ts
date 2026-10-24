import { PrismaClient } from '@prisma/client';
import { loadEnv } from './config/env';
import { createApp } from './otpApp';
import { logger } from './lib/logger';

const env = loadEnv();
const prisma = new PrismaClient();
const app = createApp({ prisma });
const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'JANANI API listening'));

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
