/**
 * @module services/footprint.service
 * @description Business logic for carbon footprint activity logging and retrieval.
 * Manages CRUD operations on footprint records with emissions calculation.
 */

import { getDatabase } from '../config/database';
import { FootprintRecord, LogActivityRequest, PaginationMeta } from '../types';
import { calculateEmissions } from './emissions.service';
import { logger } from '../utils/logger';

/**
 * Convert a database row to a FootprintRecord object.
 */
function toFootprintRecord(row: Record<string, unknown>): FootprintRecord {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    category: row.category as FootprintRecord['category'],
    activityType: row.activity_type as string,
    value: row.value as number,
    unit: row.unit as string,
    co2Equivalent: row.co2_equivalent as number,
    date: row.date as string,
    notes: (row.notes as string) || null,
    createdAt: row.created_at as string,
  };
}

/**
 * Log a new carbon footprint activity.
 * Calculates CO2 equivalent automatically from the activity data.
 *
 * @param userId - ID of the authenticated user
 * @param data - Activity details (category, type, value, unit, date)
 * @returns The created footprint record with calculated emissions
 */
export function logActivity(userId: number, data: LogActivityRequest): FootprintRecord {
  const db = getDatabase();
  const co2Equivalent = calculateEmissions(
    data.category,
    data.activityType,
    data.value,
    data.unit,
  );

  const stmt = db.prepare(`
    INSERT INTO footprint_records (user_id, category, activity_type, value, unit, co2_equivalent, date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    data.category,
    data.activityType,
    data.value,
    data.unit,
    co2Equivalent,
    data.date,
    data.notes || null,
  );

  const record = db
    .prepare('SELECT * FROM footprint_records WHERE id = ?')
    .get(result.lastInsertRowid);

  logger.info(`Activity logged: ${data.category}/${data.activityType} = ${co2Equivalent} kg CO2`);
  return toFootprintRecord(record as Record<string, unknown>);
}

/**
 * Get today's footprint records for a user.
 * @param userId - User ID
 * @returns Array of today's records
 */
export function getTodayFootprint(userId: number): FootprintRecord[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM footprint_records
       WHERE user_id = ? AND date = date('now')
       ORDER BY created_at DESC`,
    )
    .all(userId);

  return (rows as Record<string, unknown>[]).map(toFootprintRecord);
}

/**
 * Get this week's footprint records for a user.
 * @param userId - User ID
 * @returns Array of this week's records
 */
export function getWeekFootprint(userId: number): FootprintRecord[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-7 days')
       ORDER BY date DESC, created_at DESC`,
    )
    .all(userId);

  return (rows as Record<string, unknown>[]).map(toFootprintRecord);
}

/**
 * Get this month's footprint records for a user.
 * @param userId - User ID
 * @returns Array of this month's records
 */
export function getMonthFootprint(userId: number): FootprintRecord[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')
       ORDER BY date DESC, created_at DESC`,
    )
    .all(userId);

  return (rows as Record<string, unknown>[]).map(toFootprintRecord);
}

/**
 * Get paginated activity history for a user.
 * @param userId - User ID
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns Records array and pagination metadata
 */
export function getHistory(
  userId: number,
  page: number,
  limit: number,
): { records: FootprintRecord[]; pagination: PaginationMeta } {
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const countRow = db
    .prepare('SELECT COUNT(*) as total FROM footprint_records WHERE user_id = ?')
    .get(userId) as { total: number };

  const total = countRow.total;
  const totalPages = Math.ceil(total / limit);

  const rows = db
    .prepare(
      `SELECT * FROM footprint_records
       WHERE user_id = ?
       ORDER BY date DESC, created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(userId, limit, offset);

  return {
    records: (rows as Record<string, unknown>[]).map(toFootprintRecord),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Delete a footprint activity record.
 * Verifies ownership before deletion.
 *
 * @param userId - ID of the requesting user
 * @param activityId - ID of the record to delete
 * @throws {Error} If record not found or user doesn't own it
 */
export function deleteActivity(userId: number, activityId: number): void {
  const db = getDatabase();
  const record = db
    .prepare('SELECT * FROM footprint_records WHERE id = ?')
    .get(activityId) as Record<string, unknown> | undefined;

  if (!record) {
    const error = new Error('Activity not found');
    (error as Error & { statusCode: number; code: string }).statusCode = 404;
    (error as Error & { statusCode: number; code: string }).code = 'NOT_FOUND';
    throw error;
  }

  if (record.user_id !== userId) {
    const error = new Error('Not authorized to delete this activity');
    (error as Error & { statusCode: number; code: string }).statusCode = 403;
    (error as Error & { statusCode: number; code: string }).code = 'FORBIDDEN';
    throw error;
  }

  db.prepare('DELETE FROM footprint_records WHERE id = ?').run(activityId);
  logger.info(`Activity ${activityId} deleted by user ${userId}`);
}
