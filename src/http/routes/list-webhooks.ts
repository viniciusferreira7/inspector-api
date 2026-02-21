import { desc, lt } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { drizzleDb } from '@/db';
import { webhooks } from '@/db/schema';

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List webhooks',
        operationId: 'listWebhooks',
        tags: ['Webhooks'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
          cursor: z.uuidv7().optional(),
        }),
        response: {
          200: z.object({
            webhooks: z.array(
              createSelectSchema(webhooks).pick({
                id: true,
                method: true,
                pathname: true,
                createdAt: true,
              })
            ),
            nextCursor: z.uuidv7().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await drizzleDb
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)
        .where(
          request.query.cursor
            ? lt(webhooks.id, request?.query?.cursor)
            : undefined
        )
        .orderBy(desc(webhooks.id))
        .limit(request.query.limit + 1);

      const hasMore = result.length > request.query.limit;

      const items = hasMore ? result.splice(0, request.query.limit) : result;

      const lastWebhook = result[result.length - 1];

      reply.status(200).send({
        webhooks: items,
        nextCursor: hasMore ? lastWebhook?.id : null,
      });
    }
  );
};
