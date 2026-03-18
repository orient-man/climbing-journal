import type { Database } from "sql.js";

export interface Location {
  id: number;
  name: string;
  type: "gym" | "crag";
  region: string | null;
}

export function createLocation(
  db: Database,
  data: { name: string; type: string; region?: string }
): number {
  db.run(
    "INSERT INTO locations (name, type, region) VALUES (?, ?, ?)",
    [data.name, data.type, data.region ?? null]
  );
  const result = db.exec("SELECT last_insert_rowid()");
  return result[0].values[0][0] as number;
}

export function getLocation(db: Database, id: number): Location | null {
  const result = db.exec("SELECT * FROM locations WHERE id = ?", [id]);
  if (result.length === 0 || result[0].values.length === 0) return null;

  const row = result[0].values[0];
  const cols = result[0].columns;
  const loc: Record<string, unknown> = {};
  cols.forEach((col, i) => { loc[col] = row[i]; });
  return loc as unknown as Location;
}

export function listLocations(db: Database): Location[] {
  const result = db.exec("SELECT * FROM locations ORDER BY name ASC");
  if (result.length === 0) return [];

  const cols = result[0].columns;
  return result[0].values.map((row) => {
    const loc: Record<string, unknown> = {};
    cols.forEach((col, i) => { loc[col] = row[i]; });
    return loc as unknown as Location;
  });
}

export function updateLocation(
  db: Database,
  id: number,
  data: { name?: string; type?: string; region?: string | null }
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.type !== undefined) { fields.push("type = ?"); values.push(data.type); }
  if (data.region !== undefined) { fields.push("region = ?"); values.push(data.region); }

  if (fields.length === 0) return;
  values.push(id);

  db.run(`UPDATE locations SET ${fields.join(", ")} WHERE id = ?`, values as (string | number | null)[]);
}

export function deleteLocation(db: Database, id: number): void {
  db.run("DELETE FROM locations WHERE id = ?", [id]);
}

export function isLocationInUse(db: Database, id: number): boolean {
  const result = db.exec(
    "SELECT COUNT(*) FROM sessions WHERE location_id = ?",
    [id]
  );
  return (result[0].values[0][0] as number) > 0;
}
