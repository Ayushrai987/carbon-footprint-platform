/**
 * @module services/user.service
 * @description Data access layer for user operations.
 * Handles user creation, retrieval, and updates with type-safe interfaces.
 */

import { getDatabase } from '../config/database';
import { User, UserPublic, RegisterRequest } from '../types';

/**
 * Convert a database row to a UserPublic object (excludes password hash).
 * @param row - Raw database row
 * @returns UserPublic object
 */
function toUserPublic(row: Record<string, unknown>): UserPublic {
  return {
    id: row.id as number,
    email: row.email as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Convert a database row to a full User object.
 * @param row - Raw database row
 * @returns User object including passwordHash
 */
function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Create a new user in the database.
 * @param data - Registration data including hashed password
 * @param passwordHash - Bcrypt-hashed password
 * @returns Newly created user (public fields only)
 * @throws {Error} If email already exists (UNIQUE constraint)
 */
export function createUser(data: RegisterRequest, passwordHash: string): UserPublic {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
  );
  const result = stmt.run(data.email.toLowerCase().trim(), passwordHash, data.name.trim());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  return toUserPublic(user as Record<string, unknown>);
}

/**
 * Find a user by email address.
 * @param email - Email to search for
 * @returns Full user record or null if not found
 */
export function findByEmail(email: string): User | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  return row ? toUser(row as Record<string, unknown>) : null;
}

/**
 * Find a user by ID (returns public fields only).
 * @param id - User ID
 * @returns Public user data or null if not found
 */
export function findById(id: number): UserPublic | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? toUserPublic(row as Record<string, unknown>) : null;
}

/**
 * Update user profile fields.
 * @param id - User ID to update
 * @param data - Partial user data to update
 * @returns Updated user (public fields) or null if not found
 */
export function updateUser(id: number, data: Partial<{ name: string; email: string }>): UserPublic | null {
  const db = getDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name) {
    fields.push('name = ?');
    values.push(data.name.trim());
  }
  if (data.email) {
    fields.push('email = ?');
    values.push(data.email.toLowerCase().trim());
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findById(id);
}
