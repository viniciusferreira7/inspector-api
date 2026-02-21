import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { drizzleDb } from '@/db';
import { webhooks } from '@/db/schema';

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
  app.all(
    '/capture/*',
    {
      schema: {
        summary: 'Capture incoming webhook request',
        operationId: 'captureWebhook',
        tags: ['External'],
        response: {
          201: z.object({ id: z.uuidv7() }),
        },
      },
    },
    async (request, reply) => {
      const method = request.method;
      const pathname = new URL(request.url).pathname.replace('/capture', '');
      const ip = request.ip;
      const statusCode = 200;
      const contentType = request.headers['content-type'];
      const contentLength = request.headers['content-length']
        ? Number(request.headers['content-length'])
        : 0;
      const queryParams = request.query as Record<string, string> | null;
      const headers = Object.fromEntries(
        Object.entries(request.headers).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      );
      let body: string | null = null;

      if (request.body) {
        body =
          typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body, null, 2);
      }

      const result = await drizzleDb
        .insert(webhooks)
        .values({
          method,
          pathname,
          ip,
          statusCode,
          contentType,
          contentLength,
          queryParams,
          headers,
          body,
        })
        .returning();

      return reply.status(201).send({ id: result[0].id });
    }
  );
};
