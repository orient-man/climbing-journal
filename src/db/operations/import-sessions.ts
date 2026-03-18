import type { Database } from "sql.js";
import { createLocation, listLocations } from "./locations";
import { createSession } from "./sessions";
import type { ClimbInput } from "./sessions";

/**
 * Suffix-to-climb mapping for the custom import format.
 *
 * Suffixes are checked in order — longer/more specific first to avoid
 * partial matches (e.g. "BLS+" before "BLS", "BW" before "BL").
 */
const SUFFIX_MAP: {
  suffix: string;
  style: "toprope" | "boulder";
  gradeSystem: "french";
  routeName: string;
}[] = [
  { suffix: "BLS+", style: "boulder", gradeSystem: "french", routeName: "BLS+" },
  { suffix: "BLS", style: "boulder", gradeSystem: "french", routeName: "BLS" },
  { suffix: "BW", style: "toprope", gradeSystem: "french", routeName: "BW" },
  { suffix: "BL", style: "boulder", gradeSystem: "french", routeName: "BL" },
  { suffix: "W", style: "toprope", gradeSystem: "french", routeName: "W" },
];

interface ParsedClimb {
  grade: string;
  suffix: string;
  style: "toprope" | "boulder";
  gradeSystem: "french";
  routeName: string;
}

interface ParsedSession {
  location: string;
  date: string;
  climbs: ParsedClimb[];
}

/**
 * Parse a single climb token like "6aBW" or "5c+BLS+".
 * Returns the parsed climb data or null if unparseable.
 */
export function parseClimbToken(token: string): ParsedClimb | null {
  for (const mapping of SUFFIX_MAP) {
    if (token.endsWith(mapping.suffix)) {
      const grade = token.slice(0, -mapping.suffix.length);
      if (grade.length === 0) return null;
      return {
        grade,
        suffix: mapping.suffix,
        style: mapping.style,
        gradeSystem: mapping.gradeSystem,
        routeName: mapping.routeName,
      };
    }
  }
  return null;
}

/**
 * Parse a session line like "Camp4 - 2025-10-08 - 6aBW/5c+W/5cBL".
 * Returns parsed session data or null if the line is not a session line.
 */
export function parseSessionLine(line: string): ParsedSession | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("//")) return null;

  const parts = trimmed.split(" - ");
  if (parts.length !== 3) return null;

  const location = parts[0].trim();
  const date = parts[1].trim();
  const climbsStr = parts[2].trim();

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const tokens = climbsStr.split("/");
  const climbs: ParsedClimb[] = [];

  for (const token of tokens) {
    const parsed = parseClimbToken(token.trim());
    if (!parsed) return null;
    climbs.push(parsed);
  }

  if (climbs.length === 0) return null;

  return { location, date, climbs };
}

/**
 * Parse the full import text (multi-line format from import-sessions.md).
 * Skips legend lines and blank lines, parses only session lines.
 */
export function parseImportText(text: string): ParsedSession[] {
  const lines = text.split("\n");
  const sessions: ParsedSession[] = [];

  for (const line of lines) {
    const parsed = parseSessionLine(line);
    if (parsed) {
      sessions.push(parsed);
    }
  }

  return sessions;
}

export interface ImportResult {
  sessionsCreated: number;
  climbsCreated: number;
  locationsCreated: string[];
}

/**
 * Import sessions from parsed data into the database.
 * Creates locations as needed (type: "gym"), then creates sessions with climbs.
 */
export function importSessions(
  db: Database,
  sessions: ParsedSession[]
): ImportResult {
  const locationCache = new Map<string, number>();
  const locationsCreated: string[] = [];

  // Pre-populate cache with existing locations
  for (const loc of listLocations(db)) {
    locationCache.set(loc.name, loc.id);
  }

  let totalClimbs = 0;

  for (const session of sessions) {
    // Ensure location exists
    if (!locationCache.has(session.location)) {
      const id = createLocation(db, {
        name: session.location,
        type: "gym",
      });
      locationCache.set(session.location, id);
      locationsCreated.push(session.location);
    }

    const locationId = locationCache.get(session.location)!;

    const climbs: ClimbInput[] = session.climbs.map((c, index) => ({
      route_name: c.routeName,
      grade_system: c.gradeSystem,
      grade_value: c.grade,
      style: c.style,
      completion_type: "redpoint",
      sort_order: index,
    }));

    createSession(
      db,
      {
        date: session.date,
        location_id: locationId,
        type: "mixed",
      },
      climbs
    );

    totalClimbs += climbs.length;
  }

  return {
    sessionsCreated: sessions.length,
    climbsCreated: totalClimbs,
    locationsCreated,
  };
}

/**
 * Convenience function: parse text and import in one step.
 */
export function parseAndImport(
  db: Database,
  text: string
): ImportResult {
  const sessions = parseImportText(text);
  return importSessions(db, sessions);
}
