import type { Database } from "sql.js";

export interface ClimbInput {
  route_name?: string;
  grade_system?: string;
  grade_value?: string;
  style: string;
  completion_type: string;
  attempts?: number;
  perceived_difficulty?: number;
  notes?: string;
  sort_order: number;
}

export interface Climb extends ClimbInput {
  id: number;
  session_id: number;
}

export interface SessionInput {
  date: string;
  location_id?: number | null;
  type: string;
  duration_minutes?: number | null;
  energy?: number | null;
  satisfaction?: number | null;
  notes?: string | null;
}

export interface Session extends SessionInput {
  id: number;
  created_at: string;
}

export interface SessionWithClimbs extends Session {
  climbs: Climb[];
}

export function createSession(
  db: Database,
  data: SessionInput,
  climbs: ClimbInput[] = []
): number {
  db.run(
    `INSERT INTO sessions (date, location_id, type, duration_minutes, energy, satisfaction, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.date,
      data.location_id ?? null,
      data.type,
      data.duration_minutes ?? null,
      data.energy ?? null,
      data.satisfaction ?? null,
      data.notes ?? null,
    ]
  );
  const result = db.exec("SELECT last_insert_rowid()");
  const sessionId = result[0].values[0][0] as number;

  for (const climb of climbs) {
    insertClimb(db, sessionId, climb);
  }

  return sessionId;
}

function insertClimb(db: Database, sessionId: number, climb: ClimbInput): void {
  db.run(
    `INSERT INTO climbs (session_id, route_name, grade_system, grade_value, style, completion_type, attempts, perceived_difficulty, notes, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      climb.route_name ?? null,
      climb.grade_system ?? null,
      climb.grade_value ?? null,
      climb.style,
      climb.completion_type,
      climb.attempts ?? 1,
      climb.perceived_difficulty ?? null,
      climb.notes ?? null,
      climb.sort_order,
    ]
  );
}

export function getSession(db: Database, id: number): SessionWithClimbs | null {
  const sessionResult = db.exec("SELECT * FROM sessions WHERE id = ?", [id]);
  if (sessionResult.length === 0 || sessionResult[0].values.length === 0) return null;

  const sCols = sessionResult[0].columns;
  const sRow = sessionResult[0].values[0];
  const session: Record<string, unknown> = {};
  sCols.forEach((col, i) => { session[col] = sRow[i]; });

  const climbsResult = db.exec(
    "SELECT * FROM climbs WHERE session_id = ? ORDER BY sort_order ASC",
    [id]
  );

  let climbs: Climb[] = [];
  if (climbsResult.length > 0) {
    const cCols = climbsResult[0].columns;
    climbs = climbsResult[0].values.map((row) => {
      const climb: Record<string, unknown> = {};
      cCols.forEach((col, i) => { climb[col] = row[i]; });
      return climb as unknown as Climb;
    });
  }

  return { ...(session as unknown as Session), climbs };
}

export function updateSession(
  db: Database,
  id: number,
  data: Partial<SessionInput>,
  climbs?: ClimbInput[]
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value ?? null);
  }

  if (fields.length > 0) {
    values.push(id);
    db.run(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`, values as (string | number | null)[]);
  }

  if (climbs !== undefined) {
    // Delete existing climbs and re-insert
    db.run("DELETE FROM climbs WHERE session_id = ?", [id]);
    for (const climb of climbs) {
      insertClimb(db, id, climb);
    }
  }
}

export function deleteSession(db: Database, id: number): void {
  db.run("PRAGMA foreign_keys = ON");
  db.run("DELETE FROM sessions WHERE id = ?", [id]);
}

export function listSessions(
  db: Database,
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    locationId?: number;
    type?: string;
  }
): (Session & { climb_count: number; highest_grade_value: string | null; highest_grade_system: string | null })[] {
  let query = `
    SELECT s.*,
      COUNT(c.id) as climb_count,
      (SELECT c2.grade_value FROM climbs c2 WHERE c2.session_id = s.id ORDER BY c2.grade_value DESC LIMIT 1) as highest_grade_value,
      (SELECT c2.grade_system FROM climbs c2 WHERE c2.session_id = s.id ORDER BY c2.grade_value DESC LIMIT 1) as highest_grade_system
    FROM sessions s
    LEFT JOIN climbs c ON c.session_id = s.id
  `;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.dateFrom) {
    conditions.push("s.date >= ?");
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    conditions.push("s.date <= ?");
    params.push(filters.dateTo);
  }
  if (filters?.locationId) {
    conditions.push("s.location_id = ?");
    params.push(filters.locationId);
  }
  if (filters?.type) {
    conditions.push("s.type = ?");
    params.push(filters.type);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY s.id ORDER BY s.date DESC";

  const result = db.exec(query, params as (string | number | null)[]);
  if (result.length === 0) return [];

  const cols = result[0].columns;
  return result[0].values.map((row) => {
    const session: Record<string, unknown> = {};
    cols.forEach((col, i) => { session[col] = row[i]; });
    return session as unknown as Session & { climb_count: number; highest_grade_value: string | null; highest_grade_system: string | null };
  });
}
