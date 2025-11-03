import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { DocumentsService } from '#root/services/documents/documents.ts';
import {
  upsertDocumentRequestSchema,
  upsertDocumentResponseSchema,
} from '#root/services/documents/documents.schemas.ts';

const documentsPlugin: FastifyPluginAsyncZod = async (app) => {
  app.route({
    method: 'POST',
    url: '',
    schema: {
      operationId: 'v1.documents.put',
      tags: ['documents'],
      summary: 'Upsert documents',
      body: z.object({
        items: z.array(upsertDocumentRequestSchema),
      }),
      response: {
        200: z.object({
          items: z.array(upsertDocumentResponseSchema),
        }),
      },
    },
    handler: async (req, reply) => {
      const documentsService = app.services.get(DocumentsService);
      const { items } = req.body;
      const results = await Promise.all(items.map((item) => documentsService.upsert(item)));
      return reply.send({ items: results });
    },
  });
};

export { documentsPlugin };
