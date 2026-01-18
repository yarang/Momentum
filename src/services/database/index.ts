/**
 * Database Service Module
 *
 * Encrypted SQLite database with DAO layer for Context and Task entities.
 * Exports database service, DAOs, and utility functions.
 *
 * @usage
 * ```ts
 * import { getDatabase, getContextDAO, getTaskDAO } from '@/services/database';
 *
 * // Initialize database
 * const db = getDatabase({
 *   name: 'momentum.db',
 *   encryptionKey: 'your-secure-key',
 *   version: 1,
 * });
 * await db.initialize();
 *
 * // Use DAOs
 * const contextDAO = getContextDAO(db);
 * const taskDAO = getTaskDAO(db);
 *
 * // Insert a context
 * await contextDAO.insert({
 *   id: 'ctx-1',
 *   data: { source: 'manual', content: 'Test', timestamp: Date.now() },
 *   entities: [],
 *   status: 'pending',
 *   createdAt: Date.now(),
 *   updatedAt: Date.now(),
 * });
 * ```
 */

export { DatabaseService, getDatabase, closeDatabase, type DatabaseConfig } from './DatabaseService';
export { ContextDAO } from './ContextDAO';
export { TaskDAO } from './TaskDAO';
export { SocialEventDAO } from './SocialEventDAO';
export {
  ALL_TABLES,
  CONTEXT_TABLE,
  TASK_TABLE,
  ENTITY_TABLE,
  ACTION_TABLE,
  TASK_ENTITY_TABLE,
  TASK_ACTION_TABLE,
} from './Database.schema';
export {
  SOCIAL_EVENT_TABLE,
  SOCIAL_EVENT_INDEXES,
  SOCIAL_EVENT_SCHEMA_VERSION,
  validateSocialEventTable,
  getSocialEventTableVersion,
} from './SocialEvent.schema';

/**
 * Get SocialEvent DAO instance
 */
export function getSocialEventDAO(db: DatabaseService): SocialEventDAO {
  return new SocialEventDAO(db);
}

/**
 * Get Context DAO instance
 */
export function getContextDAO(db: DatabaseService): ContextDAO {
  return new ContextDAO(db);
}

/**
 * Get Task DAO instance
 */
export function getTaskDAO(db: DatabaseService): TaskDAO {
  return new TaskDAO(db);
}
