import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations } from "@/db/migrations/runner";
import { getProfile, createProfile, updateProfile, type Profile } from "./profile";

describe("profile database operations", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    runMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  it("returns null when no profile exists", () => {
    expect(getProfile(db)).toBeNull();
  });

  it("creates a profile with minimal data", () => {
    createProfile(db, { locale: "pl" });
    const profile = getProfile(db);
    expect(profile).not.toBeNull();
    expect(profile!.locale).toBe("pl");
  });

  it("creates a profile with all fields", () => {
    const data: Omit<Profile, "id"> = {
      display_name: "Jan",
      birth_year: 1978,
      climbing_since: 2020,
      current_lead_grade_system: "french",
      current_lead_grade_value: "6a+",
      current_boulder_grade_system: "font",
      current_boulder_grade_value: "6a",
      goal_grade_system: "french",
      goal_grade_value: "7a",
      other_activities: "running,yoga",
      known_injuries: "left shoulder",
      locale: "pl",
    };
    createProfile(db, data);
    const profile = getProfile(db);
    expect(profile).not.toBeNull();
    expect(profile!.display_name).toBe("Jan");
    expect(profile!.birth_year).toBe(1978);
    expect(profile!.climbing_since).toBe(2020);
    expect(profile!.current_lead_grade_system).toBe("french");
    expect(profile!.current_lead_grade_value).toBe("6a+");
    expect(profile!.goal_grade_system).toBe("french");
    expect(profile!.goal_grade_value).toBe("7a");
    expect(profile!.other_activities).toBe("running,yoga");
    expect(profile!.known_injuries).toBe("left shoulder");
    expect(profile!.locale).toBe("pl");
  });

  it("enforces single-row constraint", () => {
    createProfile(db, { locale: "pl" });
    expect(() => createProfile(db, { locale: "en" })).toThrow();
  });

  it("updates an existing profile", () => {
    createProfile(db, { locale: "pl" });
    updateProfile(db, { display_name: "Jan", locale: "en" });
    const profile = getProfile(db);
    expect(profile!.display_name).toBe("Jan");
    expect(profile!.locale).toBe("en");
  });

  it("updates only specified fields, keeping others", () => {
    createProfile(db, { locale: "pl", display_name: "Jan", birth_year: 1978 });
    updateProfile(db, { locale: "en" });
    const profile = getProfile(db);
    expect(profile!.locale).toBe("en");
    expect(profile!.display_name).toBe("Jan");
    expect(profile!.birth_year).toBe(1978);
  });
});
