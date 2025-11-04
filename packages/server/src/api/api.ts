import fastify from 'fastify';
import fastifySensible from '@fastify/sensible';
import fastifySwagger from '@fastify/swagger';
import fastifyScalar from '@scalar/fastify-api-reference';
import YAML from 'yaml';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { documentsPlugin } from './api.documents.ts';
import { viewsPlugin } from './api.views.ts';

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
  app.addContentTypeParser('application/yaml', { parseAs: 'buffer' }, (_, body, done) => {
    try {
      const parsed = YAML.parse(body.toString('utf8')); // Parse the buffer as YAML
      done(null, parsed); // Call done with null for error and the parsed object
    } catch {
      done(app.httpErrors.badRequest('Invalid YAML format'));
    }
  });

  await app.register(fastifySensible);

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

  await app.register(viewsPlugin, {
    prefix: '/api/v1/views',
  });

  app.addHook('onReady', async () => {
    app.swagger();
  });
  await app.ready();
  return app;
};

export { createApi };
