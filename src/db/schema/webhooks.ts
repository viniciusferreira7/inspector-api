import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const httpMethodEnum = pgEnum('http_method', [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'TRACE',
  'CONNECT',
]);

export const webhooks = pgTable(
  'webhooks',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    method: httpMethodEnum('method').notNull(),
    pathname: text().notNull(),
    ip: text().notNull(),
    statusCode: integer('status_code').notNull(),
    contentType: text(),
    contentLength: integer(),
    queryParams: jsonb().$type<Record<string, string>>(),
    headers: jsonb().$type<Record<string, string>>().notNull(),
    body: text(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    check(
      'status_code_range',
      sql`${table.statusCode} >= 100 AND ${table.statusCode} <= 599`
    ),
  ]
);

//TODO: 45:00
