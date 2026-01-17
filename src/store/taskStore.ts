/**
 * Task Store
 *
 * Zustand store for managing task state in the Momentum application.
 * Handles CRUD operations for tasks with filtering and sorting capabilities.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, TaskCreateInput, TaskUpdateInput, TaskFilterOptions, TaskStatistics } from '@/shared/models';

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

  // Actions
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
    persist(
      (set, get) => ({
        // Initial state
        tasks: [],
        selectedTask: null,
        isLoading: false,
        error: null,

        // Actions
        loadTasks: async () => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual data loading from storage/database
            // For now, this is just a placeholder
            const tasks: Task[] = [];
            set({ tasks, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load tasks',
              isLoading: false,
            });
          }
        },

        loadTask: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual task loading from storage/database
            const task = get().tasks.find((t) => t.id === id) || null;
            set({ selectedTask: task, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load task',
              isLoading: false,
            });
          }
        },

        createTask: async (input: TaskCreateInput) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual task creation with storage/database
            const newTask: Task = {
              id: `task_${Date.now()}`,
              title: input.title,
              description: input.description,
              status: 'draft',
              priority: input.priority || 'medium',
              category: input.category || 'other',
              entities: [],
              sourceContextId: input.sourceContextId,
              actions: [],
              deadline: input.deadline,
              tags: input.tags,
              parentTaskId: input.parentTaskId,
              reminderAt: input.reminderAt,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              notified: false,
            };
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

        updateTask: async (id: string, input: TaskUpdateInput) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual task update with storage/database
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === id
                  ? { ...task, ...input, updatedAt: Date.now() }
                  : task
              ),
              isLoading: false,
            }));
            const updatedTask = get().tasks.find((t) => t.id === id);
            if (!updatedTask) {
              throw new Error('Task not found');
            }
            return updatedTask;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update task',
              isLoading: false,
            });
            throw error;
          }
        },

        deleteTask: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual task deletion from storage/database
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

        setSelectedTask: (task: Task | null) => {
          set({ selectedTask: task });
        },

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

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'momentum-task-store',
        // Only persist tasks, not loading/error states
        partialize: (state) => ({
          tasks: state.tasks,
        }),
      }
    ),
    { name: 'TaskStore' }
  )
);
