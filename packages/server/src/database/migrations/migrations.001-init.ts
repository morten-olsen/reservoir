import type { Migration } from './migrations.types.ts';

const tableNames = {
  documents: 'documents',
};

const init: Migration = {
  name: 'init',
  up: async (knex) => {
    await knex.schema.createTable(tableNames.documents, (table) => {
      table.string('id').notNullable();
      table.string('type').notNullable();
      table.string('source').nullable();
      table.jsonb('data').notNullable();
      table.datetime('createdAt').notNullable();
      table.datetime('updatedAt').notNullable();
      table.datetime('deletedAt').nullable();
      table.primary(['id', 'type']);
    });
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists(tableNames.documents);
  },
};

type DocumentRow = {
  id: string;
  type: string;
  source: string | null;
  data: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type Tables = {
  document: DocumentRow;
};

export type { Tables };
export { init, tableNames };
