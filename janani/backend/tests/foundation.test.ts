import request from 'supertest';
import { createApp } from '../src/app';
import { loadEnv } from '../src/config/env';

const validEnv = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: 'mysql://janani:janani@localhost:3306/janani_db',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  OTP_HMAC_SECRET: 'c'.repeat(16),
  ENCRYPTION_KEY: 'd'.repeat(32),
};

beforeEach(() => {
  Object.assign(process.env, validEnv);
});

test('health endpoint does not require a database connection', async () => {
  const response = await request(createApp()).get('/health');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: 'ok', service: 'janani-api' });
  expect(response.headers['x-request-id']).toBeTruthy();
});

test('readiness reports an unconfigured database dependency', async () => {
  const response = await request(createApp()).get('/ready');
  expect(response.status).toBe(503);
  expect(response.body).toEqual({ status: 'not_ready', database: 'not_configured' });
});

test('environment validation reports missing required values', () => {
  const invalid: NodeJS.ProcessEnv = { ...validEnv };
  invalid.JWT_ACCESS_SECRET = undefined;
  expect(() => loadEnv(invalid)).toThrow(/JWT_ACCESS_SECRET/);
});
