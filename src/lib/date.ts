/**
 * Format a date string (YYYY-MM-DD) according to the current locale.
 * PL: DD.MM.YYYY
 * EN: MMM DD, YYYY
 */
export function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return dateStr;

  if (locale === "pl") {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  // EN format: MMM DD, YYYY
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
