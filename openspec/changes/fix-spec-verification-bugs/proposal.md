## Why

Spec verification against the app with Playwright revealed 5 bugs where the implementation does not match the OpenSpec requirements. The most critical is that the grade selector in the climb entry form is completely broken due to a stale closure, making it impossible to record grades on climbs. Other issues include unformatted dates, a missing backup reminder UI, hardcoded (untranslated) strings, and incorrect grade sorting in SQL.

## What Changes

- Fix the grade selector stale closure bug in `ClimbEntryForm` so users can actually select grades when logging climbs
- Apply locale-aware date formatting on History and Session Detail pages using the existing `formatDate()` utility
- Wire up the existing backup reminder logic (`shouldShowBackupReminder()` etc.) to a visible UI component
- Replace hardcoded English/Polish strings with `t()` i18n calls in History, Pyramid, and AppShell
- Fix the "highest grade" SQL query to sort by grade difficulty rather than lexicographic string order

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `session-logging`: Fix grade input — the `GradeSelector` callbacks in `ClimbEntryForm` produce a stale closure race that silently discards the selected grade system
- `i18n`: Fix date formatting on 2 pages and replace 5 hardcoded strings with translation keys
- `data-persistence`: Wire up the existing backup reminder functions to a UI notification
- `session-history`: Fix raw date display and incorrect lexicographic grade sorting in the "highest grade" query

## Impact

- **Components**: `ClimbEntryForm.tsx`, `GradeSelector.tsx`, `HistoryPage.tsx`, `SessionDetailPage.tsx`, `PyramidPage.tsx`, `AppShell.tsx`
- **DB operations**: `sessions.ts` (highest grade query)
- **i18n files**: `pl.json`, `en.json` (new translation keys)
- **Utilities**: No new dependencies; uses existing `formatDate()` and `export-import.ts` functions
