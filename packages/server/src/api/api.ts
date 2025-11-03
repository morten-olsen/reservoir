import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyScalar from '@scalar/fastify-api-reference';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { documentsPlugin } from './api.documents.ts';

import { Services } from '#root/utils/utils.services.ts';
import { DatabaseService } from '#root/database/database.ts';

const createApi = async (services: Services = new Services()) => {
  const db = services.get(DatabaseService);
  await db.ready();
  const app = fastify({
    logger: {
      level: 'warn',
      transport: {
        target: 'pino-pretty',
      },
    },
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate('services', services);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Reservoir',
        version: '1.0.0',
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifyScalar, {
    routePrefix: '/docs',
  });

  await app.register(documentsPlugin, {
    prefix: '/api/v1/documents',
  });

  app.addHook('onReady', async () => {
    app.swagger();
  });
  await app.ready();
  return app;
};

export { createApi };
