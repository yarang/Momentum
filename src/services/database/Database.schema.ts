/**
 * Database Schema Definitions
 *
 * SQLite database schema for Momentum app with encrypted storage.
 * Tables: contexts, tasks, entities, actions
 *
 * @see https://github.com/margelo/react-native-quick-sqlite
 */

/**
 * Context table schema
 * Stores captured contexts from various sources (screenshots, chats, voice, etc.)
 */
export const CONTEXT_TABLE = `
  CREATE TABLE IF NOT EXISTS contexts (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

/**
 * Task table schema
 * Stores actionable tasks derived from contexts
 */
export const TASK_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'other',
    source_context_id TEXT NOT NULL,
    deadline INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    tags TEXT,
    notes TEXT,
    parent_task_id TEXT,
    subtask_ids TEXT,
    reminder_at INTEGER,
    notified INTEGER DEFAULT 0,
    FOREIGN KEY (source_context_id) REFERENCES contexts(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
  );
`;

/**
 * Entity table schema
 * Stores extracted entities (dates, amounts, locations, people)
 */
export const ENTITY_TABLE = `
  CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    context_id TEXT NOT NULL,
    type TEXT NOT NULL,
    value TEXT,
    raw_text TEXT NOT NULL,
    confidence REAL NOT NULL,
    metadata TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
  );
`;

/**
 * Action table schema
 * Stores executed or pending actions
 */
export const ACTION_TABLE = `
  CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    context_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT,
    error TEXT,
    scheduled_at INTEGER,
    executed_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE
  );
`;

/**
 * Task-Entity junction table for many-to-many relationship
 */
export const TASK_ENTITY_TABLE = `
  CREATE TABLE IF NOT EXISTS task_entities (
    task_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    PRIMARY KEY (task_id, entity_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
  );
`;

/**
 * Task-Action junction table for many-to-many relationship
 */
export const TASK_ACTION_TABLE = `
  CREATE TABLE IF NOT EXISTS task_actions (
    task_id TEXT NOT NULL,
    action_id TEXT NOT NULL,
    PRIMARY KEY (task_id, action_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE
  );
`;

/**
 * Index definitions for performance
 */
export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_contexts_created_at ON contexts(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_contexts_status ON contexts(status);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_context_id ON tasks(source_context_id);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);',
  'CREATE INDEX IF NOT EXISTS idx_entities_context_id ON entities(context_id);',
  'CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);',
  'CREATE INDEX IF NOT EXISTS idx_actions_context_id ON actions(context_id);',
  'CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);',
  'CREATE INDEX IF NOT EXISTS idx_task_entities_task_id ON task_entities(task_id);',
  'CREATE INDEX IF NOT EXISTS idx_task_entities_entity_id ON task_entities(entity_id);',
  'CREATE INDEX IF NOT EXISTS idx_task_actions_task_id ON task_actions(task_id);',
  'CREATE INDEX IF NOT EXISTS idx_task_actions_action_id ON task_actions(action_id);',
];

/**
 * All SQL statements for database initialization
 */
export const ALL_TABLES = [
  CONTEXT_TABLE,
  TASK_TABLE,
  ENTITY_TABLE,
  ACTION_TABLE,
  TASK_ENTITY_TABLE,
  TASK_ACTION_TABLE,
  ...INDEXES,
];
