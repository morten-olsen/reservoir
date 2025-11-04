import type { ViewInfo, ViewUpsertRequest } from './views.schemas.ts';

import { DatabaseService } from '#root/database/database.ts';
import type { Services } from '#root/utils/utils.services.ts';

class ViewsService {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  #listFromPostgres = async () => {
    const dbService = this.#services.get(DatabaseService);
    const db = await dbService.getInstance();
    const pgViewsResult = await db.raw<{ rows: { schema_name: string; view_name: string }[] }>(`
          SELECT
              schemaname AS schema_name,
              viewname AS view_name
          FROM
              pg_views
          WHERE
              schemaname NOT IN ('pg_catalog', 'information_schema', 'information_schema')
              AND viewname NOT LIKE 'pg_%'
              AND viewname NOT LIKE 'sql_%';
        `);
    const views: ViewInfo[] = await Promise.all(
      pgViewsResult.rows.map(async (row) => {
        const pgColumnsResult = await db.raw<{
          rows: { column_name: string; data_type: string; is_nullable: 'YES' | 'NO' }[];
        }>(
          `
            SELECT
                column_name,
                data_type,
                is_nullable
            FROM
                information_schema.columns
            WHERE
                table_schema = ?
                AND table_name = ?
            ORDER BY
                ordinal_position;
          `,
          [row.schema_name, row.view_name],
        );
        const result: ViewInfo = {
          name: row.view_name,
          columns: pgColumnsResult.rows.map((column) => ({
            name: column.column_name,
            dataType: column.data_type,
            isNullable: column.is_nullable === 'YES',
          })),
        };
        return result;
      }),
    );
    return views;
  };

  public list = async () => {
    const dbService = this.#services.get(DatabaseService);
    const db = await dbService.getInstance();

    switch (db.client.config.client) {
      case 'pg':
        return this.#listFromPostgres();
      default:
        throw new Error(`Client ${db.client} is not supported`);
    }
  };

  public upsert = async (options: ViewUpsertRequest) => {
    const { name, columns = {}, query, description } = options;
    const dbService = this.#services.get(DatabaseService);
    const db = await dbService.getInstance();
    const subquery = db.raw(query);
    await db.transaction(async (trx) => {
      await trx.schema.dropViewIfExists(name);
      await trx.schema.createViewOrReplace(name, (view) => {
        // view.columns(columns);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        view.as(subquery as any);
      });
      if (description) {
        const sql = trx.raw(`COMMENT ON VIEW ?? IS ?;`, [name, description]);
        await trx.raw(sql.toQuery());
      }
      for (const [columnName, info] of Object.entries(columns)) {
        const sql = trx.raw(`COMMENT ON COLUMN ??.?? IS ?;`, [name, columnName, info.description || null]);
        await trx.raw(sql.toQuery());
      }
    });
  };

  public remove = async (name: string) => {
    const dbService = this.#services.get(DatabaseService);
    const db = await dbService.getInstance();
    await db.schema.dropViewIfExists(name);
  };
}

export { ViewsService };
