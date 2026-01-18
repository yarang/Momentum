/**
 * SocialEvent Store
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-003: Zustand 스토어 생성 및 상태 관리
 *
 * Zustand store for managing social event state in the Momentum application.
 * 경조사(Social Event) 관리를 위한 상태 저장소입니다.
 * Handles CRUD operations for social events with filtering and sorting capabilities.
 * Integrated with SQLite database for persistent storage.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  SocialEvent,
  SocialEventCreateInput,
  SocialEventUpdateInput,
  SocialEventFilter,
  SocialEventStatistics,
  SocialEventStatus,
  SocialEventType,
  SocialEventPriority,
} from '@/shared/models';

/**
 * SocialEvent store state interface
 */
interface SocialEventState {
  /** All events in the store */
  events: SocialEvent[];
  /** Currently selected event */
  selectedEvent: SocialEvent | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Database initialized flag */
  isDbInitialized: false;

  // Actions
  /** Initialize database connection */
  initializeDatabase: () => Promise<void>;
  /** Load all events */
  loadEvents: (filter?: SocialEventFilter) => Promise<void>;
  /** Load a single event by ID */
  loadEvent: (id: string) => Promise<void>;
  /** Create a new event */
  createEvent: (input: SocialEventCreateInput) => Promise<SocialEvent>;
  /** Update an existing event */
  updateEvent: (id: string, input: SocialEventUpdateInput) => Promise<SocialEvent>;
  /** Delete an event */
  deleteEvent: (id: string) => Promise<void>;
  /** Set the selected event */
  setSelectedEvent: (event: SocialEvent | null) => void;
  /** Get event statistics */
  getStatistics: () => SocialEventStatistics;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Create the social event store with Zustand
 */
export const useSocialEventStore = create<SocialEventState>()(
  devtools(
    (set, get) => ({
      // Initial state
      events: [],
      selectedEvent: null,
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
          // TODO: Initialize database connection
          // const db = getDatabase({
          //   name: 'momentum.db',
          //   encryptionKey: 'momentum-secure-key-2025',
          //   version: 1,
          // });
          // await db.initialize();

          set({ isDbInitialized: true, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize database',
            isLoading: false,
          });
          throw error;
        }
      },

      // Load events from database
      loadEvents: async (filter?: SocialEventFilter) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Load from database
          // const state = get();
          // if (!state.isDbInitialized) {
          //   await state.initializeDatabase();
          // }
          // const dao = getSocialEventDAO(db);
          // const events = await dao.findAll(filter);

          // 임시 구현: 메모리 상의 events 반환
          let filteredEvents = get().events;

          if (filter) {
            filteredEvents = filteredEvents.filter((event) => {
              if (filter.type && event.type !== filter.type) {return false;}
              if (filter.status && event.status !== filter.status) {return false;}
              if (filter.priority && event.priority !== filter.priority) {return false;}
              if (filter.startDate && event.eventDate < filter.startDate) {return false;}
              if (filter.endDate && event.eventDate > filter.endDate) {return false;}
              if (filter.giftNotSent && event.giftSent) {return false;}
              if (filter.reminderNotSet && event.reminderSet) {return false;}
              return true;
            });
          }

          set({ events: filteredEvents, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load events',
            isLoading: false,
          });
          throw error;
        }
      },

      // Load a single event by ID
      loadEvent: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Load from database
          // const dao = getSocialEventDAO(db);
          // const event = await dao.findById(id);

          const event = get().events.find((e) => e.id === id);

          if (!event) {
            throw new Error(`Event with id ${id} not found`);
          }

          set({ selectedEvent: event, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load event',
            isLoading: false,
          });
          throw error;
        }
      },

      // Create a new event
      createEvent: async (input: SocialEventCreateInput) => {
        set({ isLoading: true, error: null });

        try {
          const now = new Date();
          const newEvent: SocialEvent = {
            id: `evt_${uuidv4()}`,
            type: input.type,
            status: input.status || 'pending', // input에 status가 있으면 사용, 없으면 기본값
            priority: input.priority || 'medium', // input에 priority가 있으면 사용, 없으면 기본값
            title: input.title,
            description: input.description || null,
            eventDate: input.eventDate,
            location: input.location || null,
            contact: input.contact || null,
            giftAmount: input.giftAmount || null,
            giftSent: false, // 기본값
            giftSentDate: null,
            reminderSet: false, // 기본값
            reminderDate: null,
            calendarEventId: null,
            notes: input.notes || null,
            createdAt: now,
            updatedAt: now,
          };

          // TODO: Save to database
          // const dao = getSocialEventDAO(db);
          // await dao.insert(newEvent);

          set((state) => ({
            events: [...state.events, newEvent],
            isLoading: false,
          }));

          return newEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create event',
            isLoading: false,
          });
          throw error;
        }
      },

      // Update an existing event
      updateEvent: async (id: string, input: SocialEventUpdateInput) => {
        set({ isLoading: true, error: null });

        try {
          const state = get();
          const eventIndex = state.events.findIndex((e) => e.id === id);

          if (eventIndex === -1) {
            throw new Error(`Event with id ${id} not found`);
          }

          const existingEvent = state.events[eventIndex];
          const updatedEvent: SocialEvent = {
            ...existingEvent,
            ...input,
            updatedAt: new Date(),
          };

          // TODO: Update in database
          // const dao = getSocialEventDAO(db);
          // await dao.update(id, input);

          set((state) => ({
            events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
            selectedEvent:
              state.selectedEvent?.id === id ? updatedEvent : state.selectedEvent,
            isLoading: false,
          }));

          return updatedEvent;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update event',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete an event
      deleteEvent: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Delete from database
          // const dao = getSocialEventDAO(db);
          // await dao.delete(id);

          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete event',
            isLoading: false,
          });
          throw error;
        }
      },

      // Set the selected event
      setSelectedEvent: (event: SocialEvent | null) => {
        set({ selectedEvent: event });
      },

      // Get event statistics
      getStatistics: () => {
        const events = get().events;

        const statusCounts: Record<SocialEventStatus, number> = {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        };

        const typeCounts: Record<SocialEventType, number> = {
          wedding: 0,
          funeral: 0,
          first_birthday: 0,
          sixtieth_birthday: 0,
          birthday: 0,
          graduation: 0,
          etc: 0,
        };

        let expectedGiftExpense = 0;
        let totalGiftSent = 0;
        let pendingGiftAmount = 0;

        events.forEach((event) => {
          // 상태별 카운트
          statusCounts[event.status]++;

          // 유형별 카운트
          typeCounts[event.type]++;

          // 선물 지출 계산
          if (event.giftAmount) {
            if (event.giftSent) {
              totalGiftSent += event.giftAmount;
            } else {
              pendingGiftAmount += event.giftAmount;
              expectedGiftExpense += event.giftAmount;
            }
          }
        });

        return {
          totalEvents: events.length,
          statusCounts,
          typeCounts,
          expectedGiftExpense,
          totalGiftSent,
          pendingGiftAmount,
        };
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'SocialEventStore',
    }
  )
);
