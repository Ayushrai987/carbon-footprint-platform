/**
 * @module config/database
 * @description SQLite database initialization and schema management.
 * Uses better-sqlite3 with WAL mode for optimal performance.
 * Exports a function to create/get the database instance.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { getConfig } from './environment';

let dbInstance: Database.Database | null = null;

/**
 * Create all required database tables if they don't exist.
 * Uses IF NOT EXISTS to be idempotent.
 */
function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS footprint_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('transportation', 'energy', 'food', 'shopping')),
      activity_type TEXT NOT NULL,
      value REAL NOT NULL CHECK(value >= 0),
      unit TEXT NOT NULL,
      co2_equivalent REAL NOT NULL CHECK(co2_equivalent >= 0),
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK(category IN ('transportation', 'energy', 'food', 'shopping')),
      action TEXT NOT NULL,
      impact REAL NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      priority INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      criteria_type TEXT NOT NULL,
      criteria_value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target REAL NOT NULL,
      unit TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      participants INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      progress REAL NOT NULL DEFAULT 0,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      UNIQUE(user_id, challenge_id)
    );
  `);
}

/**
 * Create indexes for performance optimization.
 */
function createIndexes(db: Database.Database): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_footprint_user_date
      ON footprint_records(user_id, date);

    CREATE INDEX IF NOT EXISTS idx_footprint_category
      ON footprint_records(category);

    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);

    CREATE INDEX IF NOT EXISTS idx_footprint_user_category
      ON footprint_records(user_id, category);

    CREATE INDEX IF NOT EXISTS idx_user_badges_user
      ON user_badges(user_id);

    CREATE INDEX IF NOT EXISTS idx_user_challenges_user
      ON user_challenges(user_id);
  `);
}

/**
 * Initialize and return the database instance.
 * Creates the database file, tables, and indexes if they don't exist.
 * Enables WAL mode for concurrent read performance.
 *
 * @param dbPath - Optional custom path for the database file (used in testing)
 * @returns The better-sqlite3 Database instance
 */
export function initializeDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || getConfig().DATABASE_PATH;

  // Ensure directory exists for file-based databases
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(path.resolve(resolvedPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(resolvedPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  createTables(db);
  createIndexes(db);

  return db;
}

/**
 * Get the singleton database instance.
 * Initializes on first call.
 *
 * @param dbPath - Optional custom path (only used on first initialization)
 * @returns The database instance
 */
export function getDatabase(dbPath?: string): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase(dbPath);
  }
  return dbInstance;
}

/**
 * Close the database connection and clear the singleton.
 * Used for graceful shutdown and test cleanup.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Set a custom database instance (for testing).
 */
export function setDatabase(db: Database.Database): void {
  dbInstance = db;
}

// Run migrations when executed directly
if (require.main === module) {
  const db = initializeDatabase();
  console.warn('Database initialized successfully at:', getConfig().DATABASE_PATH);
  db.close();
}

export default getDatabase;
