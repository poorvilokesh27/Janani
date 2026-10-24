import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().startsWith('mysql://'),
  REDIS_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  OTP_HMAC_SECRET: z.string().min(16),
  ENCRYPTION_KEY: z.string().min(32),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DEFAULT_LANGUAGE: z.enum(['en', 'kn', 'hi']).default('en'),
  SUPPORTED_LANGUAGES: z.string().default('en,kn,hi'),
  EMERGENCY_ACTIVATION_WEEK: z.coerce.number().int().min(1).max(42).default(36),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.data;
}
