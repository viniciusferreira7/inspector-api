import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@/env';
import * as schema from './schema';

export const drizzleDb = drizzle(env.DATABASE_URL, {
  schema,
  casing: 'snake_case',
});
