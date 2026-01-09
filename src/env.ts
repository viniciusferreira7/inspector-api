import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),

  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('inspector_api'),
  DATABASE_URL: z.url(),
});

const envSchemaResult = envSchema.safeParse(process.env);

if (envSchemaResult.success === false) {
  console.error(
    '❌ Invalid environment variables',
    envSchemaResult.error.issues
  );
  throw new Error('Invalid environment variables');
}

export const env = envSchemaResult.data;
