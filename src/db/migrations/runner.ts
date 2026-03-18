import type { Database } from "sql.js";
import { migrateV1 } from "./v1";

interface Migration {
  version: number;
  migrate: (db: Database) => void;
}

/**
 * All migrations in sequential order.
 * Add new migrations to the end of this array.
 */
const migrations: Migration[] = [
  { version: 1, migrate: migrateV1 },
];

/**
 * Get the current schema version from the database.
 * Returns 0 if no schema_version table exists.
 */
export function getCurrentVersion(db: Database): number {
  try {
    const result = db.exec("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1");
    if (result.length === 0 || result[0].values.length === 0) {
      return 0;
    }
    return result[0].values[0][0] as number;
  } catch {
    // Table doesn't exist yet
    return 0;
  }
}

/**
 * Run all pending migrations on the database.
 * Checks the current schema version and runs any migrations that are newer.
 */
export function runMigrations(db: Database): void {
  db.run("PRAGMA foreign_keys = ON");

  const currentVersion = getCurrentVersion(db);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      migration.migrate(db);
    }
  }
}
