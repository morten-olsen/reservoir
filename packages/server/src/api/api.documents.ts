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
      operationId: 'v1.documents.upsert',
      tags: ['documents'],
      summary: 'Upsert documents',
      body: upsertDocumentRequestSchema,
      response: {
        200: upsertDocumentResponseSchema,
      },
    },
    handler: async (req, reply) => {
      const documentsService = app.services.get(DocumentsService);
      const result = await documentsService.upsert(req.body);
      return reply.send(result);
    },
  });
};

export { documentsPlugin };
