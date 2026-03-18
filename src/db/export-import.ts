import type { Database } from "sql.js";
import { exportDatabase, loadDatabase } from "./init";
import { runMigrations } from "./migrations/runner";

/**
 * Export the database as a downloadable .sqlite file.
 */
export function downloadDatabase(db: Database): void {
  const data = exportDatabase(db);
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/x-sqlite3" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `climbing-journal-${dateStr}.sqlite`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Track last export date
  localStorage.setItem("climbing-journal-last-export", now.toISOString());
}

/**
 * Validate and load a .sqlite file from user upload.
 * Returns the loaded database after running any pending migrations.
 * Throws if the file is not a valid SQLite database.
 */
export async function importDatabase(file: File): Promise<Database> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Validate SQLite magic header: first 16 bytes should start with "SQLite format 3\000"
  const header = new TextDecoder().decode(data.slice(0, 16));
  if (!header.startsWith("SQLite format 3")) {
    throw new Error("File is not a valid SQLite database");
  }

  const db = await loadDatabase(data);

  // Run migrations to upgrade if needed
  runMigrations(db);

  return db;
}

/**
 * Get the number of days since the last database export.
 * Returns Infinity if never exported.
 */
export function daysSinceLastExport(): number {
  const lastExport = localStorage.getItem("climbing-journal-last-export");
  if (!lastExport) return Infinity;

  const lastDate = new Date(lastExport);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a backup reminder should be shown (>14 days since last export).
 */
export function shouldShowBackupReminder(): boolean {
  return daysSinceLastExport() > 14;
}

/**
 * Dismiss the backup reminder until the next export check.
 */
export function dismissBackupReminder(): void {
  // We store a "dismissed until" date — show again after 1 day
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  localStorage.setItem("climbing-journal-reminder-dismissed", tomorrow.toISOString());
}

/**
 * Check if the backup reminder has been dismissed.
 */
export function isBackupReminderDismissed(): boolean {
  const dismissed = localStorage.getItem("climbing-journal-reminder-dismissed");
  if (!dismissed) return false;
  return new Date(dismissed) > new Date();
}
