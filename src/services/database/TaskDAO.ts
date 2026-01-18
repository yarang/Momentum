/**
 * Task Data Access Object
 *
 * Provides database operations for Task entities.
 * Handles CRUD operations for actionable tasks.
 */

import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/shared/models';
import { DatabaseService } from './DatabaseService';
import { Entity } from '@/shared/models/Entity.types';
import { Action } from '@/shared/models/Action.types';

/**
 * Task row from database
 */
interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  source_context_id: string;
  deadline: number | null;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
  tags: string | null;
  notes: string | null;
  parent_task_id: string | null;
  subtask_ids: string | null;
  reminder_at: number | null;
  notified: number;
}

/**
 * Task DAO for database operations
 */
export class TaskDAO {
  constructor(private db: DatabaseService) {}

  /**
   * Convert database row to Task entity
   */
  private rowToTask(
    row: TaskRow,
    entities: Entity[] = [],
    actions: Action[] = []
  ): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      category: row.category as TaskCategory,
      sourceContextId: row.source_context_id,
      entities,
      actions,
      deadline: row.deadline || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at || undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      notes: row.notes || undefined,
      parentTaskId: row.parent_task_id || undefined,
      subtaskIds: row.subtask_ids ? JSON.parse(row.subtask_ids) : undefined,
      reminderAt: row.reminder_at || undefined,
      notified: row.notified === 1,
    };
  }

  /**
   * Insert a new task
   */
  async insert(task: Task): Promise<void> {
    const data = {
      id: task.id,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      category: task.category,
      source_context_id: task.sourceContextId,
      deadline: task.deadline || null,
      completed_at: task.completedAt || null,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      tags: task.tags ? JSON.stringify(task.tags) : null,
      notes: task.notes || null,
      parent_task_id: task.parentTaskId || null,
      subtask_ids: task.subtaskIds ? JSON.stringify(task.subtaskIds) : null,
      reminder_at: task.reminderAt || null,
      notified: task.notified ? 1 : 0,
    };

    await this.db.insert('tasks', data);

    // Insert task-entity relationships
    if (task.entities && task.entities.length > 0) {
      for (const entity of task.entities) {
        await this.insertTaskEntityRelation(task.id, entity.id);
      }
    }

    // Insert task-action relationships
    if (task.actions && task.actions.length > 0) {
      for (const action of task.actions) {
        await this.insertAction(action);
        await this.insertTaskActionRelation(task.id, action.id);
      }
    }
  }

  /**
   * Insert an entity for a context
   */
  async insertEntity(contextId: string, entity: Entity): Promise<void> {
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
   * Insert task-entity relationship
   */
  private async insertTaskEntityRelation(taskId: string, entityId: string): Promise<void> {
    await this.db.execute(
      'INSERT OR IGNORE INTO task_entities (task_id, entity_id) VALUES (?, ?)',
      [taskId, entityId]
    );
  }

  /**
   * Insert an action
   */
  async insertAction(action: Action): Promise<void> {
    const data = {
      id: action.id,
      context_id: action.contextId,
      type: action.type,
      status: action.status,
      result: action.result ? JSON.stringify(action.result) : null,
      error: action.error || null,
      scheduled_at: action.scheduledAt || null,
      executed_at: action.executedAt || null,
      created_at: action.createdAt,
    };

    await this.db.insert('actions', data);
  }

  /**
   * Insert task-action relationship
   */
  private async insertTaskActionRelation(taskId: string, actionId: string): Promise<void> {
    await this.db.execute(
      'INSERT OR IGNORE INTO task_actions (task_id, action_id) VALUES (?, ?)',
      [taskId, actionId]
    );
  }

  /**
   * Get task by ID with entities and actions
   */
  async getById(id: string): Promise<Task | null> {
    const row = await this.db.getById<TaskRow>('tasks', id);
    if (!row) {return null;}

    const entities = await this.getEntitiesForTask(id);
    const actions = await this.getActionsForTask(id);
    return this.rowToTask(row, entities, actions);
  }

  /**
   * Get entities for a task
   */
  private async getEntitiesForTask(taskId: string): Promise<Entity[]> {
    const rows = await this.db.query<{ entity_id: string }>(
      'SELECT entity_id FROM task_entities WHERE task_id = ?',
      [taskId],
    );

    const entities: Entity[] = [];
    for (const row of rows) {
      const entityRow = await this.db.getById<{
        id: string;
        type: string;
        value: string | null;
        raw_text: string;
        confidence: number;
        metadata: string | null;
      }>('entities', row.entity_id);

      if (entityRow) {
        entities.push({
          id: entityRow.id,
          type: entityRow.type as Entity['type'],
          value: entityRow.value || undefined,
          rawText: entityRow.raw_text,
          confidence: entityRow.confidence,
          metadata: entityRow.metadata ? JSON.parse(entityRow.metadata) : undefined,
        });
      }
    }

    return entities;
  }

  /**
   * Get actions for a task
   */
  private async getActionsForTask(taskId: string): Promise<Action[]> {
    const rows = await this.db.query<{ action_id: string }>(
      'SELECT action_id FROM task_actions WHERE task_id = ?',
      [taskId],
    );

    const actions: Action[] = [];
    for (const row of rows) {
      const actionRow = await this.db.getById<{
        id: string;
        context_id: string;
        type: string;
        status: string;
        result: string | null;
        error: string | null;
        scheduled_at: number | null;
        executed_at: number | null;
        created_at: number;
      }>('actions', row.action_id);

      if (actionRow) {
        actions.push({
          id: actionRow.id,
          contextId: actionRow.context_id,
          type: actionRow.type as Action['type'],
          status: actionRow.status as Action['status'],
          result: actionRow.result ? JSON.parse(actionRow.result) : undefined,
          error: actionRow.error || undefined,
          scheduledAt: actionRow.scheduled_at || undefined,
          executedAt: actionRow.executed_at || undefined,
          createdAt: actionRow.created_at,
        });
      }
    }

    return actions;
  }

  /**
   * Get all tasks
   */
  async getAll(options?: {
    limit?: number;
    offset?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    orderBy?: 'created_at' | 'updated_at' | 'deadline' | 'priority';
    order?: 'ASC' | 'DESC';
  }): Promise<Task[]> {
    let sql = 'SELECT * FROM tasks';
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (options?.status) {
      conditions.push('status = ?');
      params.push(options.status);
    }

    if (options?.priority) {
      conditions.push('priority = ?');
      params.push(options.priority);
    }

    if (options?.category) {
      conditions.push('category = ?');
      params.push(options.category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
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

    const rows = await this.db.query<TaskRow>(sql, params);

    // Load entities and actions for each task
    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get tasks by context ID
   */
  async getByContextId(contextId: string): Promise<Task[]> {
    const rows = await this.db.query<TaskRow>(
      'SELECT * FROM tasks WHERE source_context_id = ? ORDER BY created_at DESC',
      [contextId],
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get tasks by status
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    return this.getAll({ status, orderBy: 'created_at', order: 'DESC' });
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.getAll({ priority, orderBy: 'created_at', order: 'DESC' });
  }

  /**
   * Get tasks by category
   */
  async getByCategory(category: TaskCategory): Promise<Task[]> {
    return this.getAll({ category, orderBy: 'created_at', order: 'DESC' });
  }

  /**
   * Get subtasks for a parent task
   */
  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    const rows = await this.db.query<TaskRow>(
      'SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at ASC',
      [parentTaskId],
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get overdue tasks (due date passed and not completed)
   */
  async getOverdueTasks(): Promise<Task[]> {
    const now = Date.now();
    const rows = await this.db.query<TaskRow>(
      `SELECT * FROM tasks
       WHERE deadline < ? AND status != 'completed' AND status != 'cancelled'
       ORDER BY deadline ASC`,
      [now],
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get upcoming tasks (due within next N days)
   */
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const now = Date.now();
    const future = now + days * 24 * 60 * 60 * 1000;
    const rows = await this.db.query<TaskRow>(
      `SELECT * FROM tasks
       WHERE deadline >= ? AND deadline <= ? AND status != 'completed' AND status != 'cancelled'
       ORDER BY deadline ASC`,
      [now, future],
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get high priority tasks
   */
  async getHighPriorityTasks(): Promise<Task[]> {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const rows = await this.db.query<TaskRow>(
      `SELECT * FROM tasks
       WHERE priority IN ('urgent', 'high') AND status != 'completed' AND status != 'cancelled'
       ORDER BY priority DESC, deadline ASC`,
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const updates: Record<string, unknown> = {
      status,
      updated_at: Date.now(),
    };

    if (status === 'completed') {
      updates.completed_at = Date.now();
    }

    await this.db.update('tasks', updates, 'id = ?', [id]);
  }

  /**
   * Update task priority
   */
  async updatePriority(id: string, priority: TaskPriority): Promise<void> {
    await this.db.update(
      'tasks',
      { priority, updated_at: Date.now() },
      'id = ?',
      [id],
    );
  }

  /**
   * Update task deadline
   */
  async updateDeadline(id: string, deadline: number): Promise<void> {
    await this.db.update(
      'tasks',
      {
        deadline,
        updated_at: Date.now(),
      },
      'id = ?',
      [id],
    );
  }

  /**
   * Update task title and description
   */
  async updateContent(id: string, title: string, description?: string): Promise<void> {
    await this.db.update(
      'tasks',
      {
        title,
        description: description || null,
        updated_at: Date.now(),
      },
      'id = ?',
      [id],
    );
  }

  /**
   * Update task tags
   */
  async updateTags(id: string, tags: string[]): Promise<void> {
    await this.db.update(
      'tasks',
      {
        tags: JSON.stringify(tags),
        updated_at: Date.now(),
      },
      'id = ?',
      [id],
    );
  }

  /**
   * Update task notes
   */
  async updateNotes(id: string, notes: string): Promise<void> {
    await this.db.update(
      'tasks',
      {
        notes,
        updated_at: Date.now(),
      },
      'id = ?',
      [id],
    );
  }

  /**
   * Mark task as notified
   */
  async markAsNotified(id: string): Promise<void> {
    await this.db.update(
      'tasks',
      { notified: 1, updated_at: Date.now() },
      'id = ?',
      [id],
    );
  }

  /**
   * Delete task by ID
   */
  async delete(id: string): Promise<void> {
    await this.db.delete('tasks', 'id = ?', [id]);
  }

  /**
   * Delete tasks by status
   */
  async deleteByStatus(status: TaskStatus): Promise<void> {
    await this.db.delete('tasks', 'status = ?', [status]);
  }

  /**
   * Delete completed tasks older than specified days
   */
  async deleteOldCompleted(days: number = 30): Promise<number> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.db.delete(
      'tasks',
      "status = 'completed' AND completed_at < ?",
      [cutoff],
    );
  }

  /**
   * Count tasks
   */
  async count(status?: TaskStatus): Promise<number> {
    if (status) {
      return this.db.count('tasks', 'status = ?', [status]);
    }
    return this.db.count('tasks');
  }

  /**
   * Search tasks by title or description
   */
  async search(query: string, limit: number = 50): Promise<Task[]> {
    const rows = await this.db.query<TaskRow>(
      `SELECT * FROM tasks
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, limit],
    );

    const tasks: Task[] = [];
    for (const row of rows) {
      const entities = await this.getEntitiesForTask(row.id);
      const actions = await this.getActionsForTask(row.id);
      tasks.push(this.rowToTask(row, entities, actions));
    }

    return tasks;
  }

  /**
   * Get task statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    byCategory: Record<TaskCategory, number>;
    overdue: number;
    upcoming: number;
  }> {
    const total = await this.count();

    const statusStats: Record<TaskStatus, number> = {
      draft: 0,
      active: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
    };

    const priorityStats: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    const categoryStats: Record<TaskCategory, number> = {
      social: 0,
      shopping: 0,
      work: 0,
      personal: 0,
      other: 0,
    };

    for (const status of Object.keys(statusStats) as TaskStatus[]) {
      statusStats[status] = await this.count(status);
    }

    for (const priority of Object.keys(priorityStats) as TaskPriority[]) {
      priorityStats[priority] = await this.db.count('tasks', 'priority = ?', [priority]);
    }

    for (const category of Object.keys(categoryStats) as TaskCategory[]) {
      categoryStats[category] = await this.db.count('tasks', 'category = ?', [category]);
    }

    const overdue = (await this.getOverdueTasks()).length;
    const upcoming = (await this.getUpcomingTasks()).length;

    return {
      total,
      byStatus: statusStats,
      byPriority: priorityStats,
      byCategory: categoryStats,
      overdue,
      upcoming,
    };
  }
}
