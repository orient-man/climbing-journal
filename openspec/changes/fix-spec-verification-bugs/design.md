## Context

The app was verified against its OpenSpec specifications using Playwright browser automation. Five bugs were found where the implementation deviates from the specs. All bugs are in existing code — no new architecture is needed. The fixes are localized to specific components and one SQL query.

The most critical bug is a stale closure in `ClimbEntryForm.tsx` that prevents grade selection entirely. The `GradeSelector` component fires `onSystemChange` and `onValueChange` synchronously, but `ClimbEntryForm` builds both callbacks with the same stale `data` prop reference, so the second call overwrites the first. The identical component (`ProfileForm`) avoids this by using React's functional updater pattern.

## Goals / Non-Goals

**Goals:**
- Fix the grade selector so users can select grades when logging climbs
- Apply locale-aware date formatting consistently across all pages
- Surface the backup reminder notification that is already implemented at the data layer
- Replace all hardcoded user-visible strings with `t()` calls
- Fix the highest-grade SQL query to sort by actual grade difficulty

**Non-Goals:**
- Refactoring the `GradeSelector` component API (the fix is in the consumer, not the component)
- Adding new features or capabilities
- Changing the visual design of any page

## Decisions

### D1: Fix grade selector via `onSystemChange` callback batching in GradeSelector

**Decision**: Modify `GradeSelector.tsx` so that `onSystemChange` resets the value internally rather than calling both `onSystemChange` and `onValueChange` separately.

Change the handler from:
```
onSystemChange(val);
onValueChange("");
```
To a single `onSystemChange` call, and have `onSystemChange` in each consumer also reset the value. In `ClimbEntryForm`, the callback becomes:
```
onSystemChange={(s) => onChange({ ...data, grade_system: s, grade_value: "" })}
```
And remove the `onValueChange("")` call from `GradeSelector`.

**Alternative considered**: Change `ClimbEntryForm` to use functional updaters like `ProfileForm`. Rejected because `ClimbEntryForm` doesn't own its state — it receives `data` as a prop and calls `onChange`. There's no `setState` to use a functional updater with. The fix belongs in `GradeSelector` where both callbacks are fired.

**Alternative considered**: Add an `onSystemAndValueChange` combined callback. Rejected as over-engineering for this case.

### D2: Reuse existing `formatDate()` utility for History and Session Detail

**Decision**: Import and call `formatDate(session.date, i18n.language)` in `HistoryPage.tsx` and `SessionDetailPage.tsx`, exactly as `DashboardPage.tsx` already does.

### D3: Show backup reminder as a toast on DashboardPage

**Decision**: Add backup reminder check to `DashboardPage.tsx` (the landing page). On mount, call `shouldShowBackupReminder()` and `isBackupReminderDismissed()`. If a reminder is due, show a dismissible toast with an export link. Dismissal calls `dismissBackupReminder()`.

**Alternative considered**: Adding it to `AppShell.tsx` so it shows on every page. Rejected because the dashboard is the natural landing page and a persistent reminder on every page would be intrusive.

### D4: Use grade utility functions for highest-grade sorting

**Decision**: Replace the SQL `ORDER BY grade_value DESC` with application-level sorting using the existing `compareGrades` utility from `grades/utils.ts`. After fetching climbs for a session, find the highest grade in TypeScript where the grade comparison logic already exists and is tested.

**Alternative considered**: Implement grade ordering in SQL with a CASE expression. Rejected because the grade tables are already defined in TypeScript (`grades/tables.ts`) and duplicating that ordering in SQL would be fragile and hard to maintain.

### D5: Add missing translation keys

**Decision**: Add new keys to both `pl.json` and `en.json` for the 5 hardcoded strings, then replace the literals with `t()` calls.

## Risks / Trade-offs

- **[D1 changes GradeSelector API behavior]** Removing `onValueChange("")` from `GradeSelector` means all consumers must reset the value themselves in `onSystemChange`. Currently only `ProfileForm` and `ClimbEntryForm` use it, and both will be updated. Risk is low. → Verify no other consumers exist.
- **[D4 adds application-level sorting]** Moving highest-grade computation from SQL to TypeScript means the query returns all climb grades per session instead of one. For a personal journal app with small datasets, this has zero performance impact. → Acceptable trade-off.
