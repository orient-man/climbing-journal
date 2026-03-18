import type { Database } from "sql.js";

export interface PyramidEntry {
  grade_system: string;
  grade_value: string;
  count: number;
}

export interface PyramidFilters {
  dateFrom?: string;
  dateTo?: string;
  style?: "lead" | "boulder" | "toprope";
  completionTypes?: string[];
}

export function getGradePyramidData(
  db: Database,
  filters: PyramidFilters
): PyramidEntry[] {
  let query = `
    SELECT c.grade_system, c.grade_value, COUNT(*) as count
    FROM climbs c
    JOIN sessions s ON c.session_id = s.id
    WHERE c.grade_system IS NOT NULL AND c.grade_value IS NOT NULL
  `;

  const params: unknown[] = [];

  if (filters.dateFrom) {
    query += " AND s.date >= ?";
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    query += " AND s.date <= ?";
    params.push(filters.dateTo);
  }
  if (filters.style) {
    query += " AND c.style = ?";
    params.push(filters.style);
  }
  if (filters.completionTypes && filters.completionTypes.length > 0) {
    const placeholders = filters.completionTypes.map(() => "?").join(", ");
    query += ` AND c.completion_type IN (${placeholders})`;
    params.push(...filters.completionTypes);
  }

  query += " GROUP BY c.grade_system, c.grade_value";

  const result = db.exec(query, params as (string | number | null)[]);
  if (result.length === 0) return [];

  return result[0].values.map((row) => ({
    grade_system: row[0] as string,
    grade_value: row[1] as string,
    count: row[2] as number,
  }));
}
