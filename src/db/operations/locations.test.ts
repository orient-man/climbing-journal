import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Database } from "sql.js";
import { createTestDb } from "@/test/db-helper";
import { runMigrations } from "@/db/migrations/runner";
import {
  createLocation,
  getLocation,
  listLocations,
  updateLocation,
  deleteLocation,
  isLocationInUse,
} from "./locations";

describe("location database operations", () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    runMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  it("creates a location", () => {
    const id = createLocation(db, { name: "CityBoulder", type: "gym" });
    expect(id).toBeGreaterThan(0);
    const loc = getLocation(db, id);
    expect(loc).not.toBeNull();
    expect(loc!.name).toBe("CityBoulder");
    expect(loc!.type).toBe("gym");
  });

  it("creates a location with region", () => {
    const id = createLocation(db, {
      name: "Jura Krakowska",
      type: "crag",
      region: "Malopolska",
    });
    const loc = getLocation(db, id);
    expect(loc!.region).toBe("Malopolska");
  });

  it("lists all locations sorted alphabetically", () => {
    createLocation(db, { name: "Zebra Wall", type: "crag" });
    createLocation(db, { name: "Alpha Gym", type: "gym" });
    createLocation(db, { name: "Middle Crag", type: "crag" });
    const locs = listLocations(db);
    expect(locs).toHaveLength(3);
    expect(locs[0].name).toBe("Alpha Gym");
    expect(locs[1].name).toBe("Middle Crag");
    expect(locs[2].name).toBe("Zebra Wall");
  });

  it("updates a location", () => {
    const id = createLocation(db, { name: "Old Name", type: "gym" });
    updateLocation(db, id, { name: "New Name", type: "crag", region: "Region1" });
    const loc = getLocation(db, id);
    expect(loc!.name).toBe("New Name");
    expect(loc!.type).toBe("crag");
    expect(loc!.region).toBe("Region1");
  });

  it("deletes a location", () => {
    const id = createLocation(db, { name: "To Delete", type: "gym" });
    deleteLocation(db, id);
    expect(getLocation(db, id)).toBeNull();
  });

  it("reports location not in use when no sessions reference it", () => {
    const id = createLocation(db, { name: "Unused", type: "gym" });
    expect(isLocationInUse(db, id)).toBe(false);
  });

  it("reports location in use when sessions reference it", () => {
    const locId = createLocation(db, { name: "Used Gym", type: "gym" });
    db.run("INSERT INTO sessions (date, location_id, type) VALUES ('2026-01-01', ?, 'boulder')", [locId]);
    expect(isLocationInUse(db, locId)).toBe(true);
  });
});
