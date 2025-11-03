import equal from 'fast-deep-equal';
import Queue from 'p-queue';

import type { UpsertDocumentRequest, UpsertDocumentResponse } from './documents.schemas.ts';

import { DatabaseService, tableNames, type Tables } from '#root/database/database.ts';
import type { Services } from '#root/utils/utils.services.ts';

class DocumentsService {
  #services: Services;
  #queue: Queue;

  constructor(services: Services) {
    this.#services = services;
    this.#queue = new Queue({
      concurrency: 10,
    });
  }

  public upsert = (document: UpsertDocumentRequest): Promise<UpsertDocumentResponse> =>
    this.#queue.add(async () => {
      const dbService = this.#services.get(DatabaseService);
      const db = await dbService.getInstance();

      const id = document.id || crypto.randomUUID();

      const [current] = await db<Tables['document']>(tableNames).where({
        id,
        type: document.type,
      });
      const now = new Date();

      if (!current) {
        await db<Tables['document']>(tableNames.documents).insert({
          id,
          type: document.type,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          data: JSON.stringify(document.data),
        });
        return {
          data: document.data,
          id,
          type: document.type,
          source: document.source || null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          deletedAt: null,
          action: 'inserted',
        };
      }
      const currentData = typeof current.data === 'string' ? JSON.parse(current.data) : current.data;
      if (equal(currentData, document.data)) {
        return {
          ...current,
          data: currentData,
          id,
          createdAt: new Date(current.createdAt).toISOString(),
          updatedAt: new Date(current.updatedAt).toISOString(),
          deletedAt: current.deletedAt ? new Date(current.deletedAt).toISOString() : null,
          action: 'skipped',
        };
      }
      await db<Tables['document']>(tableNames.documents)
        .update({
          source: document.source,
          data: JSON.stringify(document.data),
          updatedAt: now.toISOString(),
        })
        .where({ id, type: document.type });
      return {
        ...current,
        id,
        data: document.data,
        createdAt: new Date(current.createdAt).toISOString(),
        updatedAt: now.toISOString(),
        deletedAt: current.deletedAt ? new Date(current.deletedAt).toISOString() : null,
        action: 'updated',
      };
    });
}

export { DocumentsService };
