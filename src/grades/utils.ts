import { GRADE_TABLES, type Grade, type GradeSystem } from "./tables";

/**
 * Get the index (ordinal position) of a grade within its system.
 * Returns -1 if the grade is not found.
 */
export function getGradeIndex(system: GradeSystem, value: string): number {
  return GRADE_TABLES[system].indexOf(value);
}

/**
 * Compare two grades within the same system.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 * Returns 0 if grades are from different systems (not comparable).
 */
export function compareGrades(a: Grade, b: Grade): number {
  if (a.system !== b.system) return 0;

  const indexA = getGradeIndex(a.system, a.value);
  const indexB = getGradeIndex(b.system, b.value);

  return indexA - indexB;
}

/**
 * Sort an array of grades in ascending order.
 * Only works correctly for grades within the same system.
 * Returns a new sorted array (does not mutate the input).
 */
export function sortGrades(grades: Grade[]): Grade[] {
  return [...grades].sort(compareGrades);
}

/**
 * Format a grade for display.
 * Simply returns the grade value string.
 */
export function formatGrade(grade: Grade | null | undefined): string {
  if (!grade) return "";
  return grade.value;
}
