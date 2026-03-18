import { describe, it, expect } from "vitest";
import { createTestDb } from "./db-helper";

describe("test setup", () => {
  it("creates an in-memory SQLite database", async () => {
    const db = createTestDb();
    expect(db).resolves.toBeDefined();
  });

  it("can execute SQL statements", async () => {
    const db = await createTestDb();
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
    db.run("INSERT INTO test (name) VALUES (?)", ["hello"]);
    const result = db.exec("SELECT * FROM test");
    expect(result).toHaveLength(1);
    expect(result[0].values[0]).toEqual([1, "hello"]);
    db.close();
  });
});
