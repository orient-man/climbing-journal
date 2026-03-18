/**
 * Grade system types and ordering tables for climbing grades.
 *
 * Supported systems:
 * - french: French sport climbing grades (4a → 9c)
 * - yds: Yosemite Decimal System (5.5 → 5.15d)
 * - vscale: Hueco V-scale for bouldering (V0 → V17)
 * - font: Fontainebleau bouldering grades (4 → 9a)
 */

export type GradeSystem = "french" | "yds" | "vscale" | "font";

export interface Grade {
  system: GradeSystem;
  value: string;
}

/** Sport climbing systems (for lead and toprope) */
export const SPORT_SYSTEMS: GradeSystem[] = ["french", "yds"];

/** Bouldering systems */
export const BOULDER_SYSTEMS: GradeSystem[] = ["vscale", "font"];

/**
 * French sport climbing grades in ascending order.
 */
export const FRENCH_GRADES: string[] = [
  "4a", "4a+", "4b", "4b+", "4c", "4c+",
  "5a", "5a+", "5b", "5b+", "5c", "5c+",
  "6a", "6a+", "6b", "6b+", "6c", "6c+",
  "7a", "7a+", "7b", "7b+", "7c", "7c+",
  "8a", "8a+", "8b", "8b+", "8c", "8c+",
  "9a", "9a+", "9b", "9b+", "9c",
];

/**
 * YDS (Yosemite Decimal System) grades in ascending order.
 */
export const YDS_GRADES: string[] = [
  "5.5", "5.6", "5.7", "5.8", "5.9",
  "5.10a", "5.10b", "5.10c", "5.10d",
  "5.11a", "5.11b", "5.11c", "5.11d",
  "5.12a", "5.12b", "5.12c", "5.12d",
  "5.13a", "5.13b", "5.13c", "5.13d",
  "5.14a", "5.14b", "5.14c", "5.14d",
  "5.15a", "5.15b", "5.15c", "5.15d",
];

/**
 * V-scale (Hueco) bouldering grades in ascending order.
 */
export const VSCALE_GRADES: string[] = [
  "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8",
  "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17",
];

/**
 * Fontainebleau bouldering grades in ascending order.
 */
export const FONT_GRADES: string[] = [
  "4", "4+",
  "5", "5+",
  "6a", "6a+", "6b", "6b+", "6c", "6c+",
  "7a", "7a+", "7b", "7b+", "7c", "7c+",
  "8a", "8a+", "8b", "8b+", "8c", "8c+",
  "9a",
];

/**
 * Map from grade system to its ordered grade list.
 */
export const GRADE_TABLES: Record<GradeSystem, string[]> = {
  french: FRENCH_GRADES,
  yds: YDS_GRADES,
  vscale: VSCALE_GRADES,
  font: FONT_GRADES,
};

/**
 * Get the list of grades for a given system.
 */
export function getGradesForSystem(system: GradeSystem): string[] {
  return GRADE_TABLES[system];
}

/**
 * Get the systems appropriate for a climbing style.
 */
export function getSystemsForStyle(style: "lead" | "toprope" | "boulder"): GradeSystem[] {
  if (style === "boulder") {
    return BOULDER_SYSTEMS;
  }
  return SPORT_SYSTEMS;
}
