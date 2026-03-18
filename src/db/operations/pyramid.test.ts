import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations } from "@/db/migrations/runner";
import { createSession } from "./sessions";
import { getGradePyramidData } from "./pyramid";

describe("grade pyramid aggregation query", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    runMigrations(db);
    db.run("PRAGMA foreign_keys = ON");

    // Setup fixture data
    createSession(db, { date: "2026-01-15", type: "lead" }, [
      { style: "lead", completion_type: "onsight", grade_system: "french", grade_value: "6a", sort_order: 0 },
      { style: "lead", completion_type: "redpoint", grade_system: "french", grade_value: "6a+", sort_order: 1 },
      { style: "lead", completion_type: "flash", grade_system: "french", grade_value: "6a", sort_order: 2 },
    ]);
    createSession(db, { date: "2026-03-10", type: "boulder" }, [
      { style: "boulder", completion_type: "flash", grade_system: "font", grade_value: "6a", sort_order: 0 },
      { style: "boulder", completion_type: "attempt", grade_system: "font", grade_value: "6b", sort_order: 1 },
    ]);
    createSession(db, { date: "2025-06-01", type: "lead" }, [
      { style: "lead", completion_type: "redpoint", grade_system: "french", grade_value: "5c", sort_order: 0 },
    ]);
  });

  afterEach(() => {
    db.close();
  });

  it("returns all climbs by default (no filters)", () => {
    const data = getGradePyramidData(db, {});
    // Should have entries for all grades that were climbed
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(6);
  });

  it("filters by time range", () => {
    const data = getGradePyramidData(db, { dateFrom: "2026-01-01" });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(5); // excludes the 2025 session
  });

  it("filters by style (lead only)", () => {
    const data = getGradePyramidData(db, { style: "lead" });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(4); // 3 from jan + 1 from june
  });

  it("filters by style (boulder only)", () => {
    const data = getGradePyramidData(db, { style: "boulder" });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(2);
  });

  it("filters by completion type", () => {
    const data = getGradePyramidData(db, {
      completionTypes: ["onsight", "flash"],
    });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(3); // 1 onsight + 1 flash (lead) + 1 flash (boulder)
  });

  it("combines filters: time range + style", () => {
    const data = getGradePyramidData(db, {
      dateFrom: "2026-01-01",
      style: "lead",
    });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(3); // only jan lead session
  });

  it("combines filters: time range + style + completion type", () => {
    const data = getGradePyramidData(db, {
      dateFrom: "2026-01-01",
      style: "lead",
      completionTypes: ["onsight"],
    });
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(1);
  });

  it("groups by grade and returns counts", () => {
    const data = getGradePyramidData(db, { style: "lead" });
    const sixA = data.find((d) => d.grade_value === "6a");
    expect(sixA).toBeDefined();
    expect(sixA!.count).toBe(2); // 2 climbs at 6a
  });

  it("returns grade system info", () => {
    const data = getGradePyramidData(db, { style: "lead" });
    expect(data[0].grade_system).toBe("french");
  });
});
