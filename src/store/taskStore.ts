/**
 * Task Store
 *
 * Zustand store for managing task state in the Momentum application.
 * Handles CRUD operations for tasks with filtering and sorting capabilities.
 * Integrated with SQLite database for persistent storage.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskFilterOptions,
  TaskStatistics,
} from '@/shared/models';
import { getDatabase, getTaskDAO } from '@/services/database';

/**
 * Task store state interface
 */
interface TaskState {
  /** All tasks in the store */
  tasks: Task[];
  /** Currently selected task */
  selectedTask: Task | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Database initialized flag */
  isDbInitialized: boolean;

  // Actions
  /** Initialize database connection */
  initializeDatabase: () => Promise<void>;
  /** Load all tasks */
  loadTasks: () => Promise<void>;
  /** Load a single task by ID */
  loadTask: (id: string) => Promise<void>;
  /** Create a new task */
  createTask: (input: TaskCreateInput) => Promise<Task>;
  /** Update an existing task */
  updateTask: (id: string, input: TaskUpdateInput) => Promise<Task>;
  /** Delete a task */
  deleteTask: (id: string) => Promise<void>;
  /** Set the selected task */
  setSelectedTask: (task: Task | null) => void;
  /** Filter tasks based on options */
  filterTasks: (options: TaskFilterOptions) => Task[];
  /** Get task statistics */
  getStatistics: () => TaskStatistics;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Create the task store with Zustand
 */
export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      selectedTask: null,
      isLoading: false,
      error: null,
      isDbInitialized: false,

      // Initialize database
      initializeDatabase: async () => {
        if (get().isDbInitialized) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025', // TODO: Use secure key storage
            version: 1,
          });
          await db.initialize();
          set({ isDbInitialized: true, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize database',
            isLoading: false,
          });
          throw error;
        }
      },

      // Load tasks from database
      loadTasks: async () => {
        const state = get();

        // Auto-initialize database if not initialized
        if (!state.isDbInitialized) {
          await state.initializeDatabase();
        }

        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const taskDAO = getTaskDAO(db);
          const tasks = await taskDAO.getAll({
            orderBy: 'created_at',
            order: 'DESC',
          });
          set({ tasks, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load tasks',
            isLoading: false,
          });
        }
      },

      // Load a single task
      loadTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const taskDAO = getTaskDAO(db);
          const task = await taskDAO.getById(id);

          set({
            selectedTask: task || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load task',
            isLoading: false,
          });
        }
      },

      // Create a new task
      createTask: async (input: TaskCreateInput) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const taskDAO = getTaskDAO(db);

          const newTask: Task = {
            id: uuidv4(),
            title: input.title,
            description: input.description,
            status: 'draft',
            priority: input.priority || 'medium',
            category: input.category || 'other',
            sourceContextId: input.sourceContextId,
            entities: [], // Entities will be added by analysis service
            actions: [], // Actions will be suggested by executor service
            deadline: input.deadline,
            tags: input.tags,
            parentTaskId: input.parentTaskId,
            reminderAt: input.reminderAt,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            notified: false,
          };

          await taskDAO.insert(newTask);

          set((state) => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));

          return newTask;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create task',
            isLoading: false,
          });
          throw error;
        }
      },

      // Update a task
      updateTask: async (id: string, input: TaskUpdateInput) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const taskDAO = getTaskDAO(db);

          // Get existing task
          const existingTask = await taskDAO.getById(id);
          if (!existingTask) {
            throw new Error('Task not found');
          }

          // Merge updates
          const updatedTask: Task = {
            ...existingTask,
            ...input,
            updatedAt: Date.now(),
          };

          // Update in database
          if (input.title !== undefined || input.description !== undefined) {
            await taskDAO.updateContent(
              id,
              input.title || existingTask.title,
              input.description,
            );
          }
          if (input.status !== undefined) {
            await taskDAO.updateStatus(id, input.status);
          }
          if (input.priority !== undefined) {
            await taskDAO.updatePriority(id, input.priority);
          }
          if (input.deadline !== undefined) {
            await taskDAO.updateDeadline(id, input.deadline);
          }
          if (input.tags !== undefined) {
            await taskDAO.updateTags(id, input.tags);
          }
          if (input.notes !== undefined) {
            await taskDAO.updateNotes(id, input.notes);
          }
          if (input.reminderAt !== undefined) {
            await taskDAO.updateDeadline(id, input.reminderAt);
          }

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
            selectedTask:
              state.selectedTask?.id === id ? updatedTask : state.selectedTask,
            isLoading: false,
          }));

          return updatedTask;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete a task
      deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const taskDAO = getTaskDAO(db);
          await taskDAO.delete(id);

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false,
          });
          throw error;
        }
      },

      // Set selected task
      setSelectedTask: (task: Task | null) => {
        set({ selectedTask: task });
      },

      // Filter tasks
      filterTasks: (options: TaskFilterOptions) => {
        let filtered = [...get().tasks];

        if (options.status) {
          filtered = filtered.filter((task) => task.status === options.status);
        }

        if (options.priority) {
          filtered = filtered.filter((task) => task.priority === options.priority);
        }

        if (options.category) {
          filtered = filtered.filter((task) => task.category === options.category);
        }

        if (options.deadlineRange) {
          filtered = filtered.filter((task) => {
            if (!task.deadline) return false;
            return (
              task.deadline >= options.deadlineRange!.start &&
              task.deadline <= options.deadlineRange!.end
            );
          });
        }

        if (options.tags && options.tags.length > 0) {
          filtered = filtered.filter((task) =>
            options.tags!.some((tag) => task.tags?.includes(tag))
          );
        }

        if (options.parentTaskId !== undefined) {
          filtered = filtered.filter((task) => task.parentTaskId === options.parentTaskId);
        }

        // Sort
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';
        filtered.sort((a, b) => {
          let aVal: number | string;
          let bVal: number | string;

          switch (sortBy) {
            case 'deadline':
              aVal = a.deadline || 0;
              bVal = b.deadline || 0;
              break;
            case 'priority':
              const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
              aVal = priorityOrder[a.priority];
              bVal = priorityOrder[b.priority];
              break;
            case 'updatedAt':
              aVal = a.updatedAt;
              bVal = b.updatedAt;
              break;
            default:
              aVal = a.createdAt;
              bVal = b.createdAt;
          }

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });

        // Apply pagination
        if (options.offset) {
          filtered = filtered.slice(options.offset);
        }
        if (options.limit) {
          filtered = filtered.slice(0, options.limit);
        }

        return filtered;
      },

      // Get statistics
      getStatistics: () => {
        const tasks = get().tasks;
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        const stats: TaskStatistics = {
          total: tasks.length,
          byStatus: {
            draft: 0,
            active: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
          },
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0,
          },
          byCategory: {
            social: 0,
            shopping: 0,
            work: 0,
            personal: 0,
            other: 0,
          },
          overdue: 0,
          dueSoon: 0,
        };

        tasks.forEach((task) => {
          // Count by status
          stats.byStatus[task.status]++;
          // Count by priority
          stats.byPriority[task.priority]++;
          // Count by category
          stats.byCategory[task.category]++;

          // Check deadline
          if (task.deadline && task.status !== 'completed' && task.status !== 'cancelled') {
            if (task.deadline < now) {
              stats.overdue++;
            } else if (task.deadline <= now + dayMs) {
              stats.dueSoon++;
            }
          }
        });

        return stats;
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'TaskStore' }
  )
);
