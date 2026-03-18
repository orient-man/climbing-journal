import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations } from "@/db/migrations/runner";
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  listSessions,
} from "./sessions";

describe("session database operations", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    runMigrations(db);
    db.run("PRAGMA foreign_keys = ON");
  });

  afterEach(() => {
    db.close();
  });

  it("creates a session with no climbs", () => {
    const id = createSession(db, { date: "2026-03-18", type: "boulder" });
    expect(id).toBeGreaterThan(0);
    const session = getSession(db, id);
    expect(session).not.toBeNull();
    expect(session!.date).toBe("2026-03-18");
    expect(session!.type).toBe("boulder");
    expect(session!.climbs).toHaveLength(0);
  });

  it("creates a session with climbs", () => {
    const id = createSession(
      db,
      { date: "2026-03-18", type: "lead" },
      [
        { style: "lead", completion_type: "onsight", grade_system: "french", grade_value: "6a", sort_order: 0 },
        { style: "lead", completion_type: "redpoint", grade_system: "french", grade_value: "6b", sort_order: 1 },
      ]
    );
    const session = getSession(db, id);
    expect(session!.climbs).toHaveLength(2);
    expect(session!.climbs[0].grade_value).toBe("6a");
    expect(session!.climbs[1].grade_value).toBe("6b");
  });

  it("climbs are ordered by sort_order", () => {
    const id = createSession(
      db,
      { date: "2026-03-18", type: "lead" },
      [
        { style: "lead", completion_type: "onsight", sort_order: 2 },
        { style: "lead", completion_type: "redpoint", sort_order: 0 },
        { style: "lead", completion_type: "flash", sort_order: 1 },
      ]
    );
    const session = getSession(db, id);
    expect(session!.climbs.map(c => c.completion_type)).toEqual(["redpoint", "flash", "onsight"]);
  });

  it("updates session fields", () => {
    const id = createSession(db, { date: "2026-03-18", type: "boulder" });
    updateSession(db, id, { notes: "Great session!" });
    const session = getSession(db, id);
    expect(session!.notes).toBe("Great session!");
  });

  it("updates session climbs (replaces all)", () => {
    const id = createSession(
      db,
      { date: "2026-03-18", type: "lead" },
      [{ style: "lead", completion_type: "onsight", sort_order: 0 }]
    );
    updateSession(db, id, {}, [
      { style: "lead", completion_type: "flash", sort_order: 0 },
      { style: "lead", completion_type: "redpoint", sort_order: 1 },
    ]);
    const session = getSession(db, id);
    expect(session!.climbs).toHaveLength(2);
    expect(session!.climbs[0].completion_type).toBe("flash");
  });

  it("deletes a session and cascades to climbs", () => {
    const id = createSession(
      db,
      { date: "2026-03-18", type: "lead" },
      [{ style: "lead", completion_type: "onsight", sort_order: 0 }]
    );
    deleteSession(db, id);
    expect(getSession(db, id)).toBeNull();
    const climbs = db.exec("SELECT COUNT(*) FROM climbs WHERE session_id = ?", [id]);
    expect(climbs[0].values[0][0]).toBe(0);
  });

  it("lists sessions ordered by date desc", () => {
    createSession(db, { date: "2026-01-01", type: "boulder" });
    createSession(db, { date: "2026-03-18", type: "lead" });
    createSession(db, { date: "2026-02-15", type: "toprope" });
    const sessions = listSessions(db);
    expect(sessions).toHaveLength(3);
    expect(sessions[0].date).toBe("2026-03-18");
    expect(sessions[1].date).toBe("2026-02-15");
    expect(sessions[2].date).toBe("2026-01-01");
  });

  it("lists sessions with climb count", () => {
    const id = createSession(
      db,
      { date: "2026-03-18", type: "lead" },
      [
        { style: "lead", completion_type: "onsight", sort_order: 0 },
        { style: "lead", completion_type: "redpoint", sort_order: 1 },
      ]
    );
    const sessions = listSessions(db);
    const s = sessions.find(s => s.id === id);
    expect(s!.climb_count).toBe(2);
  });

  it("filters sessions by type", () => {
    createSession(db, { date: "2026-01-01", type: "boulder" });
    createSession(db, { date: "2026-01-02", type: "lead" });
    const sessions = listSessions(db, { type: "boulder" });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].type).toBe("boulder");
  });

  it("filters sessions by date range", () => {
    createSession(db, { date: "2026-01-01", type: "boulder" });
    createSession(db, { date: "2026-03-18", type: "lead" });
    const sessions = listSessions(db, { dateFrom: "2026-03-01" });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].date).toBe("2026-03-18");
  });
});
