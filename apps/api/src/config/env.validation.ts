import { z } from 'zod';

// Validated environment. Fails fast at boot if anything is missing/malformed.
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .optional(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  AI_API_KEY: z.string().optional().default(''),
  AI_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  AI_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${parsed.error.toString()}`,
    );
  }
  return parsed.data;
}
