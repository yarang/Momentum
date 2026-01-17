/**
 * Context Store
 *
 * Zustand store for managing context state in the Momentum application.
 * Handles captured contexts from screenshots, chat, location, and voice inputs.
 * Integrated with SQLite database for persistent storage.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Context, ContextData, ContextFilterOptions } from '@/shared/models';
import { getDatabase, getContextDAO } from '@/services/database';

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
  /** Database initialized flag */
  isDbInitialized: boolean;

  // Actions
  /** Initialize database connection */
  initializeDatabase: () => Promise<void>;
  /** Load all contexts from database */
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
    (set, get) => ({
      // Initial state
      contexts: [],
      selectedContext: null,
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

      // Load contexts from database
      loadContexts: async () => {
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
          const contextDAO = getContextDAO(db);
          const contexts = await contextDAO.getAll({
            orderBy: 'created_at',
            order: 'DESC',
          });
          set({ contexts, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load contexts',
            isLoading: false,
          });
        }
      },

      // Load a single context
      loadContext: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const contextDAO = getContextDAO(db);
          const context = await contextDAO.getById(id);

          set({
            selectedContext: context || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load context',
            isLoading: false,
          });
        }
      },

      // Add a new context
      addContext: async (data: ContextData) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const contextDAO = getContextDAO(db);

          const newContext: Context = {
            id: uuidv4(),
            data,
            entities: [], // Entities will be added by analysis service
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          await contextDAO.insert(newContext);

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

      // Update a context
      updateContext: async (id: string, data: Partial<ContextData>) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const contextDAO = getContextDAO(db);

          // Get existing context
          const existingContext = await contextDAO.getById(id);
          if (!existingContext) {
            throw new Error('Context not found');
          }

          // Merge data
          const updatedData = { ...existingContext.data, ...data };
          const updatedContext: Context = {
            ...existingContext,
            data: updatedData,
            updatedAt: Date.now(),
          };

          await contextDAO.updateData(id, updatedData, updatedContext.entities);

          set((state) => ({
            contexts: state.contexts.map((context) =>
              context.id === id ? updatedContext : context
            ),
            selectedContext:
              state.selectedContext?.id === id ? updatedContext : state.selectedContext,
            isLoading: false,
          }));

          return updatedContext;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update context',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete a context
      deleteContext: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const contextDAO = getContextDAO(db);
          await contextDAO.delete(id);

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

      // Set selected context
      setSelectedContext: (context: Context | null) => {
        set({ selectedContext: context });
      },

      // Filter contexts
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

      // Update context status
      updateContextStatus: async (id: string, status: Context['status']) => {
        set({ isLoading: true, error: null });
        try {
          const db = getDatabase({
            name: 'momentum.db',
            encryptionKey: 'momentum-secure-key-2025',
            version: 1,
          });
          const contextDAO = getContextDAO(db);
          await contextDAO.updateStatus(id, status);

          set((state) => ({
            contexts: state.contexts.map((context) =>
              context.id === id
                ? { ...context, status, updatedAt: Date.now() }
                : context
            ),
            selectedContext:
              state.selectedContext?.id === id
                ? { ...state.selectedContext, status, updatedAt: Date.now() }
                : state.selectedContext,
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

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'ContextStore' }
  )
);
