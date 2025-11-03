import { z } from 'zod';

const upsertDocumentRequestSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.string().min(1),
  source: z.string().min(1).nullable(),
  data: z.unknown(),
});

type UpsertDocumentRequest = z.infer<typeof upsertDocumentRequestSchema>;

const upsertDocumentResponseSchema = upsertDocumentRequestSchema.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  action: z.enum(['inserted', 'updated', 'skipped']),
});

type UpsertDocumentResponse = z.input<typeof upsertDocumentResponseSchema>;

export type { UpsertDocumentRequest, UpsertDocumentResponse };
export { upsertDocumentRequestSchema, upsertDocumentResponseSchema };
