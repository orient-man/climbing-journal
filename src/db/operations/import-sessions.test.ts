import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations } from "@/db/migrations/runner";
import {
  parseClimbToken,
  parseSessionLine,
  parseImportText,
  parseAndImport,
} from "./import-sessions";
import { getSession, listSessions } from "./sessions";
import { listLocations } from "./locations";

const IMPORT_DATA = `BW - Big Wall - przewieszona (Top rope)
W - Wall - zwykła (Top rope)
BLS - Boulder Sport
BLS+ - Boulder Sport duży
BL - Boulder Amatorski

Camp4 - 2025-09-05 - 5cBW/6aW
Camp4 - 2025-09-20 - 5cBW/6aBL
Camp4 - 2025-10-03 - 6aBW/5cBL
Camp4 - 2025-10-08 - 6aBW/5c+W/5cBL
Camp4 - 2025-10-10 - 6aBW/5c+W/5cBL
Camp4 - 2025-10-24 - 6aBW/5cW/6aBL
Camp4 - 2025-10-31 - 6aBW/5cW/6a+BL
Camp4 - 2025-11-07 - 6aBW/5c+W/6a+BL
Camp4 - 2025-11-21 - 5cBW/6a+W/6aBL
Camp4 - 2025-12-05 - 5cBW/5cW/6aBL
Camp4 - 2025-12-12 - 6aBW/6aW/6aBL
Camp4 - 2025-12-19 - 5cBW/6a+W/6aBL/6aBLS
Camp4 - 2025-12-23 - 6a+BW/6aW/6aBLS/6aBL
Camp4 - 2026-01-09 - 6a+BW/6aW/6aBLS/6a+BL
Camp4 - 2026-02-04 - 5c+BW/6a+W/6aBLS/6a+BL
Camp4 - 2026-02-08 - 6aBW/6a+W/6a+BL
Camp4 - 2026-02-11 - 6a+BW/6a+W/6a+BL
Camp4 - 2026-02-08 - 6a+BW/6a+BL
Camp4 - 2026-02-18 - 6a+BW/6a+W/6aBLS/5cBL
Camp4 - 2026-02-22 - 6a+BW/6a+W/6a+BLS/6a+BLS+
Camp4 - 2026-02-25 - 5cBW/6aW/6aBLS/6a+BLS+
Camp4 - 2026-03-14 - 6aBW/5c+W/6aBLS+/6aBLS/6a+BL
Camp4 - 2026-03-15 - 6aBW/6a+BLS+`;

describe("parseClimbToken", () => {
  it("parses BW suffix", () => {
    const result = parseClimbToken("6aBW");
    expect(result).toEqual({
      grade: "6a",
      suffix: "BW",
      style: "toprope",
      gradeSystem: "french",
      routeName: "BW",
    });
  });

  it("parses W suffix", () => {
    const result = parseClimbToken("5c+W");
    expect(result).toEqual({
      grade: "5c+",
      suffix: "W",
      style: "toprope",
      gradeSystem: "french",
      routeName: "W",
    });
  });

  it("parses BL suffix", () => {
    const result = parseClimbToken("6aBL");
    expect(result).toEqual({
      grade: "6a",
      suffix: "BL",
      style: "boulder",
      gradeSystem: "french",
      routeName: "BL",
    });
  });

  it("parses BLS suffix", () => {
    const result = parseClimbToken("6aBLS");
    expect(result).toEqual({
      grade: "6a",
      suffix: "BLS",
      style: "boulder",
      gradeSystem: "french",
      routeName: "BLS",
    });
  });

  it("parses BLS+ suffix (before BLS)", () => {
    const result = parseClimbToken("6a+BLS+");
    expect(result).toEqual({
      grade: "6a+",
      suffix: "BLS+",
      style: "boulder",
      gradeSystem: "french",
      routeName: "BLS+",
    });
  });

  it("returns null for empty grade", () => {
    expect(parseClimbToken("BW")).toBeNull();
  });

  it("returns null for unknown suffix", () => {
    expect(parseClimbToken("6aXYZ")).toBeNull();
  });
});

describe("parseSessionLine", () => {
  it("parses a session with multiple climbs", () => {
    const result = parseSessionLine("Camp4 - 2025-10-08 - 6aBW/5c+W/5cBL");
    expect(result).toEqual({
      location: "Camp4",
      date: "2025-10-08",
      climbs: [
        { grade: "6a", suffix: "BW", style: "toprope", gradeSystem: "french", routeName: "BW" },
        { grade: "5c+", suffix: "W", style: "toprope", gradeSystem: "french", routeName: "W" },
        { grade: "5c", suffix: "BL", style: "boulder", gradeSystem: "french", routeName: "BL" },
      ],
    });
  });

  it("skips legend lines (not 3-part dash-separated)", () => {
    expect(parseSessionLine("BW - Big Wall - przewieszona (Top rope)")).toBeNull();
  });

  it("skips blank lines", () => {
    expect(parseSessionLine("")).toBeNull();
    expect(parseSessionLine("  ")).toBeNull();
  });

  it("handles session with BLS+ suffix", () => {
    const result = parseSessionLine("Camp4 - 2026-02-22 - 6a+BW/6a+W/6a+BLS/6a+BLS+");
    expect(result).not.toBeNull();
    expect(result!.climbs).toHaveLength(4);
    expect(result!.climbs[2].routeName).toBe("BLS");
    expect(result!.climbs[3].routeName).toBe("BLS+");
  });
});

describe("parseImportText", () => {
  it("parses the full import data correctly", () => {
    const sessions = parseImportText(IMPORT_DATA);
    expect(sessions).toHaveLength(23);
  });

  it("first session is 2025-09-05 with 2 climbs", () => {
    const sessions = parseImportText(IMPORT_DATA);
    expect(sessions[0].date).toBe("2025-09-05");
    expect(sessions[0].location).toBe("Camp4");
    expect(sessions[0].climbs).toHaveLength(2);
  });

  it("last session is 2026-03-15 with 2 climbs", () => {
    const sessions = parseImportText(IMPORT_DATA);
    const last = sessions[sessions.length - 1];
    expect(last.date).toBe("2026-03-15");
    expect(last.climbs).toHaveLength(2);
  });

  it("session with 5 climbs is parsed correctly", () => {
    const sessions = parseImportText(IMPORT_DATA);
    // Camp4 - 2026-03-14 - 6aBW/5c+W/6aBLS+/6aBLS/6a+BL
    const session = sessions.find((s) => s.date === "2026-03-14");
    expect(session).not.toBeNull();
    expect(session!.climbs).toHaveLength(5);
    expect(session!.climbs.map((c) => c.routeName)).toEqual([
      "BW", "W", "BLS+", "BLS", "BL",
    ]);
  });
});

describe("importSessions (DB integration)", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    runMigrations(db);
    db.run("PRAGMA foreign_keys = ON");
  });

  afterEach(() => {
    db.close();
  });

  it("imports all 23 sessions", () => {
    const result = parseAndImport(db, IMPORT_DATA);
    expect(result.sessionsCreated).toBe(23);

    const sessions = listSessions(db);
    expect(sessions).toHaveLength(23);
  });

  it("creates Camp4 location once", () => {
    const result = parseAndImport(db, IMPORT_DATA);
    expect(result.locationsCreated).toEqual(["Camp4"]);

    const locations = listLocations(db);
    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe("Camp4");
    expect(locations[0].type).toBe("gym");
  });

  it("all sessions are type mixed", () => {
    parseAndImport(db, IMPORT_DATA);
    const sessions = listSessions(db);
    for (const s of sessions) {
      expect(s.type).toBe("mixed");
    }
  });

  it("all sessions reference Camp4 location", () => {
    parseAndImport(db, IMPORT_DATA);
    const locations = listLocations(db);
    const camp4Id = locations[0].id;
    const sessions = listSessions(db);
    for (const s of sessions) {
      expect(s.location_id).toBe(camp4Id);
    }
  });

  it("creates correct total number of climbs", () => {
    const result = parseAndImport(db, IMPORT_DATA);
    // Count from raw data:
    // 2+2+2+3+3+3+3+3+3+3+3+4+4+4+4+3+3+2+4+4+4+5+2 = 73
    expect(result.climbsCreated).toBe(73);
  });

  it("first session has correct climbs", () => {
    parseAndImport(db, IMPORT_DATA);
    const sessions = listSessions(db);
    // Sessions ordered by date desc — find 2025-09-05
    const first = sessions.find((s) => s.date === "2025-09-05");
    expect(first).toBeDefined();

    const full = getSession(db, first!.id);
    expect(full!.climbs).toHaveLength(2);

    // 5cBW
    expect(full!.climbs[0].grade_value).toBe("5c");
    expect(full!.climbs[0].grade_system).toBe("french");
    expect(full!.climbs[0].style).toBe("toprope");
    expect(full!.climbs[0].route_name).toBe("BW");
    expect(full!.climbs[0].completion_type).toBe("redpoint");

    // 6aW
    expect(full!.climbs[1].grade_value).toBe("6a");
    expect(full!.climbs[1].grade_system).toBe("french");
    expect(full!.climbs[1].style).toBe("toprope");
    expect(full!.climbs[1].route_name).toBe("W");
  });

  it("session 2026-02-22 has BLS and BLS+ climbs", () => {
    parseAndImport(db, IMPORT_DATA);
    const sessions = listSessions(db);
    const session = sessions.find((s) => s.date === "2026-02-22");
    expect(session).toBeDefined();

    const full = getSession(db, session!.id);
    expect(full!.climbs).toHaveLength(4);
    expect(full!.climbs[2].route_name).toBe("BLS");
    expect(full!.climbs[2].grade_value).toBe("6a+");
    expect(full!.climbs[3].route_name).toBe("BLS+");
    expect(full!.climbs[3].grade_value).toBe("6a+");
  });

  it("does not duplicate locations on second import", () => {
    parseAndImport(db, IMPORT_DATA);
    const secondResult = parseAndImport(db, IMPORT_DATA);
    expect(secondResult.locationsCreated).toEqual([]);

    const locations = listLocations(db);
    expect(locations).toHaveLength(1);
  });
});
