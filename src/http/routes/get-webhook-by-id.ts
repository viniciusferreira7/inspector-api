import { eq } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { drizzleDb } from '@/db';
import { webhooks } from '@/db/schema';

export const getWebhookById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks/:id',
    {
      schema: {
        summary: 'Get webhook by ID',
        operationId: 'getWebhookById',
        tags: ['Webhooks'],
        params: z.object({
          id: z.uuidv7(),
        }),
        response: {
          200: createSelectSchema(webhooks),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await drizzleDb
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, request.id))
        .limit(1);

      if (!result.length) {
        return reply.status(404).send({ message: 'Webhook not found' });
      }

      return reply.status(200).send({ ...result[0] });
    }
  );
};
