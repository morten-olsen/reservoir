import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { viewInfoSchema, viewUpsertRequestSchema } from '#root/services/views/views.schemas.ts';
import { ViewsService } from '#root/services/views/views.ts';

const viewsPlugin: FastifyPluginAsyncZod = async (app) => {
  app.route({
    method: 'GET',
    url: '',
    schema: {
      operationId: 'v1.views.list',
      tags: ['views'],
      summary: 'List views',
      response: {
        200: z.object({
          items: z.array(viewInfoSchema),
        }),
      },
    },
    handler: async (req, reply) => {
      const viewsService = app.services.get(ViewsService);
      const items = await viewsService.list();
      return reply.send({ items });
    },
  });

  app.route({
    method: 'PUT',
    url: '/:name',
    schema: {
      operationId: 'v1.views.list',
      tags: ['views'],
      summary: 'Upsert view',
      params: z.object({
        name: z.string(),
      }),
      body: viewUpsertRequestSchema.omit({
        name: true,
      }),
      response: {
        200: z.object({
          name: z.string(),
        }),
      },
    },
    handler: async (req, reply) => {
      const input = {
        ...req.body,
        name: req.params.name,
      };
      const viewsService = app.services.get(ViewsService);
      await viewsService.upsert(input);
      reply.send({
        name: req.params.name,
      });
    },
  });

  app.route({
    method: 'DELETE',
    url: '/:name',
    schema: {
      operationId: 'v1.views.delete',
      tags: ['views'],
      summary: 'Delete view',
      params: z.object({
        name: z.string(),
      }),
      response: {
        200: z.object({
          name: z.string(),
        }),
      },
    },
    handler: async (req, reply) => {
      const viewsService = app.services.get(ViewsService);
      await viewsService.remove(req.params.name);
      reply.send({
        name: req.params.name,
      });
    },
  });
};

export { viewsPlugin };
