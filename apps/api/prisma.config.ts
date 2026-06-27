import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// DATABASE_URL is read directly (not via env() helper) so that `prisma generate`
// works before .env exists — generation doesn't need the URL, only migrations
// and queries do. Those will fail clearly if the URL is missing at that point.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
