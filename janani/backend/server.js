import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(backendDirectory, '.env') });

const { createApp } = await import('./src/app.js');
const { pool } = await import('./src/db.js');

const port = Number(process.env.PORT || 5000);
const app = createApp();
const server = app.listen(port, () => {
  if (process.env.NODE_ENV !== 'test') console.log(`JANANI API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await pool.end();
  server.close(() => process.exit(0));
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
