import { fastify } from 'fastify';
import { env } from './env';
import { fastifyCors } from './http/plugins/fastify-cors';
import { fastifySwagger } from './http/plugins/fastify-swagger';
import { zodTypeProvider } from './http/plugins/zod-type-provider';
import { getWebhookById } from './http/routes/get-webhook-by-id';
import { listWebhooks } from './http/routes/list-webhooks';

const app = fastify();

zodTypeProvider(app);
fastifyCors(app);
fastifySwagger(app);

app.register(listWebhooks);
app.register(getWebhookById);

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`HTTP server running on port ${env.PORT}! 🚀`);
  console.log('--');
  console.log('📚  Docs available at /docs');
});
