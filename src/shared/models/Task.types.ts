/**
 * Task Types
 *
 * Represents actionable tasks derived from context analysis.
 * Tasks are the primary unit of work in the Momentum system.
 */

import { Entity } from './Entity.types';
import { Action } from './Action.types';

/**
 * Task status through its lifecycle
 */
export type TaskStatus =
  | 'draft'        // Initial state, being defined
  | 'active'       // Currently being worked on
  | 'pending'      // Waiting for specific time/condition
  | 'completed'    // Successfully finished
  | 'cancelled';   // Cancelled by user

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task category for organization
 */
export type TaskCategory =
  | 'social'       // Social events, gatherings, condolences
  | 'shopping'     // Purchases, wishlists, deals
  | 'work'         // Work-related tasks, meetings, deadlines
  | 'personal'     // Personal errands, health, finance
  | 'other';       // Uncategorized tasks

/**
 * Main task interface
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;

  /** Task title (brief description) */
  title: string;

  /** Detailed task description */
  description?: string;

  /** Current status of the task */
  status: TaskStatus;

  /** Priority level */
  priority: TaskPriority;

  /** Category for organization */
  category: TaskCategory;

  /** Associated entities extracted from context */
  entities: Entity[];

  /** Source context ID that generated this task */
  sourceContextId: string;

  /** Associated actions for this task */
  actions: Action[];

  /** Deadline timestamp (optional) */
  deadline?: number;

  /** Timestamp when task was created */
  createdAt: number;

  /** Timestamp when task was last updated */
  updatedAt: number;

  /** Timestamp when task was completed */
  completedAt?: number;

  /** Optional tags for filtering and search */
  tags?: string[];

  /** Optional notes added by user */
  notes?: string;

  /** Optional parent task ID for subtasks */
  parentTaskId?: string;

  /** IDs of subtasks */
  subtaskIds?: string[];

  /** Reminder timestamp (for notifications) */
  reminderAt?: number;

  /** Whether user has been notified about this task */
  notified: boolean;
}

/**
 * Task filter options for querying
 */
export interface TaskFilterOptions {
  /** Filter by status */
  status?: TaskStatus;

  /** Filter by priority */
  priority?: TaskPriority;

  /** Filter by category */
  category?: TaskCategory;

  /** Filter by deadline range */
  deadlineRange?: {
    /** Start timestamp (inclusive) */
    start: number;
    /** End timestamp (inclusive) */
    end: number;
  };

  /** Filter by tags */
  tags?: string[];

  /** Filter by parent task (include subtasks if true) */
  parentTaskId?: string;

  /** Maximum number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'priority';

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Task creation input
 */
export interface TaskCreateInput {
  /** Task title */
  title: string;

  /** Optional detailed description */
  description?: string;

  /** Priority level (defaults to 'medium') */
  priority?: TaskPriority;

  /** Category (defaults to 'other') */
  category?: TaskCategory;

  /** Source context ID */
  sourceContextId: string;

  /** Optional deadline */
  deadline?: number;

  /** Optional tags */
  tags?: string[];

  /** Optional parent task ID */
  parentTaskId?: string;

  /** Optional reminder timestamp */
  reminderAt?: number;
}

/**
 * Task update input
 */
export interface TaskUpdateInput {
  /** Updated title */
  title?: string;

  /** Updated description */
  description?: string;

  /** Updated status */
  status?: TaskStatus;

  /** Updated priority */
  priority?: TaskPriority;

  /** Updated category */
  category?: TaskCategory;

  /** Updated deadline */
  deadline?: number;

  /** Updated tags */
  tags?: string[];

  /** Updated notes */
  notes?: string;

  /** Updated reminder timestamp */
  reminderAt?: number;
}

/**
 * Task statistics summary
 */
export interface TaskStatistics {
  /** Total number of tasks */
  total: number;

  /** Count by status */
  byStatus: Record<TaskStatus, number>;

  /** Count by priority */
  byPriority: Record<TaskPriority, number>;

  /** Count by category */
  byCategory: Record<TaskCategory, number>;

  /** Overdue tasks count */
  overdue: number;

  /** Tasks due within 24 hours */
  dueSoon: number;
}
