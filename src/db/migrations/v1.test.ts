import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { migrateV1 } from "./v1";

describe("schema v1 migration", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  it("creates the schema_version table", () => {
    migrateV1(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    );
    expect(tables).toHaveLength(1);
    expect(tables[0].values[0][0]).toBe("schema_version");
  });

  it("creates the profile table", () => {
    migrateV1(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='profile'"
    );
    expect(tables).toHaveLength(1);
  });

  it("creates the locations table", () => {
    migrateV1(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='locations'"
    );
    expect(tables).toHaveLength(1);
  });

  it("creates the sessions table", () => {
    migrateV1(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'"
    );
    expect(tables).toHaveLength(1);
  });

  it("creates the climbs table", () => {
    migrateV1(db);
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='climbs'"
    );
    expect(tables).toHaveLength(1);
  });

  it("sets schema_version to 1", () => {
    migrateV1(db);
    const result = db.exec("SELECT version FROM schema_version");
    expect(result[0].values[0][0]).toBe(1);
  });

  describe("profile table", () => {
    beforeEach(() => migrateV1(db));

    it("has the correct columns", () => {
      const cols = db.exec("PRAGMA table_info(profile)");
      const colNames = cols[0].values.map((row) => row[1]);
      expect(colNames).toContain("id");
      expect(colNames).toContain("display_name");
      expect(colNames).toContain("birth_year");
      expect(colNames).toContain("climbing_since");
      expect(colNames).toContain("current_lead_grade_system");
      expect(colNames).toContain("current_lead_grade_value");
      expect(colNames).toContain("current_boulder_grade_system");
      expect(colNames).toContain("current_boulder_grade_value");
      expect(colNames).toContain("goal_grade_system");
      expect(colNames).toContain("goal_grade_value");
      expect(colNames).toContain("other_activities");
      expect(colNames).toContain("known_injuries");
      expect(colNames).toContain("locale");
    });

    it("enforces single-row constraint via CHECK on id", () => {
      db.run(
        "INSERT INTO profile (id, locale) VALUES (1, 'pl')"
      );
      expect(() =>
        db.run("INSERT INTO profile (id, locale) VALUES (2, 'en')")
      ).toThrow();
    });
  });

  describe("locations table", () => {
    beforeEach(() => migrateV1(db));

    it("has the correct columns", () => {
      const cols = db.exec("PRAGMA table_info(locations)");
      const colNames = cols[0].values.map((row) => row[1]);
      expect(colNames).toContain("id");
      expect(colNames).toContain("name");
      expect(colNames).toContain("type");
      expect(colNames).toContain("region");
    });

    it("requires name to be non-null", () => {
      expect(() =>
        db.run("INSERT INTO locations (type) VALUES ('gym')")
      ).toThrow();
    });
  });

  describe("sessions table", () => {
    beforeEach(() => migrateV1(db));

    it("has the correct columns", () => {
      const cols = db.exec("PRAGMA table_info(sessions)");
      const colNames = cols[0].values.map((row) => row[1]);
      expect(colNames).toContain("id");
      expect(colNames).toContain("date");
      expect(colNames).toContain("location_id");
      expect(colNames).toContain("type");
      expect(colNames).toContain("duration_minutes");
      expect(colNames).toContain("energy");
      expect(colNames).toContain("satisfaction");
      expect(colNames).toContain("notes");
      expect(colNames).toContain("created_at");
    });

    it("has a foreign key to locations", () => {
      const fk = db.exec("PRAGMA foreign_key_list(sessions)");
      expect(fk).toHaveLength(1);
      const fkTable = fk[0].values[0][2]; // table column
      expect(fkTable).toBe("locations");
    });
  });

  describe("climbs table", () => {
    beforeEach(() => migrateV1(db));

    it("has the correct columns", () => {
      const cols = db.exec("PRAGMA table_info(climbs)");
      const colNames = cols[0].values.map((row) => row[1]);
      expect(colNames).toContain("id");
      expect(colNames).toContain("session_id");
      expect(colNames).toContain("route_name");
      expect(colNames).toContain("grade_system");
      expect(colNames).toContain("grade_value");
      expect(colNames).toContain("style");
      expect(colNames).toContain("completion_type");
      expect(colNames).toContain("attempts");
      expect(colNames).toContain("perceived_difficulty");
      expect(colNames).toContain("notes");
      expect(colNames).toContain("sort_order");
    });

    it("has a foreign key to sessions with CASCADE delete", () => {
      db.run("PRAGMA foreign_keys = ON");
      // Insert a location first
      db.run("INSERT INTO locations (name, type) VALUES ('Test Gym', 'gym')");
      // Insert a session
      db.run(
        "INSERT INTO sessions (date, type) VALUES ('2026-03-18', 'boulder')"
      );
      // Insert a climb
      db.run(
        "INSERT INTO climbs (session_id, grade_system, grade_value, style, completion_type, sort_order) VALUES (1, 'french', '6a', 'lead', 'redpoint', 0)"
      );
      // Delete the session — cascade should delete the climb
      db.run("DELETE FROM sessions WHERE id = 1");
      const climbs = db.exec("SELECT * FROM climbs");
      expect(climbs).toHaveLength(0);
    });
  });
});
