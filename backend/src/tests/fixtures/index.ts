/**
 * @module tests/fixtures
 * @description Test helpers, mock data, and database setup utilities.
 * Provides a clean test database and authenticated request helpers.
 */

import { initializeDatabase, setDatabase, closeDatabase } from '../../config/database';
import { createApp } from '../../index';
import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/** Test JWT secrets */
export const TEST_JWT_SECRET = 'test-jwt-secret-for-testing-minimum-16-chars';
export const TEST_JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing-min-16';

/** Set up environment for tests */
export function setupTestEnv(): void {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.JWT_REFRESH_SECRET = TEST_JWT_REFRESH_SECRET;
  process.env.DATABASE_PATH = ':memory:';
  process.env.PORT = '3099';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
  process.env.RATE_LIMIT_MAX = '1000'; // Don't rate limit in tests
}

/** Create and return an in-memory test database */
export function createTestDatabase(): Database.Database {
  const db = initializeDatabase(':memory:');
  setDatabase(db);
  return db;
}

/** Create a test Express app with in-memory database */
export function createTestApp(): express.Application {
  setupTestEnv();
  createTestDatabase();
  return createApp();
}

/** Clean up test resources */
export function cleanupTest(): void {
  closeDatabase();
}

/** Mock user data for testing */
export const mockUser = {
  email: 'test@example.com',
  password: 'TestPassword1!',
  name: 'Test User',
};

/** Second mock user for conflict testing */
export const mockUser2 = {
  email: 'other@example.com',
  password: 'OtherPass2@',
  name: 'Other User',
};

/** Mock activity data */
export const mockActivity = {
  category: 'transportation' as const,
  activityType: 'car_petrol',
  value: 50,
  unit: 'km',
  date: new Date().toISOString().split('T')[0],
  notes: 'Daily commute',
};

/** Mock activities for different categories */
export const mockActivities = [
  { category: 'transportation' as const, activityType: 'car_petrol', value: 50, unit: 'km', date: '2026-06-10' },
  { category: 'energy' as const, activityType: 'electricity', value: 30, unit: 'kWh', date: '2026-06-10' },
  { category: 'food' as const, activityType: 'beef', value: 0.5, unit: 'kg', date: '2026-06-10' },
  { category: 'shopping' as const, activityType: 'clothing', value: 2, unit: 'items', date: '2026-06-10' },
];

/**
 * Create a test user directly in the database and return auth token.
 * Bypasses the API for faster test setup.
 */
export function createAuthenticatedUser(db: Database.Database): { userId: number; token: string } {
  const passwordHash = bcrypt.hashSync(mockUser.password, 4);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(mockUser.email, passwordHash, mockUser.name);

  const userId = result.lastInsertRowid as number;
  const token = jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '1h' });

  return { userId, token };
}

/**
 * Seed the database with sample footprint records for a user.
 */
export function seedFootprintData(db: Database.Database, userId: number): void {
  const stmt = db.prepare(`
    INSERT INTO footprint_records (user_id, category, activity_type, value, unit, co2_equivalent, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date().toISOString().split('T')[0];

  stmt.run(userId, 'transportation', 'car_petrol', 50, 'km', 10.5, today);
  stmt.run(userId, 'energy', 'electricity', 30, 'kWh', 12, today);
  stmt.run(userId, 'food', 'beef', 0.5, 'kg', 13.5, today);
  stmt.run(userId, 'shopping', 'clothing', 2, 'items', 30, today);
}
