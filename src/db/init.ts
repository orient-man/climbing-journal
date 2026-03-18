import initSqlJs, { type Database } from "sql.js";

let sqlPromise: ReturnType<typeof initSqlJs> | null = null;

/**
 * Initialize sql.js with WASM support.
 * Uses CDN-hosted WASM binary for browser, or node-native for tests.
 */
function getSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file: string) =>
        `${import.meta.env.BASE_URL}${file}`,
    });
  }
  return sqlPromise;
}

/**
 * Create a new empty in-memory database.
 */
export async function createDatabase(): Promise<Database> {
  const SQL = await getSql();
  return new SQL.Database();
}

/**
 * Load a database from a Uint8Array (e.g., from OPFS/IndexedDB or file import).
 */
export async function loadDatabase(data: Uint8Array): Promise<Database> {
  const SQL = await getSql();
  return new SQL.Database(data);
}

/**
 * Export a database to a Uint8Array.
 */
export function exportDatabase(db: Database): Uint8Array {
  return db.export();
}
