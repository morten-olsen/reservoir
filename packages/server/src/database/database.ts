import knex, { type Knex } from 'knex';

import { migrationSource } from './migrations/migrations.ts';

import { destroy, Services } from '#root/utils/utils.services.ts';
import { ConfigService } from '#root/config/config.ts';

class DatabaseService {
  #services: Services;
  #instance?: Promise<Knex>;

  constructor(services: Services) {
    this.#services = services;
  }

  #setup = async () => {
    const configService = this.#services.get(ConfigService);
    const db = knex({
      client: configService.database.client,
      connection: configService.database.connection,
      useNullAsDefault: true,
    });

    await db.migrate.latest({
      migrationSource,
    });

    return db;
  };

  public getInstance = () => {
    if (!this.#instance) {
      this.#instance = this.#setup();
    }
    return this.#instance;
  };

  [destroy] = async () => {
    if (!this.#instance) {
      return;
    }
    const instance = await this.#instance;
    await instance.destroy();
  };

  public ready = async () => {
    await this.getInstance();
  };
}

export { tableNames, type Tables } from './migrations/migrations.ts';
export { DatabaseService };
