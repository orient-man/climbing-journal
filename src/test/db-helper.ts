import initSqlJs, { type Database } from "sql.js";

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

/**
 * Create an in-memory SQLite database for testing.
 * Caches the sql.js WASM initialization across calls.
 */
export async function createTestDb(): Promise<Database> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return new SQL.Database();
}
