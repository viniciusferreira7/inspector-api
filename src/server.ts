import { fastify } from 'fastify';
import { env } from './env';
import { fastifyCors } from './http/plugins/fastify-cors';
import { fastifySwagger } from './http/plugins/fastify-swagger';
import { zodTypeProvider } from './http/plugins/zod-type-provider';

const app = fastify();

zodTypeProvider(app);
fastifyCors(app);
fastifySwagger(app);

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`HTTP server running on port ${env.PORT}! 🚀`);
  console.log('📚 Docs available at /docs');
});

//TODO: 18:00
