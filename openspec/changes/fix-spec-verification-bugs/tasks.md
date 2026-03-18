## 1. Fix grade selector stale closure (Critical)

- [x] 1.1 Remove `onValueChange("")` call from `GradeSelector.tsx` `onValueChange` handler (line 53) — system change should only fire `onSystemChange`
- [x] 1.2 Update `ClimbEntryForm.tsx` `onSystemChange` callback to also reset `grade_value` to `""` in the same `onChange` call: `onChange({ ...data, grade_system: s, grade_value: "" })`
- [x] 1.3 Update `ProfileForm.tsx` `onSystemChange` callbacks to also reset the corresponding value field (e.g., `setForm((f) => ({ ...f, current_lead_grade_system: s, current_lead_grade_value: "" }))`) for all three grade selectors
- [x] 1.4 Manually verify: add a climb in a session, select French grade system, confirm grade value dropdown enables and shows French grades, select a grade, save session, confirm grade persists

## 2. Fix date formatting on History and Session Detail pages

- [x] 2.1 In `HistoryPage.tsx`, import `formatDate` from `@/lib/date` and `useTranslation`, replace raw `session.date` with `formatDate(session.date, i18n.language)` at line 156
- [x] 2.2 In `SessionDetailPage.tsx`, import `formatDate` from `@/lib/date` and `useTranslation`, replace raw `session.date` with `formatDate(session.date, i18n.language)` at line 49
- [x] 2.3 Verify both pages show `DD.MM.YYYY` in Polish and `MMM DD, YYYY` in English

## 3. Wire up backup reminder UI

- [x] 3.1 In `DashboardPage.tsx`, import `shouldShowBackupReminder`, `isBackupReminderDismissed`, `dismissBackupReminder` from `@/db/export-import`
- [x] 3.2 Add a `useEffect` on mount that checks `shouldShowBackupReminder() && !isBackupReminderDismissed()` and shows a dismissible toast or inline alert with a link to the profile/export page
- [x] 3.3 Add translation keys for the reminder text in both `pl.json` and `en.json` (e.g., `backup.reminderTitle`, `backup.reminderMessage`, `backup.exportNow`)
- [x] 3.4 Verify: reminder does not appear on fresh app (no export history = no 14-day threshold); future manual test when 14 days pass

## 4. Replace hardcoded strings with i18n keys

- [x] 4.1 Add new translation keys to `pl.json` and `en.json`: `common.min` (min/min), `session.maxGrade` (max:/maks:), `pyramid.leadTopRope` (Lead / Top Rope), `pyramid.boulder` (Boulder), `common.error` (Błąd/Error)
- [x] 4.2 In `HistoryPage.tsx` line 171, replace hardcoded `"min"` with `t("common.min")`
- [x] 4.3 In `HistoryPage.tsx` line 181, replace hardcoded `"max: "` with `t("session.maxGrade")` + ": "
- [x] 4.4 In `PyramidPage.tsx` line 256, replace `"Lead / Top Rope"` with `t("pyramid.leadTopRope")`
- [x] 4.5 In `PyramidPage.tsx` line 257, replace `"Boulder"` with `t("pyramid.boulder")`
- [x] 4.6 In `AppShell.tsx` line 43, replace `"Error: "` with `t("common.error")` + ": "

## 5. Fix highest-grade sorting

- [x] 5.1 In `sessions.ts`, remove the SQL subquery that computes `highest_grade_value` via `ORDER BY grade_value DESC`
- [x] 5.2 Add application-level highest-grade computation: after fetching climbs, use `compareGrades` from `@/grades/utils` to find the max grade across all climbs in each session
- [x] 5.3 Verify: create a session with climbs at 6a and 6b+, confirm history shows 6b+ as highest (not 6a which would win in string sort)

## 6. Final verification

- [x] 6.1 Run `npm run build` to confirm no TypeScript errors
- [x] 6.2 Run `npm test` to confirm no test regressions
- [x] 6.3 Full manual walkthrough: create profile, create session with climbs (grades working), check history dates, check pyramid labels, switch language and reverify
