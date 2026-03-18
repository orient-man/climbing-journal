import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Database } from "sql.js";
import { createDatabase, loadDatabase } from "./init";
import { runMigrations } from "./migrations/runner";
import { loadFromStorage, saveToStorage } from "./persistence";
import { parseAndImport } from "./operations/import-sessions";

interface DbContextValue {
  db: Database | null;
  isLoading: boolean;
  error: string | null;
  /** Persist the database after a mutation */
  persist: () => Promise<void>;
}

const DbContext = createContext<DbContextValue>({
  db: null,
  isLoading: true,
  error: null,
  persist: async () => {},
});

export function useDb(): DbContextValue {
  return useContext(DbContext);
}

/**
 * Get the database instance. Throws if not yet initialized.
 * Use this in event handlers and operations that know the DB is ready.
 */
export function useDbRequired(): Database {
  const { db } = useDb();
  if (!db) {
    throw new Error("Database not initialized yet");
  }
  return db;
}

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const stored = await loadFromStorage();
        let database: Database;

        if (stored) {
          database = await loadDatabase(stored);
        } else {
          database = await createDatabase();
        }

        runMigrations(database);

        if (!cancelled) {
          setDb(database);
          // Persist after migrations in case new tables were created
          const data = database.export();
          await saveToStorage(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to initialize database");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const persist = async () => {
    if (db) {
      const data = db.export();
      await saveToStorage(data);
    }
  };

  // Expose one-time import helper on window for console usage.
  // Usage: window.__importSessions("Camp4 - 2025-09-05 - 5cBW/6aW\n...")
  // Remove after import is complete.
  const importSessionsFromConsole = useCallback(
    async (text: string) => {
      if (!db) {
        console.error("Database not initialized");
        return;
      }
      const result = parseAndImport(db, text);
      console.log("Import result:", result);
      const data = db.export();
      await saveToStorage(data);
      console.log("Database persisted. Reload the page to see imported sessions.");
      return result;
    },
    [db]
  );

  useEffect(() => {
    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__importSessions = importSessionsFromConsole;
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__importSessions;
    };
  }, [db, importSessionsFromConsole]);

  return (
    <DbContext.Provider value={{ db, isLoading, error, persist }}>
      {children}
    </DbContext.Provider>
  );
}
