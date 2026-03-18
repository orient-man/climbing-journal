import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations, getCurrentVersion } from "./runner";

describe("migration runner", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  it("runs all migrations on a fresh database", () => {
    runMigrations(db);
    const version = getCurrentVersion(db);
    expect(version).toBe(1);
  });

  it("creates all expected tables", () => {
    runMigrations(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    const tableNames = tables[0].values.map((row) => row[0]);
    expect(tableNames).toContain("profile");
    expect(tableNames).toContain("sessions");
    expect(tableNames).toContain("climbs");
    expect(tableNames).toContain("locations");
    expect(tableNames).toContain("schema_version");
  });

  it("is idempotent — running twice does not error", () => {
    runMigrations(db);
    expect(() => runMigrations(db)).not.toThrow();
    const version = getCurrentVersion(db);
    expect(version).toBe(1);
  });

  it("skips already-applied migrations", () => {
    runMigrations(db);
    // Manually insert data to verify it survives re-run
    db.run("INSERT INTO locations (name, type) VALUES ('Test', 'gym')");
    runMigrations(db);
    const result = db.exec("SELECT COUNT(*) FROM locations");
    expect(result[0].values[0][0]).toBe(1);
  });

  it("returns version 0 for a fresh database with no schema_version table", () => {
    const version = getCurrentVersion(db);
    expect(version).toBe(0);
  });

  it("upgrades sequentially from older version", () => {
    // Simulate an older database at version 0
    // Running migrations should bring it to the latest
    runMigrations(db);
    const version = getCurrentVersion(db);
    expect(version).toBeGreaterThanOrEqual(1);
  });
});
