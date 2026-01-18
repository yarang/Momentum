/**
 * SocialEvent Data Access Object
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-004: 기본 CRUD 작업 구현 (SocialEventDAO)
 *
 * Provides database operations for SocialEvent entities.
 * Handles CRUD operations for social events (경조사).
 */

import {
  SocialEvent,
  SocialEventUpdateInput,
  SocialEventFilter,
  SocialEventType,
  SocialEventStatus,
  SocialEventPriority,
} from '@/shared/models';
import { DatabaseService } from './DatabaseService';

/**
 * SocialEvent row from database
 */
interface SocialEventRow {
  id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  event_date: number;
  location_name: string | null;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_relationship: string | null;
  gift_amount: number | null;
  gift_sent: number; // INTEGER (0 or 1)
  gift_sent_date: number | null;
  reminder_set: number; // INTEGER (0 or 1)
  reminder_date: number | null;
  notified: number; // INTEGER (0 or 1)
  calendar_event_id: string | null;
  source_context_id: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * SocialEvent DAO for database operations
 */
export class SocialEventDAO {
  constructor(private db: DatabaseService) {}

  /**
   * Convert database row to SocialEvent entity
   */
  private rowToEvent(row: SocialEventRow): SocialEvent {
    // Location 객체 생성 (모든 필드가 null이면 null 반환)
    const location =
      row.location_name ||
      row.location_address ||
      row.location_latitude ||
      row.location_longitude
        ? {
            name: row.location_name || undefined,
            address: row.location_address || undefined,
            latitude: row.location_latitude || undefined,
            longitude: row.location_longitude || undefined,
          }
        : null;

    // Contact 객체 생성 (모든 필드가 null이면 null 반환)
    const contact =
      row.contact_name || row.contact_phone || row.contact_relationship
        ? {
            name: row.contact_name || '',
            phone: row.contact_phone || '',
            relationship: (row.contact_relationship || 'etc') as any,
          }
        : null;

    return {
      id: row.id,
      type: row.type as SocialEventType,
      status: row.status as SocialEventStatus,
      priority: row.priority as SocialEventPriority,
      title: row.title,
      description: row.description,
      eventDate: new Date(row.event_date),
      location,
      contact,
      giftAmount: row.gift_amount,
      giftSent: row.gift_sent === 1,
      giftSentDate: row.gift_sent_date ? new Date(row.gift_sent_date) : null,
      reminderSet: row.reminder_set === 1,
      reminderDate: row.reminder_date ? new Date(row.reminder_date) : null,
      notified: row.notified === 1,
      calendarEventId: row.calendar_event_id,
      sourceContextId: row.source_context_id || undefined,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Insert a new social event
   */
  async insert(event: SocialEvent): Promise<void> {
    const sql = `
      INSERT INTO social_events (
        id, type, status, priority, title, description, event_date,
        location_name, location_address, location_latitude, location_longitude,
        contact_name, contact_phone, contact_relationship,
        gift_amount, gift_sent, gift_sent_date,
        reminder_set, reminder_date, notified,
        calendar_event_id, source_context_id, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      event.id,
      event.type,
      event.status,
      event.priority,
      event.title,
      event.description || null,
      event.eventDate.getTime(),
      event.location?.name || null,
      event.location?.address || null,
      event.location?.latitude || null,
      event.location?.longitude || null,
      event.contact?.name || null,
      event.contact?.phone || null,
      event.contact?.relationship || null,
      event.giftAmount || null,
      event.giftSent ? 1 : 0,
      event.giftSentDate ? event.giftSentDate.getTime() : null,
      event.reminderSet ? 1 : 0,
      event.reminderDate ? event.reminderDate.getTime() : null,
      event.notified ? 1 : 0,
      event.calendarEventId || null,
      event.sourceContextId || null,
      event.notes || null,
      event.createdAt.getTime(),
      event.updatedAt.getTime(),
    ];

    await this.db.executeAsync(sql, params);
  }

  /**
   * Find social event by ID
   */
  async findById(id: string): Promise<SocialEvent | null> {
    const sql = 'SELECT * FROM social_events WHERE id = ?';
    const result = await this.db.executeAsync(sql, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.rowToEvent(result.rows.item(0) as any);
  }

  /**
   * Find all social events with optional filter
   */
  async findAll(filter?: SocialEventFilter): Promise<SocialEvent[]> {
    let sql = 'SELECT * FROM social_events';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filter) {
      if (filter.type) {
        conditions.push('type = ?');
        params.push(filter.type);
      }

      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }

      if (filter.priority) {
        conditions.push('priority = ?');
        params.push(filter.priority);
      }

      if (filter.startDate) {
        conditions.push('event_date >= ?');
        params.push(filter.startDate.getTime());
      }

      if (filter.endDate) {
        conditions.push('event_date <= ?');
        params.push(filter.endDate.getTime());
      }

      if (filter.giftNotSent) {
        conditions.push('gift_sent = 0');
      }

      if (filter.reminderNotSet) {
        conditions.push('reminder_set = 0');
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }

    sql += ' ORDER BY event_date ASC';

    const result = await this.db.executeAsync(sql, params);
    const events: SocialEvent[] = [];

    for (let i = 0; i < result.rows.length; i++) {
      events.push(this.rowToEvent(result.rows.item(i) as any));
    }

    return events;
  }

  /**
   * Update social event
   */
  async update(id: string, input: SocialEventUpdateInput): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.type !== undefined) {
      updates.push('type = ?');
      params.push(input.type);
    }

    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }

    if (input.priority !== undefined) {
      updates.push('priority = ?');
      params.push(input.priority);
    }

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }

    if (input.description !== undefined) {
      updates.push('description = ?');
      params.push(input.description);
    }

    if (input.eventDate !== undefined) {
      updates.push('event_date = ?');
      params.push(input.eventDate.getTime());
    }

    if (input.location !== undefined) {
      updates.push('location_name = ?');
      params.push(input.location?.name || null);

      updates.push('location_address = ?');
      params.push(input.location?.address || null);

      updates.push('location_latitude = ?');
      params.push(input.location?.latitude || null);

      updates.push('location_longitude = ?');
      params.push(input.location?.longitude || null);
    }

    if (input.contact !== undefined) {
      updates.push('contact_name = ?');
      params.push(input.contact?.name || null);

      updates.push('contact_phone = ?');
      params.push(input.contact?.phone || null);

      updates.push('contact_relationship = ?');
      params.push(input.contact?.relationship || null);
    }

    if (input.giftAmount !== undefined) {
      updates.push('gift_amount = ?');
      params.push(input.giftAmount);
    }

    if (input.giftSent !== undefined) {
      updates.push('gift_sent = ?');
      params.push(input.giftSent ? 1 : 0);
    }

    if (input.giftSentDate !== undefined) {
      updates.push('gift_sent_date = ?');
      params.push(input.giftSentDate ? input.giftSentDate.getTime() : null);
    }

    if (input.reminderSet !== undefined) {
      updates.push('reminder_set = ?');
      params.push(input.reminderSet ? 1 : 0);
    }

    if (input.reminderDate !== undefined) {
      updates.push('reminder_date = ?');
      params.push(input.reminderDate ? input.reminderDate.getTime() : null);
    }

    if (input.calendarEventId !== undefined) {
      updates.push('calendar_event_id = ?');
      params.push(input.calendarEventId);
    }

    if (input.notes !== undefined) {
      updates.push('notes = ?');
      params.push(input.notes);
    }

    // Always update updated_at
    updates.push('updated_at = ?');
    params.push(Date.now());

    params.push(id); // WHERE id = ?

    const sql = `UPDATE social_events SET ${updates.join(', ')} WHERE id = ?`;
    await this.db.executeAsync(sql, params);
  }

  /**
   * Delete social event
   */
  async delete(id: string): Promise<void> {
    const sql = 'DELETE FROM social_events WHERE id = ?';
    await this.db.executeAsync(sql, [id]);
  }

  /**
   * Count social events with optional filter
   */
  async count(filter?: SocialEventFilter): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM social_events';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filter) {
      if (filter.type) {
        conditions.push('type = ?');
        params.push(filter.type);
      }

      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }

      if (filter.priority) {
        conditions.push('priority = ?');
        params.push(filter.priority);
      }

      if (filter.startDate) {
        conditions.push('event_date >= ?');
        params.push(filter.startDate.getTime());
      }

      if (filter.endDate) {
        conditions.push('event_date <= ?');
        params.push(filter.endDate.getTime());
      }

      if (filter.giftNotSent) {
        conditions.push('gift_sent = 0');
      }

      if (filter.reminderNotSet) {
        conditions.push('reminder_set = 0');
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
    }

    const result = await this.db.executeAsync(sql, params);
    return (result.rows.item(0) as any).count;
  }
}
