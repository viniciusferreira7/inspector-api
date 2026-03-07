import { eq } from 'drizzle-orm';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { drizzleDb } from '@/db';
import { webhooks } from '@/db/schema';

export const deleteWebhookById: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/api/webhooks/:id',
    {
      schema: {
        summary: 'Delete webhook by ID',
        operationId: 'deleteWebhookById',
        tags: ['Webhooks'],
        params: z.object({
          id: z.uuidv7(),
        }),
        response: {
          204: z.void(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await drizzleDb
        .delete(webhooks)
        .where(eq(webhooks.id, request.id))
        .returning();

      if (!result.length) {
        return reply.status(404).send({ message: 'Webhook not found' });
      }

      return reply.status(204).send();
    }
  );
};
