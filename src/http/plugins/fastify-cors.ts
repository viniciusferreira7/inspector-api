import { fastifyCors as fastifyCorsPlugin } from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { env } from '../../env';

export function fastifyCors(app: FastifyInstance) {
  app.register(fastifyCorsPlugin, {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
}
