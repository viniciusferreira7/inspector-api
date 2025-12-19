import { fastifySwagger as fastifySwaggerPlugin } from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export function fastifySwagger(app: FastifyInstance) {
  app.register(fastifySwaggerPlugin, {
    openapi: {
      info: {
        title: 'Webhook inspector',
        description: 'API for capturing and inspecting webhook requests',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(ScalarApiReference, {
    routePrefix: '/docs',
  });
}
