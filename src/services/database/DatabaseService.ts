/**
 * Database Service
 *
 * Encrypted SQLite database service using react-native-quick-sqlite.
 * Provides data persistence with SQLCipher encryption for privacy.
 *
 * @see https://github.com/margelo/react-native-quick-sqlite
 */

import { open, close, isOpen } from 'react-native-quick-sqlite';
import { ALL_TABLES } from './Database.schema';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Database name */
  name: string;
  /** Encryption key (should be stored securely) */
  encryptionKey: string;
  /** Database version for migrations */
  version: number;
}

/**
 * Database result type
 */
export type DbResult = {
  insertId: number;
  rows: {
    _array: unknown[];
    length: number;
  };
  rowsAffected: number;
};

/**
 * Database Service class
 * Manages encrypted SQLite database operations
 */
export class DatabaseService {
  private db: string;
  private encryptionKey: string;
  private version: number;

  constructor(config: DatabaseConfig) {
    this.db = config.name;
    this.encryptionKey = config.encryptionKey;
    this.version = config.version;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    try {
      // Open database with encryption
      await open(
        { name: this.db, location: 'default' },
        this.encryptionKey,
      );

      // Create all tables
      for (const sql of ALL_TABLES) {
        await this.execute(sql);
      }

      console.log(`[Database] ${this.db} initialized successfully`);
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      if (await isOpen({ name: this.db })) {
        await close({ name: this.db });
        console.log(`[Database] ${this.db} closed`);
      }
    } catch (error) {
      console.error('[Database] Close failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is open
   */
  async isOpen(): Promise<boolean> {
    return isOpen({ name: this.db });
  }

  /**
   * Execute SQL statement (INSERT, UPDATE, DELETE, CREATE, etc.)
   */
  async execute(sql: string, params: unknown[] = []): Promise<DbResult> {
    try {
      const result = await open(
        { name: this.db, location: 'default' },
        this.encryptionKey,
      ).execute(sql, params);
      return result as DbResult;
    } catch (error) {
      console.error('[Database] Execute failed:', sql, error);
      throw error;
    }
  }

  /**
   * Execute SQL query (SELECT)
   */
  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const result = await this.execute(sql, params);
      return result.rows._array as T[];
    } catch (error) {
      console.error('[Database] Query failed:', sql, error);
      throw error;
    }
  }

  /**
   * Insert a record
   */
  async insert(table: string, data: Record<string, unknown>): Promise<string> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    const result = await this.execute(sql, values);
    return result.insertId.toString();
  }

  /**
   * Update records
   */
  async update(
    table: string,
    data: Record<string, unknown>,
    where: string,
    whereParams: unknown[] = [],
  ): Promise<number> {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(data), ...whereParams];

    const sql = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${where}
    `;

    const result = await this.execute(sql, values);
    return result.rowsAffected;
  }

  /**
   * Delete records
   */
  async delete(
    table: string,
    where: string,
    whereParams: unknown[] = [],
  ): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.execute(sql, whereParams);
    return result.rowsAffected;
  }

  /**
   * Get single record by ID
   */
  async getById<T = unknown>(table: string, id: string): Promise<T | null> {
    const sql = `SELECT * FROM ${table} WHERE id = ? LIMIT 1`;
    const results = await this.query<T>(sql, [id]);
    return results[0] || null;
  }

  /**
   * Get all records from table
   */
  async getAll<T = unknown>(table: string, orderBy?: string): Promise<T[]> {
    const sql = orderBy
      ? `SELECT * FROM ${table} ORDER BY ${orderBy}`
      : `SELECT * FROM ${table}`;
    return this.query<T>(sql);
  }

  /**
   * Count records
   */
  async count(table: string, where?: string, whereParams: unknown[] = []): Promise<number> {
    const sql = where
      ? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
      : `SELECT COUNT(*) as count FROM ${table}`;

    const results = await this.query<{ count: number }>(sql, whereParams);
    return results[0]?.count || 0;
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<void> {
    await this.execute('BEGIN TRANSACTION');
  }

  /**
   * Commit transaction
   */
  async commit(): Promise<void> {
    await this.execute('COMMIT');
  }

  /**
   * Rollback transaction
   */
  async rollback(): Promise<void> {
    await this.execute('ROLLBACK');
  }

  /**
   * Clear all data from database (for testing/debugging)
   */
  async clearAll(): Promise<void> {
    await this.execute('DELETE FROM contexts');
    await this.execute('DELETE FROM tasks');
    await this.execute('DELETE FROM entities');
    await this.execute('DELETE FROM actions');
  }
}

/**
 * Singleton database instance
 */
let databaseInstance: DatabaseService | null = null;

/**
 * Get or create database instance
 */
export function getDatabase(config: DatabaseConfig): DatabaseService {
  if (!databaseInstance) {
    databaseInstance = new DatabaseService(config);
  }
  return databaseInstance;
}

/**
 * Close and reset database instance
 */
export function closeDatabase(): void {
  databaseInstance = null;
}
