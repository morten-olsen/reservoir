import equal from 'fast-deep-equal';

import type { UpsertDocumentRequest, UpsertDocumentResponse } from './documents.schemas.ts';

import { DatabaseService, tableNames, type Tables } from '#root/database/database.ts';
import type { Services } from '#root/utils/utils.services.ts';

class DocumentsService {
  #services: Services;

  constructor(services: Services) {
    this.#services = services;
  }

  public upsert = async (document: UpsertDocumentRequest): Promise<UpsertDocumentResponse> => {
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
    const currentData = JSON.parse(current.data);
    if (equal(currentData, document.data)) {
      return {
        ...current,
        data: currentData,
        id,
        createdAt: current.createdAt,
        updatedAt: current.updatedAt,
        deletedAt: current.deletedAt || null,
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
      createdAt: current.createdAt,
      updatedAt: now.toISOString(),
      deletedAt: current.deletedAt || null,
      action: 'updated',
    };
  };
}

export { DocumentsService };
