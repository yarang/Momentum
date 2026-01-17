/**
 * Context Store
 *
 * Zustand store for managing context state in the Momentum application.
 * Handles captured contexts from screenshots, chat, location, and voice inputs.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Context, ContextData, ContextFilterOptions } from '@/shared/models';

/**
 * Context store state interface
 */
interface ContextState {
  /** All contexts in the store */
  contexts: Context[];
  /** Currently selected context */
  selectedContext: Context | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;

  // Actions
  /** Load all contexts */
  loadContexts: () => Promise<void>;
  /** Load a single context by ID */
  loadContext: (id: string) => Promise<void>;
  /** Add a new context */
  addContext: (data: ContextData) => Promise<Context>;
  /** Update an existing context */
  updateContext: (id: string, data: Partial<ContextData>) => Promise<Context>;
  /** Delete a context */
  deleteContext: (id: string) => Promise<void>;
  /** Set the selected context */
  setSelectedContext: (context: Context | null) => void;
  /** Filter contexts based on options */
  filterContexts: (options: ContextFilterOptions) => Context[];
  /** Update context status */
  updateContextStatus: (
    id: string,
    status: Context['status']
  ) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Create the context store with Zustand
 */
export const useContextStore = create<ContextState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        contexts: [],
        selectedContext: null,
        isLoading: false,
        error: null,

        // Actions
        loadContexts: async () => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual data loading from storage/database
            // For now, this is just a placeholder
            const contexts: Context[] = [];
            set({ contexts, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load contexts',
              isLoading: false,
            });
          }
        },

        loadContext: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual context loading from storage/database
            const context = get().contexts.find((c) => c.id === id) || null;
            set({ selectedContext: context, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load context',
              isLoading: false,
            });
          }
        },

        addContext: async (data: ContextData) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual context creation with storage/database
            const newContext: Context = {
              id: `ctx_${Date.now()}`,
              data,
              entities: [],
              status: 'pending',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            set((state) => ({
              contexts: [newContext, ...state.contexts],
              isLoading: false,
            }));
            return newContext;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to add context',
              isLoading: false,
            });
            throw error;
          }
        },

        updateContext: async (id: string, data: Partial<ContextData>) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual context update with storage/database
            set((state) => ({
              contexts: state.contexts.map((context) =>
                context.id === id
                  ? {
                      ...context,
                      data: { ...context.data, ...data },
                      updatedAt: Date.now(),
                    }
                  : context
              ),
              isLoading: false,
            }));
            const updatedContext = get().contexts.find((c) => c.id === id);
            if (!updatedContext) {
              throw new Error('Context not found');
            }
            return updatedContext;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update context',
              isLoading: false,
            });
            throw error;
          }
        },

        deleteContext: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual context deletion from storage/database
            set((state) => ({
              contexts: state.contexts.filter((context) => context.id !== id),
              selectedContext:
                state.selectedContext?.id === id ? null : state.selectedContext,
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete context',
              isLoading: false,
            });
            throw error;
          }
        },

        setSelectedContext: (context: Context | null) => {
          set({ selectedContext: context });
        },

        filterContexts: (options: ContextFilterOptions) => {
          let filtered = [...get().contexts];

          if (options.source) {
            filtered = filtered.filter((context) => context.data.source === options.source);
          }

          if (options.status) {
            filtered = filtered.filter((context) => context.status === options.status);
          }

          if (options.dateRange) {
            filtered = filtered.filter((context) => {
              return (
                context.createdAt >= options.dateRange!.start &&
                context.createdAt <= options.dateRange!.end
              );
            });
          }

          // Apply pagination
          if (options.offset) {
            filtered = filtered.slice(options.offset);
          }
          if (options.limit) {
            filtered = filtered.slice(0, options.limit);
          }

          return filtered;
        },

        updateContextStatus: async (id: string, status: Context['status']) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: Implement actual status update with storage/database
            set((state) => ({
              contexts: state.contexts.map((context) =>
                context.id === id
                  ? { ...context, status, updatedAt: Date.now() }
                  : context
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update status',
              isLoading: false,
            });
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'momentum-context-store',
        // Only persist contexts, not loading/error states
        partialize: (state) => ({
          contexts: state.contexts,
        }),
      }
    ),
    { name: 'ContextStore' }
  )
);
