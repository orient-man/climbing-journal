import type { Database } from "sql.js";

/**
 * Schema v1 migration — creates the initial database tables.
 */
export function migrateV1(db: Database): void {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT,
      birth_year INTEGER,
      climbing_since INTEGER,
      current_lead_grade_system TEXT,
      current_lead_grade_value TEXT,
      current_boulder_grade_system TEXT,
      current_boulder_grade_value TEXT,
      goal_grade_system TEXT,
      goal_grade_value TEXT,
      other_activities TEXT,
      known_injuries TEXT,
      locale TEXT NOT NULL DEFAULT 'pl'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'gym',
      region TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      location_id INTEGER REFERENCES locations(id),
      type TEXT NOT NULL,
      duration_minutes INTEGER,
      energy INTEGER,
      satisfaction INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS climbs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      route_name TEXT,
      grade_system TEXT,
      grade_value TEXT,
      style TEXT NOT NULL,
      completion_type TEXT NOT NULL,
      attempts INTEGER DEFAULT 1,
      perceived_difficulty INTEGER,
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run("INSERT INTO schema_version (version) VALUES (1)");
}
