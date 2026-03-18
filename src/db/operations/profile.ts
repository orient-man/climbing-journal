import type { Database } from "sql.js";

export interface Profile {
  id: number;
  display_name: string | null;
  birth_year: number | null;
  climbing_since: number | null;
  current_lead_grade_system: string | null;
  current_lead_grade_value: string | null;
  current_boulder_grade_system: string | null;
  current_boulder_grade_value: string | null;
  goal_grade_system: string | null;
  goal_grade_value: string | null;
  other_activities: string | null;
  known_injuries: string | null;
  locale: string;
}

/**
 * Get the single profile row, or null if none exists.
 */
export function getProfile(db: Database): Profile | null {
  const result = db.exec("SELECT * FROM profile WHERE id = 1");
  if (result.length === 0 || result[0].values.length === 0) return null;

  const row = result[0].values[0];
  const cols = result[0].columns;

  const profile: Record<string, unknown> = {};
  cols.forEach((col, i) => {
    profile[col] = row[i];
  });
  return profile as unknown as Profile;
}

/**
 * Create the profile row. Only call once (id=1 constraint).
 */
export function createProfile(
  db: Database,
  data: Partial<Omit<Profile, "id">> & { locale: string }
): void {
  db.run(
    `INSERT INTO profile (id, display_name, birth_year, climbing_since,
      current_lead_grade_system, current_lead_grade_value,
      current_boulder_grade_system, current_boulder_grade_value,
      goal_grade_system, goal_grade_value,
      other_activities, known_injuries, locale)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.display_name ?? null,
      data.birth_year ?? null,
      data.climbing_since ?? null,
      data.current_lead_grade_system ?? null,
      data.current_lead_grade_value ?? null,
      data.current_boulder_grade_system ?? null,
      data.current_boulder_grade_value ?? null,
      data.goal_grade_system ?? null,
      data.goal_grade_value ?? null,
      data.other_activities ?? null,
      data.known_injuries ?? null,
      data.locale,
    ]
  );
}

/**
 * Update the profile row. Only updates provided fields.
 */
export function updateProfile(
  db: Database,
  data: Partial<Omit<Profile, "id">>
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;
    fields.push(`${key} = ?`);
    values.push(value ?? null);
  }

  if (fields.length === 0) return;

  db.run(`UPDATE profile SET ${fields.join(", ")} WHERE id = 1`, values as (string | number | null)[]);
}
