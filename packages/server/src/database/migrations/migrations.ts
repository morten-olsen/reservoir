import type { Knex } from 'knex';

import { init, tableNames, type Tables } from './migrations.001-init.ts';
import type { Migration } from './migrations.types.ts';

const migrations = [init];

const migrationSource: Knex.MigrationSource<Migration> = {
  getMigration: async (migration) => migration,
  getMigrationName: (migration: Migration) => migration.name,
  getMigrations: async () => migrations,
};

export { tableNames, type Tables };
export { migrationSource };
