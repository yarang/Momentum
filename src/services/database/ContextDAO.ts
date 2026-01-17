/**
 * Context Data Access Object
 *
 * Provides database operations for Context entities.
 * Handles CRUD operations for captured contexts.
 */

import { Context, ContextStatus } from '@/shared/models';
import { DatabaseService } from './DatabaseService';
import { Entity } from '@/shared/models/Entity.types';

/**
 * Context row from database
 */
interface ContextRow {
  id: string;
  data: string;
  status: string;
  created_at: number;
  updated_at: number;
}

/**
 * Context DAO for database operations
 */
export class ContextDAO {
  constructor(private db: DatabaseService) {}

  /**
   * Convert database row to Context entity
   */
  private rowToContext(row: ContextRow, entities: Entity[] = []): Context {
    return {
      id: row.id,
      data: JSON.parse(row.data),
      entities,
      status: row.status as ContextStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Insert a new context
   */
  async insert(context: Context): Promise<void> {
    const data = {
      id: context.id,
      data: JSON.stringify(context.data),
      status: context.status,
      created_at: context.createdAt,
      updated_at: context.updatedAt,
    };

    await this.db.insert('contexts', data);

    // Insert entities
    if (context.entities && context.entities.length > 0) {
      for (const entity of context.entities) {
        await this.insertEntity(context.id, entity);
      }
    }
  }

  /**
   * Insert an entity for a context
   */
  private async insertEntity(contextId: string, entity: Entity): Promise<void> {
    const data = {
      id: entity.id,
      context_id: contextId,
      type: entity.type,
      value: entity.value || null,
      raw_text: entity.rawText,
      confidence: entity.confidence,
      metadata: entity.metadata ? JSON.stringify(entity.metadata) : null,
      created_at: Date.now(),
    };

    await this.db.insert('entities', data);
  }

  /**
   * Get context by ID with entities
   */
  async getById(id: string): Promise<Context | null> {
    const row = await this.db.getById<ContextRow>('contexts', id);
    if (!row) return null;

    const entities = await this.getEntitiesForContext(id);
    return this.rowToContext(row, entities);
  }

  /**
   * Get all contexts
   */
  async getAll(options?: {
    limit?: number;
    offset?: number;
    status?: ContextStatus;
    orderBy?: 'created_at' | 'updated_at';
    order?: 'ASC' | 'DESC';
  }): Promise<Context[]> {
    let sql = 'SELECT * FROM contexts';
    const params: unknown[] = [];

    if (options?.status) {
      sql += ' WHERE status = ?';
      params.push(options.status);
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.order || 'DESC'}`;
    }

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = await this.db.query<ContextRow>(sql, params);

    // Load entities for each context
    const contexts: Context[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForContext(row.id);
      contexts.push(this.rowToContext(row, entities));
    }

    return contexts;
  }

  /**
   * Get entities for a context
   */
  private async getEntitiesForContext(contextId: string): Promise<Entity[]> {
    const rows = await this.db.query<{
      id: string;
      type: string;
      value: string | null;
      raw_text: string;
      confidence: number;
      metadata: string | null;
    }>(
      'SELECT * FROM entities WHERE context_id = ?',
      [contextId],
    );

    return rows.map(row => ({
      id: row.id,
      type: row.type as Entity['type'],
      value: row.value || undefined,
      rawText: row.raw_text,
      confidence: row.confidence,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  /**
   * Get contexts by status
   */
  async getByStatus(status: ContextStatus): Promise<Context[]> {
    return this.getAll({ status, orderBy: 'created_at', order: 'DESC' });
  }

  /**
   * Get contexts by source type
   */
  async getBySource(source: string): Promise<Context[]> {
    const rows = await this.db.query<ContextRow>(
      'SELECT * FROM contexts ORDER BY created_at DESC',
      [],
    );

    // Filter by source in memory (since source is in JSON data)
    const contexts: Context[] = [];
    for (const row of rows) {
      const data = JSON.parse(row.data);
      if (data.source === source) {
        const entities = await this.getEntitiesForContext(row.id);
        contexts.push(this.rowToContext(row, entities));
      }
    }

    return contexts;
  }

  /**
   * Update context status
   */
  async updateStatus(id: string, status: ContextStatus): Promise<void> {
    await this.db.update(
      'contexts',
      { status, updated_at: Date.now() },
      'id = ?',
      [id],
    );
  }

  /**
   * Update context data
   */
  async updateData(id: string, data: unknown, entities: Entity[] = []): Promise<void> {
    await this.db.update(
      'contexts',
      {
        data: JSON.stringify(data),
        updated_at: Date.now(),
      },
      'id = ?',
      [id],
    );

    // Delete old entities and insert new ones
    await this.db.delete('entities', 'context_id = ?', [id]);
    for (const entity of entities) {
      await this.insertEntity(id, entity);
    }
  }

  /**
   * Delete context by ID (entities will be cascade deleted)
   */
  async delete(id: string): Promise<void> {
    await this.db.delete('contexts', 'id = ?', [id]);
  }

  /**
   * Delete contexts by status
   */
  async deleteByStatus(status: ContextStatus): Promise<void> {
    await this.db.delete('contexts', 'status = ?', [status]);
  }

  /**
   * Count contexts
   */
  async count(status?: ContextStatus): Promise<number> {
    if (status) {
      return this.db.count('contexts', 'status = ?', [status]);
    }
    return this.db.count('contexts');
  }

  /**
   * Get contexts created within date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Context[]> {
    const rows = await this.db.query<ContextRow>(
      `SELECT * FROM contexts
       WHERE created_at >= ? AND created_at <= ?
       ORDER BY created_at DESC`,
      [startDate.getTime(), endDate.getTime()],
    );

    const contexts: Context[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForContext(row.id);
      contexts.push(this.rowToContext(row, entities));
    }

    return contexts;
  }

  /**
   * Search contexts by data content
   */
  async search(query: string, limit: number = 50): Promise<Context[]> {
    const rows = await this.db.query<ContextRow>(
      `SELECT * FROM contexts
       WHERE data LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [`%${query}%`, limit],
    );

    const contexts: Context[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForContext(row.id);
      contexts.push(this.rowToContext(row, entities));
    }

    return contexts;
  }
}
