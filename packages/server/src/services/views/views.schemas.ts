import { z } from 'zod';

const columnInfoSchema = z.object({
  name: z.string(),
  dataType: z.string(),
  isNullable: z.boolean(),
});

type ColumnInfo = z.infer<typeof columnInfoSchema>;

const viewInfoSchema = z.object({
  name: z.string(),
  columns: z.array(columnInfoSchema),
});

type ViewInfo = z.infer<typeof viewInfoSchema>;

const viewUpsertRequestSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  columns: z
    .record(
      z.string(),
      z.object({
        description: z.string().nullish(),
      }),
    )
    .optional(),
  query: z.string(),
});

type ViewUpsertRequest = z.infer<typeof viewUpsertRequestSchema>;

export type { ColumnInfo, ViewInfo, ViewUpsertRequest };
export { columnInfoSchema, viewInfoSchema, viewUpsertRequestSchema };
