import { defineConfig } from 'drizzle-kit';
import { env } from '@/env';

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schema: 'src/db/drizzle/schema/*',
  out: 'src/db/drizzle/migrations',
  casing: 'snake_case',
});
